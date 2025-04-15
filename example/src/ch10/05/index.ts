import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Filter from "../../lib/webgl/rendering/postprocess/filters/index.js";
import Scene from "../../lib/webgl/rendering/scene.js";
import RayTrace from "./ray-trace.js";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;

const initProgram = () => {
  scene = new Scene({ gl, canvas, filters: [new RayTrace(canvas) as Filter] });
};

const render = () => {
  scene.render();
  requestAnimationFrame(render);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we'll show how to use ray tracing to render an sphere."
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);
  initProgram();
  render();
};

window.onload = init;
