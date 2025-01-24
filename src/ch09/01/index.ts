import {
  createColorInputForm,
  createDescriptionPanel,
  createNumericInput,
  initController,
  initGUI,
} from "../../lib/gui/index.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera from "../../lib/webgl/core/camera/camera.js";
import {
  CameraType,
  ProjectionType,
} from "../../lib/webgl/core/camera/types.js";
import Controller from "../../lib/webgl/core/events/controller.js";
import Floor from "../../lib/webgl/models/floor/index.js";
import Scene from "../../lib/webgl/rendering/scene.js";
import { loadData } from "../../lib/files.js";
import Instance from "../../lib/webgl/rendering/instance.js";
import vertexShaderSource from "./vs.gsls.js";
import fragmentShaderSource from "./fs.gsls.js";
import { Vector } from "../../lib/math/vector.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";
import { calculateNormals } from "../../lib/math/3d.js";
import {
  denormalizeColor,
  hexToRgb,
  normalizeColor,
  rgbToHex,
} from "../../lib/colors.js";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let shininessValue = 0.5;
const paintAlias = "BMW";

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uLightPositions",
  "uLightAmbient",
  "uLightDiffuseColors",
  "uLightSpecularColors",
  "uMaterialDiffuse",
  "uMaterialAmbient",
  "uMaterialSpecular",
  "uShininess",
  "uIlluminationType",
  "uAlpha",
] as const;

const initProgram = () => {
  scene = new Scene(gl);
  const camera = new Camera(
    CameraType.ORBITING,
    ProjectionType.PERSPECTIVE,
    gl,
    scene
  );
  new Controller({ camera, canvas });
  camera.setPosition(new Vector([0, 0.5, 5]));
  camera.setAzimuth(-25);
  camera.setElevation(-10);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};

const generateLightColors = () => {
  return Array.from({ length: 16 }).map(() => Math.random());
};

const diffuseLightColors = generateLightColors();
const specularLightColors = generateLightColors();

const initData = () => {
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));

  const lightPositions = {
    farLeft: [-1000, 1000, -1000],
    farRight: [1000, 1000, -1000],
    nearLeft: [-1000, 1000, 1000],
    nearRight: [1000, 1000, 1000],
  };

  for (let i = 1; i < 25; i++) {
    loadData(`/data/models/bmw-i8/part${i}.json`).then((data) => {
      const {
        alias: id,
        vertices,
        indices,
        Ka: ambient,
        Kd: diffuse,
        Ks: specular,
        illum,
        d: alpha,
        Ns: shininess,
      } = data;

      const instance = new Instance<typeof attributes, typeof uniforms>({
        id,
        gl,
        vertexShaderSource,
        fragmentShaderSource,
        indices,
        attributes: {
          aPosition: {
            data: vertices,
            size: 3,
            type: gl.FLOAT,
          },
          aNormal: {
            data: calculateNormals(vertices, indices, 3),
            size: 3,
            type: gl.FLOAT,
          },
        },
        uniforms: {
          uLightPositions: {
            data: [
              lightPositions.farLeft,
              lightPositions.farRight,
              lightPositions.nearLeft,
              lightPositions.nearRight,
            ].flat(),
            size: 3,
            type: UniformKind.VECTOR_FLOAT,
          },
          uLightAmbient: {
            data: [0, 0, 0, 1],
            type: UniformKind.VECTOR_FLOAT,
          },
          uLightDiffuseColors: {
            data: diffuseLightColors,
            type: UniformKind.VECTOR_FLOAT,
            size: 4,
          },
          uLightSpecularColors: {
            data: specularLightColors,
            type: UniformKind.VECTOR_FLOAT,
            size: 4,
          },
          uMaterialDiffuse: {
            data: [...diffuse, 1.0],
            type: UniformKind.VECTOR_FLOAT,
          },
          uMaterialAmbient: {
            data: [...ambient, 1.0],
            type: UniformKind.VECTOR_FLOAT,
          },
          uMaterialSpecular: {
            data: [...specular, 1.0],
            type: UniformKind.VECTOR_FLOAT,
          },
          uShininess: {
            data: shininess,
            type: UniformKind.SCALAR_FLOAT,
          },
          uIlluminationType: {
            data: illum,
            type: UniformKind.SCALAR_INT,
          },
          uAlpha: {
            data: alpha,
            type: UniformKind.SCALAR_FLOAT,
          },
        },
      });
      scene.add(instance);
    });
  }
};

const updateInstancesWithPaintAttribute = (
  cb: (instance: Instance<any, any>) => void
) => {
  scene.getInstances().forEach((instance) => {
    if (instance.getId()?.includes(paintAlias)) {
      cb(instance);
    }
  });
};

const getSubArray = (originalArray: number[], start: number, size = 4) => {
  return originalArray.slice(start, start + size);
};

const initControls = () => {
  initController();
  createColorInputForm({
    label: "Car color",
    value: "#ffffff",
    onChange: (v) => {
      updateInstancesWithPaintAttribute((instance) => {
        const newColor = normalizeColor(hexToRgb(v));
        instance.updateUniform("uMaterialDiffuse", [...newColor, 1]);
      });
    },
  });
  createNumericInput({
    label: "Specular Color",
    value: shininessValue,
    min: 0,
    max: 50,
    step: 0.01,
    onChange: (v) => {
      updateInstancesWithPaintAttribute((instance) => {
        instance.updateUniform("uMaterialSpecular", [v, v, v, 1]);
      });
    },
  });
  ["Far Left", "Far Right", "Near Left", "Near Right"].forEach(
    (label, index) => {
      createLightColorController(label, index);
    }
  );
};

const createLightColorController = (label: string, index: number) => {
  createColorInputForm({
    label: `${label} Diffuse Color`,
    value: rgbToHex(
      denormalizeColor(getSubArray(diffuseLightColors, index * 4))
    ),
    onChange: (v) => {
      updateLightColor(v, index, "uLightDiffuseColors");
    },
  });
  createColorInputForm({
    label: `${label} Specular Color`,
    value: rgbToHex(
      denormalizeColor(getSubArray(specularLightColors, index * 4))
    ),
    onChange: (v) => {
      updateLightColor(v, index, "uLightSpecularColors");
    },
  });
};

const updateLightColor = (
  value: string,
  index: number,
  lightUniformName: "uLightDiffuseColors" | "uLightSpecularColors"
) => {
  scene.getInstances().forEach((instance) => {
    const ligthDiffuseColors = instance
      .getUniform("uLightDiffuseColors")
      ?.getData() as number[];
    if (!ligthDiffuseColors) return;
    const newColor = normalizeColor(hexToRgb(value));
    const newArrayColors = replaceArrayValues(
      ligthDiffuseColors,
      [...newColor, 1],
      index * 4
    );
    instance.updateUniform(lightUniformName, newArrayColors);
  });
};

const replaceArrayValues = (
  array: number[],
  newValues: number[],
  start: number
) => {
  const arrayCopy = [...array];
  arrayCopy.splice(start, start + newValues.length, ...newValues);
  return arrayCopy;
};

const render = () => {
  requestAnimationFrame(render);
  scene.render();
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we will create a demo application using our WebGL library."
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initProgram();
  initData();
  render();
  initControls();
};

window.onload = init;
