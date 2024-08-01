import { loadData } from "../../lib/files.js";
import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
import { calculateNormals } from "../../lib/math/3d.js";
import {
  autoResizeCanvas,
  clearScene,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Program from "../../lib/webgl/program.js";
import Scene from "../../lib/webgl/scene.js";
import fragmentShaderSource from "./fs.gl.js";
import vertexShaderSource from "./vs.gl.js";

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [] as const;

let gl: WebGL2RenderingContext;
let program: Program<typeof attributes, typeof uniforms>;
let scene: Scene<typeof attributes, typeof uniforms>;

const initProgram = () => {
  // Background colors :)
  gl.clearColor(0.9, 0.9, 0.9, 1);
  // Depth testing
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  // Create program object: compiles program and "creates"
  // attributes and uniforms
  program = new Program(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    attributes
  );
  scene = new Scene(gl, program);
};

const initBuffers = async () => {
  const data = await loadData("/data/models/geometries/cone3.json");
  scene.addObject(
    {
      aPosition: data.vertices as number[],
      aNormal: calculateNormals(data.vertices, data.indices, 3) as number[],
    },
    data.indices
  );
};

const draw = () => {
  scene.render();
};

const render = () => {
  requestAnimationFrame(render);
  draw();
};

const init = async () => {
  initGUI();
  createDescriptionPanel("See the Camera Translation in action");

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  gl = getGLContext();

  initProgram();
  await initBuffers();
  // Uniforms-Lights
  render();
};

window.onload = init;
