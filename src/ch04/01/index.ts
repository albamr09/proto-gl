import { loadData } from "../../lib/files.js";
import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
import { calculateNormals, computeNormalMatrix } from "../../lib/math/3d.js";
import { Matrix4 } from "../../lib/math/matrix.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
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
let modelViewMatrix: Matrix4,
  normalMatrix: Matrix4,
  cameraMatrix: Matrix4,
  projectionMatrix: Matrix4;

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

const initTransforms = () => {
  modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector([0, -2, -50]));
  cameraMatrix = modelViewMatrix.inverse() as Matrix4;
  normalMatrix = computeNormalMatrix(modelViewMatrix);
  projectionMatrix = Matrix4.perspective(
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    1000
  );
};

const initBuffers = async () => {
  const data = await loadData("/data/models/geometries/cone3.json");
  scene.addObject(
    // Define attributes
    {
      aPosition: {
        data: data.vertices as number[],
        size: 3,
        type: gl.FLOAT,
      },
      aNormal: {
        data: calculateNormals(data.vertices, data.indices, 3),
        size: 3,
        type: gl.FLOAT,
      },
    },
    data.indices
  );
};

const setMatrixUniforms = () => {
  gl.uniformMatrix4fv(
    program.uniforms.uModelViewMatrix,
    false,
    modelViewMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(
    program.uniforms.uNormalMatrix,
    false,
    normalMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(
    program.uniforms.uProjectionMatrix,
    false,
    projectionMatrix.toFloatArray()
  );
};

const draw = () => {
  try {
    setMatrixUniforms();
    scene.render();
  } catch (error) {
    console.error(`Could not render scene ${error}`);
  }
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
  initTransforms();
  await initBuffers();
  // Lights
  render();
};

window.onload = init;
