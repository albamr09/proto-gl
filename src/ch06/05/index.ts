import { loadData } from "../../lib/files.js";
import {
  createDescriptionPanel,
  createNumericInput,
  createSliderInputForm,
  createVector3dSliders,
  initController,
  initGUI,
} from "../../lib/gui/index.js";
import { calculateNormals } from "../../lib/math/3d.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera from "../../lib/webgl/camera.js";
import { CAMERA_TYPE, PROJECTION_TYPE } from "../../lib/webgl/types.js";
import Controller from "../../lib/webgl/controller.js";
import Instance from "../../lib/webgl/instance.js";
import Axis from "../../lib/webgl/models/axis/index.js";
import Floor from "../../lib/webgl/models/floor/index.js";
import Scene from "../../lib/webgl/scene.js";
import { UniformType } from "../../lib/webgl/types.js";
import fragmentShaderSource from "./lights/fs.glsl.js";
import vertexShaderSource from "./lights/vs.glsl.js";
import wallVS from "./wall/vs.glsl.js";
import wallFS from "./wall/fs.glsl.js";

let canvas: HTMLCanvasElement;
let gl: WebGL2RenderingContext;
let scene: Scene;
let camera: Camera;

let redLightPosition = [0, 7, 3];
let greenLightPosition = [2.5, 3, 3];
let blueLightPosition = [-2.5, 3, 3];
const redColor = [1, 0, 0, 1];
const greenColor = [0, 1, 0, 1];
const blueColor = [0, 0, 1, 1];
const lightCutOff = 0.75;
let redLightDirection = [0, -2, -0.1];
let greenLightDirection = [-0.5, 1, -0.1];
let blueLightDirection = [0.5, 1, -0.1];

const LightAttributes = ["aPos"] as const;
const LightUniforms = ["uMaterialDiffuse", "uTranslate"] as const;

const WallAttributes = ["aPos", "aNormal"] as const;
const WallUniforms = [
  "uMaterialDiffuse",
  "uMaterialAmbient",
  "uLightAmbient",
  "uLightCutOff",
  "uLightPositions",
  "uLightDirections",
  "uLightColors",
  "uLightCutOff",
] as const;

const initScene = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CAMERA_TYPE.ORBITING,
    PROJECTION_TYPE.PERSPECTIVE,
    gl,
    scene
  );
  camera.setPosition(new Vector([0, 5, 40]));
  camera.setAzimuth(0);
  camera.setElevation(3);
  new Controller({ camera, canvas });
};

