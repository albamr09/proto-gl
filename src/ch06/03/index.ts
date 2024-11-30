import { loadData } from "../../lib/files.js";
import {
  createDescriptionPanel,
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
import Camera from "../../lib/webgl/camera/camera.js";
import { CameraType, ProjectionType } from "../../lib/webgl/camera/types.js";
import Controller from "../../lib/webgl/camera/controller.js";
import Instance from "../../lib/webgl/rendering/instance.js";
import Axis from "../../lib/webgl/models/axis/index.js";
import Floor from "../../lib/webgl/models/floor/index.js";
import Scene from "../../lib/webgl/rendering/scene.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";
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
let blueLightPosition = [1.5, 6, 3];
let whiteLightPosition = [4, 8, 3];
const redColor = [1, 0, 0, 1];
const greenColor = [0, 1, 0, 1];
const blueColor = [0, 0, 1, 1];
const whiteColor = [1, 1, 1, 1];
const lightCutOff = 0.5;

const LightAttributes = ["aPos"] as const;
const LightUniforms = ["uMaterialDiffuse", "uTranslate"] as const;

const WallAttributes = ["aPos", "aNormal"] as const;
const WallUniforms = [
  "uMaterialDiffuse",
  "uMaterialAmbient",
  "uLightAmbient",
  "uLightCutOff",
  "uLightPositions",
  "uLightColors",
  "uLightCutOff",
] as const;

const initScene = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CameraType.ORBITING,
    ProjectionType.PERSPECTIVE,
    gl,
    scene
  );
  camera.setPosition(new Vector([0, 5, 30]));
  camera.setAzimuth(0);
  camera.setElevation(-3);
  new Controller({ camera, canvas });
};

const initData = () => {
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
  scene.add(new Axis({ gl, dimension: 82 }));
  const lightUniforms = {
    uLightAmbient: {
      data: [1, 1, 1, 1],
      type: UniformKind.VECTOR_FLOAT,
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
            type: UniformKind.VECTOR_FLOAT,
          },
          uMaterialAmbient: {
            data: ambient,
            type: UniformKind.VECTOR_FLOAT,
          },
          uLightPositions: {
            data: [
              ...redLightPosition,
              ...greenLightPosition,
              ...blueLightPosition,
              ...whiteLightPosition,
            ],
            type: UniformKind.VECTOR_FLOAT,
            size: 3,
          },
          ...lightUniforms,
          uLightColors: {
            data: [...redColor, ...greenColor, ...blueColor, ...whiteColor],
            type: UniformKind.VECTOR_FLOAT,
            size: 4,
          },
          uLightCutOff: {
            data: lightCutOff,
            type: UniformKind.SCALAR_FLOAT,
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
            type: UniformKind.VECTOR_FLOAT,
          },
          uTranslate: {
            data: redLightPosition,
            type: UniformKind.VECTOR_FLOAT,
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
            type: UniformKind.VECTOR_FLOAT,
          },
          uTranslate: {
            data: greenLightPosition,
            type: UniformKind.VECTOR_FLOAT,
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
            type: UniformKind.VECTOR_FLOAT,
          },
          uTranslate: {
            data: blueLightPosition,
            type: UniformKind.VECTOR_FLOAT,
          },
        },
      })
    );
    scene.add(
      new Instance<typeof LightAttributes, typeof LightUniforms>({
        id: "white-light",
        ...commonArgs,
        uniforms: {
          uMaterialDiffuse: {
            data: whiteColor,
            type: UniformKind.VECTOR_FLOAT,
          },
          uTranslate: {
            data: whiteLightPosition,
            type: UniformKind.VECTOR_FLOAT,
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
        [
          ...v,
          ...greenLightPosition,
          ...blueLightPosition,
          ...whiteLightPosition,
        ],
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
        [
          ...redLightPosition,
          ...v,
          ...blueLightPosition,
          ...whiteLightPosition,
        ],
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
        [
          ...redLightPosition,
          ...greenLightPosition,
          ...v,
          ...whiteLightPosition,
        ],
        "wall"
      );
    },
  });
  createVector3dSliders({
    labels: ["White Light X", "White Light Y", "White Light Z"],
    value: whiteLightPosition,
    min: -100,
    max: 100,
    step: 1,
    onChange(v) {
      whiteLightPosition = v;
      scene.updateUniform("uTranslate", v, "white-light");
      scene.updateUniform(
        "uLightPositions",
        [
          ...redLightPosition,
          ...greenLightPosition,
          ...blueLightPosition,
          ...v,
        ],
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
    "In this example we will show how to render different light sources on the same scene by using uniform arrays instead of individual uniforms."
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
