import { loadData } from "../../utils/files.js";
import { createDescriptionPanel, initGUI } from "../../utils/gui/index.js";
import {
  configureCanvas,
  autoResizeCanvas,
  getGLContext,
} from "../../utils/web-gl.js";

let gl: WebGL2RenderingContext;

const initBuffers = () => {
  loadData("/data/models/geometries/plane.json").then();
  loadData("/data/models/geometries/cone2.json");
  loadData("/data/models/geometries/sphere1.json");
  loadData("/data/models/geometries/sphere3.json");
};

const initProgram = () => {};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "Renders a scene with directional lights as well as directional lights."
  );

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();

  initProgram();
  initBuffers();
};

window.onload = init;
