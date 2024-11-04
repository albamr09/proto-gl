import { loadData } from "../../lib/files.js";
import {
  rgbToHex,
  denormalizeColor,
  hexToRgb,
  normalizeColor,
} from "../../lib/colors.js";
import {
  createCheckboxInputForm,
  createColorInputForm,
  createDescriptionPanel,
  createSliderInputForm,
  initController,
  initGUI,
} from "../../lib/gui/index.js";
import { calculateNormals } from "../../lib/math/3d.js";
import { Matrix4 } from "../../lib/math/matrix.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera, {
  CAMERA_TYPE,
  PROJECTION_TYPE,
} from "../../lib/webgl/camera.js";
import Controller from "../../lib/webgl/controller.js";
import Instance from "../../lib/webgl/instance.js";
import Axis from "../../lib/webgl/models/axis/index.js";
import Floor from "../../lib/webgl/models/floor/index.js";
import Scene from "../../lib/webgl/scene.js";
import { UniformType } from "../../lib/webgl/uniforms.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;
let sphereColor: number[];
let sphereAlpha = 1;
let coneColor: number[];
let coneAlpha = 1;

const initProgram = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CAMERA_TYPE.ORBITING,
    PROJECTION_TYPE.PERSPECTIVE,
    gl,
    scene
  );
  new Controller({ camera, canvas });
  camera.setPosition(new Vector([0, 5, 35]));
  camera.setAzimuth(-25);
  camera.setElevation(-25);
};

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uMaterialDiffuse",
  "uLightAmbient",
  "uLightDiffuse",
  "uLightPosition",
  "uUseLambert",
  "uTransform",
] as const;

const initData = () => {
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
  scene.add(new Axis({ gl, dimension: 82 }));
  const lightUniforms = {
    uLightPosition: {
      data: [0, 5, 20],
      type: UniformType.VECTOR_FLOAT,
    },
    uLightAmbient: {
      data: [1, 1, 1, 1],
      type: UniformType.VECTOR_FLOAT,
    },
    uLightDiffuse: {
      data: [1, 1, 1, 1],
      type: UniformType.VECTOR_FLOAT,
    },
  };
  loadData("/data/models/geometries/cone3.json").then((data) => {
    const { diffuse, vertices, indices } = data;
    coneColor = diffuse.slice(0, 3);
    scene.add(
      new Instance<typeof attributes, typeof uniforms>({
        id: "cone",
        gl,
        vertexShaderSource,
        fragmentShaderSource,
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
          uMaterialDiffuse: {
            data: diffuse,
            type: UniformType.VECTOR_FLOAT,
          },
          uUseLambert: {
            data: true,
            type: UniformType.INT,
          },
          uTransform: {
            data: Matrix4.identity()
              .translate(new Vector([0, 0, -3.5]))
              .toFloatArray(),
            type: UniformType.MATRIX,
          },
          ...lightUniforms,
        },
        indices,
      })
    );
  });
  loadData("/data/models/geometries/sphere2.json").then((data) => {
    const { diffuse, vertices, indices } = data;
    sphereColor = diffuse.slice(0, 3);
    scene.add(
      new Instance<typeof attributes, typeof uniforms>({
        id: "sphere",
        gl,
        vertexShaderSource,
        fragmentShaderSource,
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
          uMaterialDiffuse: {
            data: diffuse,
            type: UniformType.VECTOR_FLOAT,
          },
          uUseLambert: {
            data: true,
            type: UniformType.INT,
          },
          uTransform: {
            data: Matrix4.identity()
              .scale(new Vector([0.5, 0.5, 0.5]))
              .translate(new Vector([0, 0, 2.5]))
              .toFloatArray(),
            type: UniformType.MATRIX,
          },
          ...lightUniforms,
        },
        indices,
      })
    );
  });
};

const draw = () => {
  scene.render();
};

const render = () => {
  draw();
  requestAnimationFrame(render);
};

const initControls = () => {
  initController();
  createCheckboxInputForm({
    label: "Blending",
    value: true,
    onInit: (v) => {
      if (v) {
        gl.enable(gl.BLEND);
      } else {
        gl.disable(gl.BLEND);
      }
    },
    onChange: (v) => {
      if (v) {
        gl.enable(gl.BLEND);
      } else {
        gl.disable(gl.BLEND);
      }
    },
  });
  createCheckboxInputForm({
    label: "Depth Test",
    value: true,
    onInit: (v) => {
      if (v) {
        gl.enable(gl.DEPTH_TEST);
      } else {
        gl.disable(gl.DEPTH_TEST);
      }
    },
    onChange: (v) => {
      if (v) {
        gl.enable(gl.DEPTH_TEST);
      } else {
        gl.disable(gl.DEPTH_TEST);
      }
    },
  });
  createCheckboxInputForm({
    label: "Use Lambert Term",
    value: true,
    onChange: (v) => {
      scene.updateUniform("uUseLambert", v);
    },
  });
  createColorInputForm({
    label: "Sphere Color",
    value: rgbToHex(denormalizeColor(sphereColor ?? [0, 0, 0])),
    onChange: (v) => {
      const color = normalizeColor(hexToRgb(v));
      sphereColor = color;
      scene.updateUniform(
        "uMaterialDiffuse",
        [...color, sphereAlpha],
        "sphere"
      );
    },
  });
  createSliderInputForm({
    label: "Sphere Alpha",
    value: sphereAlpha,
    min: 0,
    max: 1,
    step: 0.1,
    onChange: (v) => {
      sphereAlpha = v;
      scene.updateUniform("uMaterialDiffuse", [...sphereColor, v], "sphere");
    },
  });
  createColorInputForm({
    label: "Cone Color",
    value: rgbToHex(denormalizeColor(coneColor ?? [0, 0, 0])),
    onChange: (v) => {
      const color = normalizeColor(hexToRgb(v));
      coneColor = color;
      scene.updateUniform("uMaterialDiffuse", [...color, coneAlpha], "cone");
    },
  });
  createSliderInputForm({
    label: "Cone Alpha",
    value: coneAlpha,
    min: 0,
    max: 1,
    step: 0.1,
    onChange: (v) => {
      coneAlpha = v;
      scene.updateUniform("uMaterialDiffuse", [...coneColor, v], "cone");
    },
  });
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "In this example we will see how different blending configuration changes the scene"
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
