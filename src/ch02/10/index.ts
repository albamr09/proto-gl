import { vertexShaderSource } from "./vs.glsl.js";
import { fragmentShaderSource } from "./fs.glsl.js";

import {
  autoResizeCanvas,
  clearScene,
  configureCanvas,
  createProgram,
  getGLContext,
} from "../../utils/web-gl.js";
import { initGUI, createDescriptionPanel } from "../../utils/gui/index.js";
import { Matrix4 } from "../../utils/math/matrix.js";
import { Vector } from "../../utils/math/vector.js";

let gl: WebGL2RenderingContext,
  program: WebGLProgram,
  vertexVAO: WebGLVertexArrayObject | null,
  indicesBuffer: WebGLBuffer | null,
  indices: number[];

/**
 * Obtains vertices and indices from a JSON file and creates
 * the buffers from this data.
 */
const load = async (path: string) => {
  return fetch(path)
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

      // Unbind buffers
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    })
    .catch((error) => console.error(error));
};

/**
 * Draws the information on the buffer on the screen
 * (from buffers to framebuffer)
 */
const draw = () => {
  clearScene(gl);

  const projectionMatrix = Matrix4.perspective(
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    10000
  );

  let modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector([0, 0, -5]));

  // Obtain uniforms
  const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
  const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  gl.uniformMatrix4fv(
    uProjectionMatrix,
    false,
    projectionMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix.toFloatArray());

  // Bind VAO
  gl.bindVertexArray(vertexVAO);

  // Draw
  gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);

  // Unbind buffers
  gl.bindVertexArray(null);
};

/** Initialize application */
const init = async () => {
  // Setup GUI
  initGUI();
  createDescriptionPanel(
    "Shows how to load information from a JSON file and render the object described by the JSON file."
  );

  // Setup canvas
  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  gl = getGLContext();
  // Set the clear color to be black
  gl.clearColor(0, 0, 0, 1);

  // Init the program with the necessary shaders
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  // Instead of defining a list of vertices and indices we read them from a json file
  await load("/data/models/geometries/cone.json");

  // Render
  draw();
};

// Call init once the document has loaded
window.onload = init;
