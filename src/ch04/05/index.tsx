import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera, { CAMERA_TYPE } from "../../lib/webgl/camera.js";
import Program from "../../lib/webgl/program.js";
import Scene from "../../lib/webgl/scene.js";
import fragmentShaderSource from "./fs.gl.js";
import vertexShaderSource from "./vs.gl.js";

const attributes = ["aPosition"] as const;
const uniforms = [] as const;

let gl: WebGL2RenderingContext;
let program: Program<typeof attributes, typeof uniforms>;
let scene: Scene<typeof attributes, typeof uniforms>;
let camera: Camera;

const initProgram = () => {
  // Background colors :)
  gl.clearColor(0.9, 0.9, 0.9, 1);
  // Depth testing
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  program = new Program(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    attributes,
    uniforms
  );
  scene = new Scene(gl, program);
  camera = new Camera(CAMERA_TYPE.ORBITING);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "This example renders a complex object (a car) and defines a camera that can be interacted with using the mouse."
  );

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();

  initProgram();
  // Data
  // Uniforms
  // Render
  // Controls
};

window.onload = init;
