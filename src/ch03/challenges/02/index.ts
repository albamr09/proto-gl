/**
 * The code renders a 3D sphere. There's a simple animation function that changes the rotation
 * angle of the sphere over time (angle). This creates a rotating effect.
 */

import {
  configureCanvas,
  getGLContext,
  createProgram,
  clearScene,
  autoResizeCanvas,
} from "../../../utils/web-gl.js";
import { calculateNormals } from "../../../utils/math.js";
import { mat4 } from "../../../lib/gl-matrix/esm/index.js";
import vertexShaderSource from "./vs.glsl.js";
import fragmentShaderSource from "./fs.glsl.js";
import { vertices, indices } from "../../data/data.js";
import { initGUI, createDescriptionPanel } from "../../../utils/gui/index.js";

type ProgramAttributes = {
  aVertexPosition: number;
  aVertexNormal: number;
};

type ProgramUniforms = {
  uProjectionMatrix: WebGLUniformLocation | null;
  uModelViewMatrix: WebGLUniformLocation | null;
  uNormalMatrix: WebGLUniformLocation | null;
  uMaterialDiffuse: WebGLUniformLocation | null;
  uLightDiffuse: WebGLUniformLocation | null;
  uLightDirection: WebGLUniformLocation | null;
};

type ExtendedWebGLProgram = WebGLProgram & ProgramAttributes & ProgramUniforms;

// Create auxiliary global variables
let gl: WebGL2RenderingContext,
  program: ExtendedWebGLProgram,
  sphereVAO: WebGLVertexArrayObject | null,
  sphereIndicesBuffer: WebGLBuffer | null,
  lightDiffuseColor = [1, 1, 1],
  lightDirection = [0, -1, -1],
  sphereColor = [0.5, 0.8, 0.1],
  modelViewMatrix = mat4.create(),
  projectionMatrix = mat4.create(),
  normalMatrix = mat4.create(),
  // New variables to animate angle
  angle = 0,
  lastTime: number;

const initProgram = () => {
  // Set up WebGL and shaders
  gl = getGLContext();
  // Set the clear color
  gl.clearColor(0.9, 0.9, 0.9, 1);
  gl.enable(gl.DEPTH_TEST);
  program = createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
  ) as ExtendedWebGLProgram;

  // Get attribute and uniform locations
  program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
  program.aVertexNormal = gl.getAttribLocation(program, "aVertexNormal");
  program.uProjectionMatrix = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  program.uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
  program.uMaterialDiffuse = gl.getUniformLocation(program, "uMaterialDiffuse");
  program.uLightDiffuse = gl.getUniformLocation(program, "uLightDiffuse");
  program.uLightDirection = gl.getUniformLocation(program, "uLightDirection");
};

// Setup lights
const initLights = () => {
  // Set light-related uniforms
  gl.uniform3fv(program.uLightDirection, lightDirection);
  gl.uniform3fv(program.uLightDiffuse, lightDiffuseColor);
  gl.uniform3fv(program.uMaterialDiffuse, sphereColor);
};

// Create and populate buffers with data
const initBuffers = () => {
  // Calculate vertex normals
  const normals = calculateNormals(vertices, indices);

  // Create a Vertex Array Object (VAO)
  sphereVAO = gl.createVertexArray();

  // Bind the VAO for setting up buffers and attributes
  gl.bindVertexArray(sphereVAO);

  // Create a buffer for vertices
  const sphereVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.aVertexPosition);
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

  // Create a buffer for normals
  const sphereNormalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.aVertexNormal);
  gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

  // Create a buffer for indices
  sphereIndicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // Clean up bindings
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

const draw = () => {
  clearScene(gl);

  // Define transformations
  mat4.perspective(
    projectionMatrix,
    45 * (Math.PI / 180),
    gl.canvas.width / gl.canvas.height,
    0.1,
    10000
  );
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -1.5]);

  // Apply rotation
  mat4.rotate(
    modelViewMatrix,
    modelViewMatrix,
    (angle * Math.PI) / 180,
    [0, 1, 0]
  );

  mat4.copy(normalMatrix, modelViewMatrix);
  mat4.invert(normalMatrix, normalMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  // Set uniforms for the shaders
  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);
  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uNormalMatrix, false, normalMatrix);

  // Start drawing
  try {
    // Bind VAO and index buffer
    gl.bindVertexArray(sphereVAO);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndicesBuffer);

    // Draw using indices
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Clean up
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  } catch (error) {
    console.error(error);
  }
};

// Simple animation function to change the angle
const animate = () => {
  let timeNow = new Date().getTime();
  if (lastTime) {
    const elapsed = timeNow - lastTime;
    angle += (90 * elapsed) / 1000.0;
  }
  lastTime = timeNow;
};

const render = () => {
  // Render each frame to react to changes
  requestAnimationFrame(render);
  animate();
  draw();
};

/** Initialize application */
const init = async () => {
  // Setup GUI
  initGUI();
  createDescriptionPanel("Animates the light source when using the Lambert Light Model.")
  
  // Configure the canvas for WebGL rendering
  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  // Initialize shaders and data
  initProgram();
  initLights();
  initBuffers();

  // Start rendering
  render();
};

window.onload = init;
