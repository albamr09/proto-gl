import {
  configureCanvas,
  autoResizeCanvas,
  createProgram,
  getGLContext,
  clearScene,
} from "../../utils/web-gl.js";
import vertexShaderSource from "./vs.glsl.js";
import fragmentShaderSource from "./fs.glsl.js";
import { vertices, indices } from "../data/data.js";
import {
  createColorInputForm,
  createDescriptionPanel,
  createVector3dSliders,
  initController,
  initGUI,
} from "../../utils/gui/index.js";
import {
  denormalizeColor,
  hexToRgb,
  normalizeColor,
  rgbToHex,
} from "../../utils/colors.js";
import { calculateNormals, computeNormalMatrix } from "../../utils/math/3d.js";
import { Matrix4 } from "../../utils/math/matrix.js";
import { Vector } from "../../utils/math/vector.js";

type ProgramAttributes = {
  aPosition: number;
  aNormal: number;
};

type ProgramUniforms = {
  uLightColor: WebGLUniformLocation | null;
  uMaterialColor: WebGLUniformLocation | null;
  uLightDirection: WebGLUniformLocation | null;
  // Transformation matrices
  uProjectionMatrix: WebGLUniformLocation | null;
  uModelViewMatrix: WebGLUniformLocation | null;
  uNormalMatrix: WebGLUniformLocation | null;
};

type ExtendedWebGLProgram = WebGLProgram & ProgramAttributes & ProgramUniforms;

// WebGL vars
let gl: WebGL2RenderingContext,
  program: ExtendedWebGLProgram,
  verticesBuffer: WebGLBuffer | null,
  indicesBuffer: WebGLBuffer | null,
  normalsBuffer: WebGLBuffer | null,
  sphereVAO: WebGLVertexArrayObject | null;

// Control vars
let sphereColor = [0.5, 0.8, 0.1],
  lightColor = [1, 1, 1],
  lightDirection = [0, -1, -1],
  modelTranslation = [0, 0, 0],
  angle = 0,
  projectionMatrix = Matrix4.identity(),
  modelViewMatrix = Matrix4.identity();

const MAX_LIGHT_TRANSLATION_VALUE = 5;

/**
 *   Compiles the vertex and fragment shader to create the program
 */
const initProgram = () => {
  // Black clear color
  gl.clearColor(0.5, 0.5, 0.5, 1);
  gl.enable(gl.DEPTH_TEST);
  program = createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
  ) as ExtendedWebGLProgram;
  // Set locations onto the program instance
  program.aPosition = gl.getAttribLocation(program, "aPosition");
  program.aNormal = gl.getAttribLocation(program, "aNormal");
  program.uMaterialColor = gl.getUniformLocation(program, "uMaterialColor");
  program.uLightColor = gl.getUniformLocation(program, "uLightColor");
  program.uLightDirection = gl.getUniformLocation(program, "uLightDirection");
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  program.uProjectionMatrix = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  program.uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
};

/**
 * Sets up all transformation matrices
 */
const updateWorld = () => {
  // Translate model view matrix
  modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.rotateDeg(angle, new Vector([0, 1, 0]));
  modelViewMatrix = modelViewMatrix.translate(new Vector(modelTranslation));
  const normalMatrix = computeNormalMatrix(modelViewMatrix).toFloatArray();

  // Define data
  gl.uniformMatrix4fv(
    program.uModelViewMatrix,
    false,
    // modelViewMatrix
    modelViewMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(
    program.uProjectionMatrix,
    false,
    projectionMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(
    program.uNormalMatrix,
    false,
    normalMatrix,
  );
};

/**
 *   Initializates the buffers with the necessary data
 */
const initData = () => {
  // VAO
  sphereVAO = gl.createVertexArray();
  gl.bindVertexArray(sphereVAO);

  // Vertices data
  verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  // Bind with VAO
  gl.enableVertexAttribArray(program.aPosition);
  gl.vertexAttribPointer(program.aPosition, 3, gl.FLOAT, false, 0, 0);

  // Normals data
  const normals = calculateNormals(vertices, indices, 3);
  normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  // Bind with VAO
  gl.enableVertexAttribArray(program.aNormal);
  gl.vertexAttribPointer(program.aNormal, 3, gl.FLOAT, false, 0, 0);

  // Indices data
  indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // Unbind
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindVertexArray(null);
};

/**
 * Draw sphere on screen
 */
const draw = () => {
  clearScene(gl);

  // Bind VAO and IBO
  gl.bindVertexArray(sphereVAO);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

  // Draw
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  // Unbind
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

const animateRotation = (time: number) => {
  angle = time / 20.0;
}

/**
 * Rendering loop
 */
const render = (time: number) => {
  requestAnimationFrame(render);
  animateRotation(time);
  updateWorld();
  draw();
};

const initControls = () => {
  initController();
  createColorInputForm({
    label: "Sphere color",
    value: rgbToHex(denormalizeColor(sphereColor)),
    onInit: (v) => {
      gl.uniform3fv(program.uMaterialColor, normalizeColor(hexToRgb(v)));
    },
    onChange: (v) => {
      gl.uniform3fv(program.uMaterialColor, normalizeColor(hexToRgb(v)));
    },
  });
  createColorInputForm({
    label: "Light color",
    value: rgbToHex(denormalizeColor(lightColor)),
    onInit: (v) => {
      gl.uniform3fv(program.uLightColor, normalizeColor(hexToRgb(v)));
    },
    onChange: (v) => {
      gl.uniform3fv(program.uLightColor, normalizeColor(hexToRgb(v)));
    },
  });
  createVector3dSliders({
    labels: ["Light X Translate", "Light Y Translate", "Light Z Translate"],
    value: lightDirection,
    min: -MAX_LIGHT_TRANSLATION_VALUE,
    max: MAX_LIGHT_TRANSLATION_VALUE,
    step: -0.1,
    onInit: (v) => {
      lightDirection = v;
      gl.uniform3fv(program.uLightDirection, lightDirection);
    },
    onChange: (v) => {
      lightDirection = v;
      gl.uniform3fv(program.uLightDirection, lightDirection);
    },
  });
};

/**
 * Main
 */
const init = () => {
  // Setup GUI
  initGUI();
  createDescriptionPanel(
    "Challenge: Renders an sphere while applying Goraud Shading in combination with the Lambert Light Model. In addition the sphere is animated to rotate on the Y axis."
  );

  // Setup canvas
  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  // Setup web gl and data
  gl = getGLContext();
  initProgram();
  initData();

  // Loop
  render(0);

  // Form for controls
  initControls();
};

window.onload = init;
