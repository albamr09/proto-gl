import { calculateNormals } from "../../utils/math.js";
import {
  clearScene,
  configureCanvas,
  createProgram,
  getGLContext,
} from "../../utils/web-gl.js";
import { indices, vertices } from "../data/data.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

// Declare types
type ProgramAttributes = {
  aVertexPosition: number;
  aVertexNormal: number;
};

type ProgramUniforms = {};

type ExtendedWebGLProgram = WebGLProgram & ProgramAttributes & ProgramUniforms;

// Declare global variables
let gl: WebGL2RenderingContext,
  program: ExtendedWebGLProgram,
  sphereVAO: WebGLVertexArrayObject | null,
  sphereIndicesBuffer: WebGLBuffer | null;
const clearColor = [0.9, 0.9, 0.9, 1, 0];

const init = async () => {
  // Set up our canvas
  configureCanvas();

  // Initialize programs
  initProgram();
  initMetadata();

  // Populate with data
  initBuffers();

  // Render
  render();

  // Initialize controls
};

const initProgram = () => {
  gl = getGLContext();
  gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
  gl.enable(gl.DEPTH_TEST);
  program = createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
  ) as ExtendedWebGLProgram;
};

// Set up uniforms, attributes, varyings etc
const initMetadata = () => {
  program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  program.aVertexNormal = gl.getAttribLocation(program, "aVertexNormal");
};

// Create and populate buffers with data
const initBuffers = () => {
  const normals = calculateNormals(vertices, indices);

  // Create VAO
  sphereVAO = gl.createVertexArray();
  gl.bindVertexArray(sphereVAO);

  // Add vertices to VAO
  const sphereVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.aVertexPosition);
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

  // Add normals to VAO
  const sphereNormalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.aVertexNormal);
  gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

  // Add indices to VAO
  sphereIndicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // Clean
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

// Draw the scene
const draw = () => {
  clearScene(gl);

  // Start drawing
  try {
    gl.bindVertexArray(sphereVAO);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndicesBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  } catch (error) {
    console.error(error);
  }
};

// Render loop
const render = () => {
  requestAnimationFrame(render);
  draw();
};

window.onload = init;
