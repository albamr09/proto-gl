import {
  configureCanvas,
  autoResizeCanvas,
  createProgram,
  getGLContext,
  clearScene,
} from "../../../utils/web-gl.js";
import vertexShaderSource from "./vs.glsl.js";
import fragmentShaderSource from "./fs.glsl.js";
import { vertices, indices } from "../../data/data.js";
import {
  createColorInputForm,
  createDescriptionPanel,
  createSliderInputForm,
  initController,
  initGUI,
} from "../../../utils/gui/index.js";
import {
  denormalizeColor,
  hexToRgb,
  normalizeColor,
  rgbToHex,
} from "../../../utils/colors.js";
import { calculateNormals } from "../../../utils/math/3d.js";
import { Matrix4 } from "../../../utils/math/matrix.js";

type ProgramAttributes = {
  aPosition: number;
  aNormal: number;
};

type ProgramUniforms = {
  uLightColor: WebGLUniformLocation | null;
  uMaterialColor: WebGLUniformLocation | null;
  uLightDirection: WebGLUniformLocation | null;
  // Transformation matrices (not really needed, just here to show case)
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
  lightDirection = [0, 0, 1],
  projectionMatrix = Matrix4.identity(),
  modelViewMatrix = Matrix4.identity(),
  normalMatrix = Matrix4.identity();

const MAX_VALUE = 5;

/**
 *   Compiles the vertex and fragment shader to create the program
 */
const initProgram = () => {
  // Black clear color
  gl.clearColor(0, 0, 0, 1);
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
const initWorld = () => {
  gl.uniformMatrix4fv(
    program.uModelViewMatrix,
    false,
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
    normalMatrix.toFloatArray()
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
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindVertexArray(null);
};

/**
 * Rendering loop
 */
const render = () => {
  requestAnimationFrame(render);
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
  createSliderInputForm({
    label: "Translate X",
    value: lightDirection[0],
    min: -MAX_VALUE,
    max: MAX_VALUE,
    step: -0.1,
    onInit: (v) => {
      lightDirection[0] = v;
      gl.uniform3fv(program.uLightDirection, [
        lightDirection[0],
        lightDirection[1],
        lightDirection[2],
      ]);
    },
    onChange: (v) => {
      lightDirection[0] = v;
      gl.uniform3fv(program.uLightDirection, [
        -lightDirection[0],
        -lightDirection[1],
        lightDirection[2],
      ]);
    },
  });
  createSliderInputForm({
    label: "Translate Y",
    value: lightDirection[1],
    min: -MAX_VALUE,
    max: MAX_VALUE,
    step: -0.1,
    onInit: (v) => {
      lightDirection[1] = v;
      gl.uniform3fv(program.uLightDirection, [
        lightDirection[0],
        lightDirection[1],
        lightDirection[2],
      ]);
    },
    onChange: (v) => {
      lightDirection[1] = v;
      gl.uniform3fv(program.uLightDirection, [
        lightDirection[0],
        lightDirection[1],
        lightDirection[2],
      ]);
    },
  });
  createSliderInputForm({
    label: "Translate Z",
    value: lightDirection[2],
    min: -MAX_VALUE,
    max: MAX_VALUE,
    step: -0.1,
    onInit: (v) => {
      lightDirection[2] = v;
      gl.uniform3fv(program.uLightDirection, [
        lightDirection[0],
        lightDirection[1],
        lightDirection[2],
      ]);
    },
    onChange: (v) => {
      lightDirection[2] = v;
      gl.uniform3fv(program.uLightDirection, [
        lightDirection[0],
        lightDirection[1],
        lightDirection[2],
      ]);
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
    "Renders an sphere while applying Goraud Shading in combination with the Lambert Light Model. In addition the sphere is animated to rotate on the Y axis."
  );

  // Setup canvas
  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  // Setup web gl and data
  gl = getGLContext();
  initProgram();
  initWorld();
  initData();

  // Loop
  render();

  // Form for controls
  initControls();
};

window.onload = init;