const initData = () => {
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
  scene.add(new Axis({ gl, dimension: 82 }));
  const lightUniforms = {
    uLightAmbient: {
      data: [1, 1, 1, 1],
      type: UniformType.VECTOR_FLOAT,
    },
  };
  // Load wall
  loadData("/data/models/geometries/wall.json").then((data) => {
    const { vertices, indices, ambient, diffuse } = data;
    scene.add(
      new Instance<typeof WallAttributes, typeof WallUniforms>({
        id: "wall",
        gl,
        vertexShaderSource: wallVS,
        fragmentShaderSource: wallFS,
        attributes: {
          aPos: {
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
          uMaterialAmbient: {
            data: ambient,
            type: UniformType.VECTOR_FLOAT,
          },
          uLightPositions: {
            data: [
              ...redLightPosition,
              ...greenLightPosition,
              ...blueLightPosition,
            ],
            type: UniformType.VECTOR_FLOAT,
            size: 3,
          },
          uLightDirections: {
            data: [
              ...redLightDirection,
              ...greenLightDirection,
              ...blueLightDirection,
            ],
            type: UniformType.VECTOR_FLOAT,
            size: 3,
          },
          ...lightUniforms,
          uLightColors: {
            data: [...redColor, ...greenColor, ...blueColor],
            type: UniformType.VECTOR_FLOAT,
            size: 4,
          },
          uLightCutOff: {
            data: lightCutOff,
            type: UniformType.FLOAT,
          },
        },
        indices,
      })
    );
  });
  // Load lights
  loadData("/data/models/geometries/sphere3.json").then((data) => {
    const { vertices, indices } = data;
    const commonArgs = {
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      attributes: {
        aPos: {
          data: vertices,
          size: 3,
          type: gl.FLOAT,
        },
      },
      indices,
    };
    scene.add(
      new Instance<typeof LightAttributes, typeof LightUniforms>({
        id: "red-light",
        ...commonArgs,
        uniforms: {
          uMaterialDiffuse: {
            data: redColor,
            type: UniformType.VECTOR_FLOAT,
          },
          uTranslate: {
            data: redLightPosition,
            type: UniformType.VECTOR_FLOAT,
          },
        },
      })
    );
    scene.add(
      new Instance<typeof LightAttributes, typeof LightUniforms>({
        id: "green-light",
        ...commonArgs,
        uniforms: {
          uMaterialDiffuse: {
            data: greenColor,
            type: UniformType.VECTOR_FLOAT,
          },
          uTranslate: {
            data: greenLightPosition,
            type: UniformType.VECTOR_FLOAT,
          },
        },
      })
    );
    scene.add(
      new Instance<typeof LightAttributes, typeof LightUniforms>({
        id: "blue-light",
        ...commonArgs,
        uniforms: {
          uMaterialDiffuse: {
            data: blueColor,
            type: UniformType.VECTOR_FLOAT,
          },
          uTranslate: {
            data: blueLightPosition,
            type: UniformType.VECTOR_FLOAT,
          },
        },
      })
    );
  });
};

const render = () => {
  scene.render();
  requestAnimationFrame(render);
};

const initControls = () => {
  initController();
  createVector3dSliders({
    labels: ["Red Light X", "Red Light Y", "Red Light Z"],
    value: redLightPosition,
    min: -100,
    max: 100,
    step: 1,
    onChange(v) {
      redLightPosition = v;
      scene.updateUniform("uTranslate", v, "red-light");
      scene.updateUniform(
        "uLightPositions",
        [...v, ...greenLightPosition, ...blueLightPosition],
        "wall"
      );
    },
  });
  createVector3dSliders({
    labels: ["Green Light X", "Green Light Y", "Green Light Z"],
    value: greenLightPosition,
    min: -100,
    max: 100,
    step: 1,
    onChange(v) {
      greenLightPosition = v;
      scene.updateUniform("uTranslate", v, "green-light");
      scene.updateUniform(
        "uLightPositions",
        [...redLightPosition, ...v, ...blueLightPosition],
        "wall"
      );
    },
  });
  createVector3dSliders({
    labels: ["Blue Light X", "Blue Light Y", "Blue Light Z"],
    value: blueLightPosition,
    min: -100,
    max: 100,
    step: 1,
    onChange(v) {
      blueLightPosition = v;
      scene.updateUniform("uTranslate", v, "blue-light");
      scene.updateUniform(
        "uLightPositions",
        [...redLightPosition, ...greenLightPosition, ...v],
        "wall"
      );
    },
  });
  createVector3dSliders({
    labels: [
      "Red Light Direction X",
      "Red Light Direction Y",
      "Red Light Direction Z",
    ],
    value: redLightDirection,
    min: -100,
    max: 100,
    step: 1,
    onChange(v) {
      redLightDirection = v;
      scene.updateUniform(
        "uLightDirections",
        [...v, ...greenLightDirection, ...blueLightDirection],
        "wall"
      );
    },
  });
  createVector3dSliders({
    labels: [
      "Green Light Direction X",
      "Green Light Direction Y",
      "Green Light Direction Z",
    ],
    value: greenLightDirection,
    min: -100,
    max: 100,
    step: 1,
    onChange(v) {
      greenLightDirection = v;
      scene.updateUniform(
        "uLightDirections",
        [...redLightDirection, ...v, ...blueLightDirection],
        "wall"
      );
    },
  });
  createVector3dSliders({
    labels: [
      "Blue Direction Light X",
      "Blue Light Direction Y",
      "Blue Light Direction Z",
    ],
    value: blueLightDirection,
    min: -100,
    max: 100,
    step: 1,
    onChange(v) {
      blueLightDirection = v;
      scene.updateUniform("uTranslate", v, "blue-light");
      scene.updateUniform(
        "uLightDirections",
        [...redLightDirection, ...greenLightDirection, ...v],
        "wall"
      );
    },
  });
  createSliderInputForm({
    label: "Light Cutoff",
    value: lightCutOff,
    max: 1,
    min: 0,
    step: 0.1,
    onChange: (v) => {
      scene.updateUniform("uLightCutOff", v, "wall");
    },
  });
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "In this example we will show how to use spotlights or what we call directional point lights. . But with a twist! We know add an attenuation factor based on the angle between the light and the surface that makes for a more realistic effect."
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initScene();
  initData();
  render();
  initControls();
};

window.onload = init;
