import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
import {
  configureCanvas,
  getGLContext,
  autoResizeCanvas,
} from "../../lib/web-gl.js";
import Camera, {
  CAMERA_TYPE,
  PROJECTION_TYPE,
} from "../../lib/webgl/camera.js";
import Controller from "../../lib/webgl/controller.js";
import Instance from "../../lib/webgl/instance.js";
import Axis from "../../lib/webgl/models/axis.js";
import Floor from "../../lib/webgl/models/floor.js";
import Program from "../../lib/webgl/program.js";
import Scene from "../../lib/webgl/scene.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

const attributes = ["aPosition"] as const;
const uniforms = ["uMaterialDiffuse", "uWireFrame"] as const;

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let program: Program<typeof attributes, typeof uniforms>;
let scene: Scene;
let camera: Camera;
let controller: Controller;
let cameraType = CAMERA_TYPE.ORBITING;
let projectionType = PROJECTION_TYPE.PERSPECTIVE;

const initProgram = () => {
  program = new Program(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    attributes,
    uniforms
  );
  scene = new Scene(gl);
  camera = new Camera(cameraType, projectionType, gl);
  controller = new Controller({ camera, canvas });
};

const initData = () => {
  scene.add(
    Instance.fromModel({
      model: new Floor(80, 2),
      gl,
      program,
    })
  );
  scene.add(
    Instance.fromModel({
      model: new Axis(82),
      gl,
      program,
    })
  );
  // scene.load('/common/models/geometries/sphere2.json', 'sphere');
  // scene.load('/common/models/geometries/cone3.json', 'cone');
};

const draw = () => {
  scene.render();
};

const render = () => {
  draw();
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we showcase a simple animation of two objects. Such that you can see how to apply both global and local transforms."
  );

  canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();

  initProgram();
  initData();
  // Transforms
  render();
  // Controls
};

window.onload = init;
