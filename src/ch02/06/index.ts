import { vertexShaderSource } from "./vs.glsl.js";
import { fragmentShaderSource } from "./fs.glsl.js";

import {
  configureCanvas,
  createProgram,
  getGLContext,
} from "../../lib/web-gl.js";

import {
  initGUI,
  initController,
  createSelectorForm,
  createDescriptionPanel,
} from "../../lib/gui/index.js";

let gl: WebGL2RenderingContext,
  program: WebGLProgram,
  vertexVAO: WebGLVertexArrayObject | null,
  indicesBuffer: WebGLBuffer | null,
  indices: number[];

let currentRenderingMode = "TRIANGLES";

/** Draws trapezoid on center of clipspace x in (-1, 1), y in (-1, 1)
 *  1->(-0.25, 0.5)         3->(0.25, 0.5)
 *              +               +
 *
 *
 *                      + (0, 0)
 *
 *
 *      +               +                +
 *  0->(-0.5, -0.5)  2->(0.0 -0.5)  4->(0.5 -0.5)
 *
 */
const initBuffer = () => {
  // Define vertices for the trapezoids position on space: the depth (z) is not important for now
  const vertices = [
    -0.5, -0.5, 0, -0.25, 0.5, 0, 0.0, -0.5, 0, 0.25, 0.5, 0, 0.5, -0.5, 0,
  ];

  // Define indices for identifying triangles that make up the geometry
  // Using counter-clock wise order
  // First triangle: 0, 1, and 2
  // Second triangle: 1, 2, and 3
  // Third triangle: 2, 4, and 3
  indices = [0, 1, 2, 1, 2, 3, 2, 4, 3];

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

  // Unbind buffers
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

/**
 * Depending on the rendering mode type, we will draw differently
 */
const drawBasedOnRenderingMode = () => {
  // Refer to initBuffer to a graphical description of the geometry
  switch (currentRenderingMode) {
    case "TRIANGLES": {
      indices = [0, 1, 2, 1, 2, 3, 2, 4, 3];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "LINES": {
      indices = [1, 3, 0, 4, 1, 2, 2, 3];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "POINTS": {
      // This renders the three points on the center of the trapezoid
      indices = [1, 2, 3];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.POINTS, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "LINE_LOOP": {
      indices = [2, 3, 4, 1, 0];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "LINE_STRIP": {
      indices = [2, 3, 4, 1, 0];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "TRIANGLE_STRIP": {
      indices = [0, 1, 2, 3, 4];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.TRIANGLE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
    case "TRIANGLE_FAN": {
      indices = [0, 1, 2, 3, 4];
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
      );
      gl.drawElements(gl.TRIANGLE_FAN, indices.length, gl.UNSIGNED_SHORT, 0);
      break;
    }
  }
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
  gl.bindVertexArray(vertexVAO);

  drawBasedOnRenderingMode();

  // Unbind buffers
  gl.bindVertexArray(null);
};

/**
 * Show form to change rendering mode (provided from utils.js)
 */
const initControls = () => {
  // Initialize form
  initController();
  createSelectorForm({
    label: "Rendering mode",
    value: currentRenderingMode,
    options: [
      "TRIANGLES",
      "LINES",
      "POINTS",
      "LINE_LOOP",
      "LINE_STRIP",
      "TRIANGLE_STRIP",
      "TRIANGLE_FAN",
    ],
    onChange: (value) => {
      currentRenderingMode = value;
    },
  });
};

/** Initialize application */
const init = () => {
  // Setup style
  initGUI();
  createDescriptionPanel("Challenge: Renders a trapezoid using TRIANGLES mode");

  // Init canvas
  configureCanvas();
  gl = getGLContext();
  // Set the clear color to be black
  gl.clearColor(0, 0, 0, 1);

  // Init the program with the necessary shaders
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  // Setup vertices and indices
  initBuffer();
  // First render
  render();

  // Initialize upper corner controls to change between rendering modes
  initControls();
};

/**
 * Execute this function every frame. Now our application reacts to changes on the rendering mode
 */
const render = () => {
  requestAnimationFrame(render);
  // Show stuff on screen
  draw();
};
// Call init once the document has loaded
window.onload = init;
