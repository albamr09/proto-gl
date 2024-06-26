import { vertexShaderSource } from "./vs.glsl.js";
import { fragmentShaderSource } from "./fs.glsl.js";

import { mat4 } from "../../../lib/gl-matrix/esm/index.js";

import {
  configureCanvas,
  createProgram,
  getGLContext,
} from "../../../utils/web-gl.js";
import { setupStyles } from "../../../utils/gui/styles.js";
import { createDescriptionPanel } from "../../../utils/gui/index.js";

let gl: WebGL2RenderingContext,
  program: WebGLProgram,
  vertexVAO: WebGLVertexArrayObject | null,
  indicesBuffer: WebGLBuffer | null,
  indices: number[];

let parts: {
  vao: WebGLVertexArrayObject;
  ibo: WebGLBuffer;
  vertices: number[];
  indices: number[];
}[] = [];
let projectionMatrix = mat4.create(),
  modelViewMatrix = mat4.create();

/**
 * Obtains vertices and indices from a JSON file and creates
 * the buffers from this data.
 *
 * Note that this function specifically only loads the nissan
 * object.
 */
const load = async () => {
  for (let i = 1; i < 179; i++) {
    await fetch(`/data/models/nissan-gtr/part${i}.json`)
      .then((res) => res.json())
      .then((data) => {
        const { vertices, indices: modelIndices } = data;
        indices = modelIndices;

        if (!vertices || !indices) return;

        // Set up VAO
        vertexVAO = gl.createVertexArray();
        gl.bindVertexArray(vertexVAO);

        // Set up VBO (used inside VAO)
        const verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(vertices),
          gl.STATIC_DRAW
        );

        // Tell VAO how to use the current bound buffer (vertices buffer!)
        // Obtain attribute instance
        const vertexPositionAttr = gl.getAttribLocation(
          program,
          "aVertexPosition"
        );
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

        // Attach them for later access
        data.vao = vertexVAO;
        data.ibo = indicesBuffer;

        // Accumulate data used later when drawing
        parts.push(data);

        // Unbind buffers
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      })
      .catch((error) => console.error(error));
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

  // We will cover these operations in later chapters
  mat4.perspective(
    projectionMatrix,
    45 * (Math.PI / 180),
    gl.canvas.width / gl.canvas.height,
    10,
    10000
  );
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [-10, 0, -100]);
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    (30 * Math.PI) / 180,
    [1, 0, 0]
  );
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    (30 * Math.PI) / 180,
    [0, 1, 0]
  );

  // Obtain uniforms
  const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
  const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

  // Iterate over every part inside of the `parts` array
  parts.forEach((part) => {
    // Bind VAO
    gl.bindVertexArray(part.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.ibo);

    // Draw
    gl.drawElements(gl.LINES, part.indices.length, gl.UNSIGNED_SHORT, 0);

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  });
};

/** Initialize application */
const init = async () => {
  // Setup GUI
  setupStyles();
  createDescriptionPanel("Renders a Nissan car using JSON data as the input data.");

  // Setup canvas
  configureCanvas();
  gl = getGLContext();
  // Set the clear color to be black
  gl.clearColor(0, 0, 0, 1);

  // Init the program with the necessary shaders
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  // Instead of defining a list of vertices and indices we read them from a json file
  await load();

  // Render
  draw();
};

// Call init once the document has loaded
window.onload = init;
