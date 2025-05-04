import { createDescriptionPanel, initGUI } from "@example/utilities/gui/index";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "@example/utilities/web-gl";
import { Scene, Filter } from "@proto-gl";
import RayTrace from "./ray-trace";

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
    "On this example we'll show how to use ray tracing to render an sphere.",
    "ch10/05/"
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);
  initProgram();
  render();
};

window.onload = init;
