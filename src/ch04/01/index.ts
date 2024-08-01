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
import fragmentShaderSource from "./fs.gl.js";
import vertexShaderSource from "./vs.gl.js";

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [] as const;

let gl: WebGL2RenderingContext;
let program: Program<typeof attributes, typeof uniforms>;
let vao: WebGLVertexArrayObject | null;
let ibo: WebGLBuffer | null;
let indices_length: number;

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
};

const initBuffers = async () => {
  const { vertices, indices } = await loadData(
    "/data/models/geometries/cone3.json"
  );
  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Vertices
  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(
    program.attributes.aPosition,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(program.attributes.aPosition);

  // Normals
  const normals = calculateNormals(vertices, indices, 3);
  const normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.vertexAttribPointer(program.attributes.aNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.attributes.aNormal);

  // Indices
  ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );
  indices_length = indices.length;

  // Clean
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

const draw = () => {
  clearScene(gl);
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

  gl.drawElements(gl.TRIANGLES, indices_length, gl.UNSIGNED_SHORT, 0);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
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
