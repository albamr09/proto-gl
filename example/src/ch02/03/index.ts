import { vertexShaderSource } from "./vs.glsl";
import { fragmentShaderSource } from "./fs.glsl";

import {
  configureCanvas,
  createProgram,
  getGLContext,
} from "@example/utilities/web-gl";
import { initGUI, createDescriptionPanel } from "@example/utilities/gui/index";

let gl: WebGL2RenderingContext,
  program: WebGLProgram,
  verticesBuffer: WebGLBuffer | null,
  indicesBuffer: WebGLBuffer | null,
  vertices: number[];

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
  // Note that because we are using drawArrays some vertices will be duplicated
  vertices = [
    // First triangle
    // 0
    -0.5, 0.5, 0,
    // 1
    -0.5, -0.5, 0,
    // 3
    0.5, 0.5, 0,
    // Second triangle
    // 1
    -0.5, -0.5, 0,
    // 2
    0.5, -0.5, 0,
    // 3
    0.5, 0.5, 0,
  ];

  // Set up VBO
  verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Unbind buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
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
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);

  // Unbind buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

const init = () => {
  // Setup gui
  initGUI();
  createDescriptionPanel(
    "Challenge: Renders a square using drawElements",
    "ch02/03/"
  );

  // Setup canvas
  configureCanvas();
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
