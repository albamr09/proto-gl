import { initGUI } from "../../lib/gui/index.js";
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
import Scene from "../../lib/webgl/scene.js";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;

const initProgram = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CAMERA_TYPE.ORBITING,
    PROJECTION_TYPE.PERSPECTIVE,
    gl,
    scene
  );
  new Controller({ camera, canvas });
};

const draw = () => {
  scene.render();
};

const render = () => {
  draw();
  requestAnimationFrame(render);
};

const init = () => {
  initGUI();

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initProgram();
  // Data
  render();
  // Controls
};

window.onload = init;
