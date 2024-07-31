import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Program from "../../lib/webgl/program.js";
import fragmentShaderSource from "./fs.gl.js";
import vertexShaderSource from "./vs.gl.js";

const attributes = ["aPosition"] as const;

let gl: WebGL2RenderingContext;
let program;

const initProgram = () => {
  program = new Program(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    attributes
  );
  gl.clearColor(0.9, 0.9, 0.9, 1);
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
};

const init = () => {
  initGUI();
  createDescriptionPanel("See the Camera Translation in action");

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  gl = getGLContext();

  initProgram();
  // Buffers
  // Uniforms-Lights
  // Render
};

window.onload = init;
