import { vertexShaderSource } from "./vs.glsl.js";
import { fragmentShaderSource } from "./fs.glsl.js";
import {
  autoResizeCanvas,
  configureCanvas,
  createProgram,
  getGLContext,
} from "../../utils/web-gl.js";

let gl: WebGL2RenderingContext,
  program: WebGLProgram,
  verticesBuffer: WebGLBuffer | null,
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
const initSquareBuffer = () => {
  // Define vertices for position on space: the depth (z) is not important for now
  const vertices = [-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0];

  // Define indices for identifying triangles that make up the geometry
  // Using counter-clock wise order
  // First triangle is made up from the vertices 0, 1, and 2, the second triangle
  // is made up of vertices 1, 2 and 3
  indices = [0, 1, 3, 1, 2, 3];

  // Set up VBO
  verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Set up IBO
  indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // Unbind buffers
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

  // Bind the vertex buffer with an attribute
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  // Obtain attribute instance
  const vertexPositionAttr = gl.getAttribLocation(program, "aVertexPosition");
  // Bind attibute to buffer and set some metadata
  gl.vertexAttribPointer(vertexPositionAttr, 3, gl.FLOAT, false, 0, 0);
  // Enable attribute
  gl.enableVertexAttribArray(vertexPositionAttr);

  // Bind IBO
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

  // Draw to the scene using triangle primitives
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  // Unbind buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

/** Initialize application */
const init = () => {
  const canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();

  // Set the clear color to be black
  gl.clearColor(0, 0, 0, 1);

  // Init the program with the necessary shaders
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  // Create our square!
  initSquareBuffer();
  // Now draw
  draw();
};
// Call init once the document has loaded
window.onload = init;

// Make it a module
export {};
