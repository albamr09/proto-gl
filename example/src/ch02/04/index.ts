import { vertexShaderSource } from "./vs.glsl.js";
import { fragmentShaderSource } from "./fs.glsl.js";

import {
  autoResizeCanvas,
  configureCanvas,
  createProgram,
  getGLContext,
} from "../../lib/web-gl.js";
import { initGUI, createDescriptionPanel } from "../../lib/gui/index.js";

let gl: WebGL2RenderingContext,
  program: WebGLProgram,
  VAO: WebGLVertexArrayObject | null,
  indicesBuffer: WebGLBuffer | null,
  indices: number[];

/** Draws square on center of clipspace x in (-1, 1), y in (-1, 1)
 *  0->(-0.5, 0.5)  3->(0.5, 0.5)
 *      +-------------+
 *      |           / |
 *      |        /    |
 *      |     /       |
 *      | /           |
 *      +-------------+
 *  1->(-0.5, -0.5)  2->(0.5, -0.5)
 *
 */
const initBuffer = () => {
  // Define vertices for position on space: the depth (z) is not important for now
  const vertices = [-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0];

  // Define indices for identifying triangles that make up the geometry
  // Using counter-clock wise order
  // First triangle is made up from the vertices 0, 1, and 2, the second triangle
  // is made up of vertices 1, 2 and 3
  indices = [0, 1, 3, 1, 2, 3];

  // Set up VAO
  VAO = gl.createVertexArray();
  gl.bindVertexArray(VAO);

  // Set up VBO (used inside VAO)
  const verticesBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Tell VAO how to use the current bound buffer (vertices buffer!)
  // Refer to 01_square.html and see how now the definition of how the data should
  // be retrived is done now on initialization instead of on render.
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

  // Bind VAO
  gl.bindVertexArray(VAO);

  // Bind IBO
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

  // Draw to the scene using triangle primitives
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  // Unbind buffers
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

/** Initialize application */
const init = () => {
  // Setup GUI
  initGUI();
  createDescriptionPanel("Renders a square using Vertex Array Objects (VAO)");

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
  // Show stuff on screen
  draw();
};

// Call init once the document has loaded
window.onload = init;
