import {
  createCheckboxInputForm,
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

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let shininessValue = 0.5;

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uLightPositions",
  "uLightAmbient",
  "uLightDiffuse",
  "uLightSpecular",
  "uMaterialDiffuse",
  "uMaterialAmbient",
  "uMaterialSpecular",
  "uShininess",
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
};

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
        vertices,
        indices,
        Ka: ambient,
        Kd: diffuse,
        Ks: specular,
      } = data;

      const instance = new Instance<typeof attributes, typeof uniforms>({
        id: `model${i}`,
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
          uLightDiffuse: {
            data: [0.4, 0.4, 0.4, 1],
            type: UniformKind.VECTOR_FLOAT,
          },
          uLightSpecular: {
            data: [0.8, 0.8, 0.8, 1],
            type: UniformKind.VECTOR_FLOAT,
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
            data: shininessValue,
            type: UniformKind.SCALAR_FLOAT,
          },
        },
      });
      scene.add(instance);
    });
  }
};

const initControls = () => {
  initController();
  createNumericInput({
    label: "Shininess",
    value: shininessValue,
    min: 0,
    max: 1,
    step: 0.01,
    onChange: (v) => {
      shininessValue = v;
      scene.updateUniform("uShininess", shininessValue);
    },
  });
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
