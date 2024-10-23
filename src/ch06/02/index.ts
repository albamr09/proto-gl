import { loadData } from "../../lib/files.js";
import {
  createDescriptionPanel,
  createNumericInput,
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
import fragmentShaderSource from "./lights/fs.glsl.js";
import vertexShaderSource from "./lights/vs.glsl.js";
import wallVS from "./wall/vs.glsl.js";
import wallFS from "./wall/fs.glsl.js";

let canvas: HTMLCanvasElement;
let gl: WebGL2RenderingContext;
let scene: Scene;
let camera: Camera;

const redColor = [1, 0, 0, 1];
const redLightPosition = [0, 7, 3];
const greenLightPosition = [2.5, 3, 3];
const blueLightPosition = [1.5, 6, 3];
const greenColor = [0, 1, 0, 1];
const blueColor = [0, 0, 1, 1];
const lightCutOff = 0.5;

const LightAttributes = ["aPos"] as const;
const LightUniforms = ["uMaterialDiffuse", "uTranslate"] as const;

const WallAttributes = ["aPos", "aNormal"] as const;
const WallUniforms = [
  "uMaterialDiffuse",
  "uMaterialAmbient",
  "uLightAmbient",
  "uLightCutOff",
  "uRedLightPosition",
  "uRedLightColor",
  "uGreenLightPosition",
  "uGreenLightColor",
  "uBlueLightPosition",
  "uBlueLightColor",
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
          uGreenLightPosition: {
            data: greenLightPosition,
            type: UniformType.VECTOR_FLOAT,
          },
          uRedLightPosition: {
            data: redLightPosition,
            type: UniformType.VECTOR_FLOAT,
          },
          uBlueLightPosition: {
            data: blueLightPosition,
            type: UniformType.VECTOR_FLOAT,
          },
          ...lightUniforms,
          uGreenLightColor: {
            data: greenColor,
            type: UniformType.VECTOR_FLOAT,
          },
          uRedLightColor: {
            data: redColor,
            type: UniformType.VECTOR_FLOAT,
          },
          uBlueLightColor: {
            data: blueColor,
            type: UniformType.VECTOR_FLOAT,
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
      scene.updateUniform("uTranslate", v, "red-light");
      scene.updateUniform("uRedLightPosition", v, "wall");
    },
  });
  createVector3dSliders({
    labels: ["Green Light X", "Green Light Y", "Green Light Z"],
    value: greenLightPosition,
    min: -100,
    max: 100,
    step: 1,
    onChange(v) {
      scene.updateUniform("uTranslate", v, "green-light");
      scene.updateUniform("uGreenLightPosition", v, "wall");
    },
  });
  createVector3dSliders({
    labels: ["Blue Light X", "Blue Light Y", "Blue Light Z"],
    value: blueLightPosition,
    min: -100,
    max: 100,
    step: 1,
    onChange(v) {
      scene.updateUniform("uTranslate", v, "blue-light");
      scene.updateUniform("uBlueLightPosition", v, "wall");
    },
  });
  createNumericInput({
    label: "Light Cutoff",
    value: lightCutOff,
    max: 100,
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
    "In this example we will show how to render different light sources on the same scene. Also we compute the color on the fragment shader, so we compute a color per pixel."
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
