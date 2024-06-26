import { vertexShaderSource } from "./vs.glsl.js";
import { fragmentShaderSource } from "./fs.glsl.js";

import { mat4 } from "../../lib/gl-matrix/esm/index.js";

import {
  autoResizeCanvas,
  configureCanvas,
  createProgram,
  getGLContext,
} from "../../utils/web-gl.js";
import { initGUI, createDescriptionPanel } from "../../utils/gui/index.js";

let gl: WebGL2RenderingContext,
  program: WebGLProgram,
  vertexVAO: WebGLVertexArrayObject | null,
  indicesBuffer: WebGLBuffer | null,
  indices: number[];

let iboName: string,
  vboName: string,
  iboSize: string,
  iboUsage: string,
  vboSize: string,
  vboUsage: string,
  isVerticesVbo: boolean,
  isVertexBufferVbo: boolean;
let projectionMatrix = mat4.create(),
  modelViewMatrix = mat4.create();

/** Draws a cone */
const initBuffer = () => {
  // Define vertices for the cones position on space: the depth (z) is not important for now
  const vertices = [
    1.5, 0, 0, -1.5, 1, 0, -1.5, 0.809017, 0.587785, -1.5, 0.309017, 0.951057,
    -1.5, -0.309017, 0.951057, -1.5, -0.809017, 0.587785, -1.5, -1, 0, -1.5,
    -0.809017, -0.587785, -1.5, -0.309017, -0.951057, -1.5, 0.309017, -0.951057,
    -1.5, 0.809017, -0.587785,
  ];

  // Define indices for identifying triangles that make up the geometry
  // Using counter-clock wise order
  indices = [
    0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 7, 0, 7, 8, 0, 8, 9, 0,
    9, 10, 0, 10, 1,
  ];

  // Set up VAO
  vertexVAO = gl.createVertexArray();
  gl.bindVertexArray(vertexVAO);

  // Set up VBO (used inside VAO)
  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Tell VAO how to use the current bound buffer (vertices buffer!)
  // Obtain attribute instance
  const vertexPositionAttr = gl.getAttribLocation(program, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttr);
  gl.vertexAttribPointer(vertexPositionAttr, 3, gl.FLOAT, false, 0, 0);

  // Set up IBO
  indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // All of this is only needed to show later on gui
  // Set the global variables based on the parameter type
  if (verticesBuffer === gl.getParameter(gl.ARRAY_BUFFER_BINDING)) {
    vboName = "verticesBuffer";
  }
  if (indicesBuffer === gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING)) {
    iboName = "indicesBuffer";
  }
  vboSize = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
  vboUsage = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_USAGE);

  iboSize = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE);
  iboUsage = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_USAGE);

  try {
    isVerticesVbo = gl.isBuffer(vertices);
  } catch (e) {
    isVerticesVbo = false;
  }

  isVertexBufferVbo = gl.isBuffer(verticesBuffer);

  // Unbind buffers
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

/**
 * Draws the information on the buffer on the screen
 * (from buffers to framebuffer)
 */
const draw = () => {
  // Clear the scene
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // We will discuss these operations in later chapters
  mat4.perspective(
    projectionMatrix,
    45 * (Math.PI / 180),
    gl.canvas.width / gl.canvas.height,
    0.1,
    10000
  );
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -5]);

  // Obtain uniforms
  const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
  const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

  // Bind VAO
  gl.bindVertexArray(vertexVAO);

  // Draw
  gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);

  // Unbind buffers
  gl.bindVertexArray(null);
};

const assigValueToCell = (id: string, value: string) => {
  const cell = document.getElementById(id) as HTMLTableCellElement;
  cell.innerHTML = value;
};

/**
 * Helper function that updates the elements in the DOM with the
 * appropriate information for illustration purposes
 */
const updateInfo = () => {
  assigValueToCell("t-vbo-name", vboName);
  assigValueToCell("t-ibo-name", iboName);
  assigValueToCell("t-vbo-size", vboSize);
  assigValueToCell("t-vbo-usage", vboUsage);
  assigValueToCell("t-ibo-size", iboSize);
  assigValueToCell("t-ibo-usage", iboUsage);
  assigValueToCell("s-is-vertices-vbo", isVerticesVbo ? "Yes" : "No");
  assigValueToCell(
    "s-is-cone-vertex-buffer-vbo",
    isVertexBufferVbo ? "Yes" : "No"
  );
};

/** Initialize application */
const init = () => {
  // Setup GUI
  initGUI();
  createDescriptionPanel(
    "Shows a panel with information about a vertex buffer object (VBO) and a index buffer object (IBO)"
  );

  // Setup canvas
  const canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();
  // Set the clear color to be black
  gl.clearColor(0, 0, 0, 1);

  // Init the program with the necessary shaders
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  // Setup vertices and indices
  initBuffer();
  // First render
  render();

  // Update the info after we've rendered
  updateInfo();
};

/**
 * Execute this function every frame. Now our
 * application reacts to changes on the rendering mode
 */
const render = () => {
  requestAnimationFrame(render);
  // Show stuff on screen
  draw();
};
// Call init once the document has loaded
window.onload = init;
