import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we'll show how you can use cube maps in order to map textures using 3D coordinates"
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  // Program
  // Data
  // Controls
  // Render
};

window.onload = init;
