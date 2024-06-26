import {
  configureCanvas,
  getGLContext,
  createProgram,
  clearScene,
  autoResizeCanvas,
} from "../../utils/web-gl.js";
import { calculateNormals } from "../../utils/math.js";
import { mat4 } from "../../lib/gl-matrix/esm/index.js";
import vertexShaderSource from "./vs.glsl.js";
import fragmentShaderSource from "./fs.glsl.js";
import { vertices, indices } from "../data/data.js";
import {
  initGUI,
  createColorInputForm,
  createDescriptionPanel,
  createSliderInputForm,
  initController,
} from "../../utils/gui/index.js";
import {
  denormalizeColor,
  hexToRgb,
  normalizeColor,
  rgbToHex,
} from "../../utils/colors.js";

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
  normalMatrix = mat4.create();

/** Initialize application */

const initProgram = () => {
  // Set up shaders
  gl = getGLContext();
  // Set the clear color
  gl.clearColor(0.9, 0.9, 0.9, 1);
  gl.enable(gl.DEPTH_TEST);
  program = createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
  ) as ExtendedWebGLProgram;

  // Set locations onto the `program` instance
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
  // Add uniforms
  gl.uniform3fv(program.uLightDirection, lightDirection);
  gl.uniform3fv(program.uLightDiffuse, lightDiffuseColor);
  gl.uniform3fv(program.uMaterialDiffuse, sphereColor);
};

// Create and populate buffers with data
const initBuffers = () => {
  // Calculate the normals of all vertices
  const normals = calculateNormals(vertices, indices);

  // Create VAO
  sphereVAO = gl.createVertexArray();

  // Bind VAO, all buffers and attributes from this point on until
  // unbound will be added to this VAO
  gl.bindVertexArray(sphereVAO);

  // Add vertices to VAO
  const sphereVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  // Enable vertices attribute array, and make it point to the buffer that is currently bound
  gl.enableVertexAttribArray(program.aVertexPosition);
  // MDefine structure
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

  // Add normals to VAO
  const sphereNormalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  // Enable normals attribute array, and make it point to the buffer that is currently bound
  gl.enableVertexAttribArray(program.aVertexNormal);
  // Define structure of data inside buffer: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
  gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

  // Add indices to VAO
  sphereIndicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // Clean
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

const draw = () => {
  clearScene(gl);

  // Operations relating the transformations on the world
  mat4.perspective(
    projectionMatrix,
    45 * (Math.PI / 180),
    gl.canvas.width / gl.canvas.height,
    0.1,
    10000
  );
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -1.5]);

  mat4.copy(normalMatrix, modelViewMatrix);
  mat4.invert(normalMatrix, normalMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix);
  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix);
  gl.uniformMatrix4fv(program.uNormalMatrix, false, normalMatrix);

  // Start drawing
  try {
    // Bind what data we are going to use
    gl.bindVertexArray(sphereVAO);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndicesBuffer);

    // Draw using indices to define relationship between vertices
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  } catch (error) {
    console.error(error);
  }
};

const render = () => {
  // Render each frame so we react to changes
  requestAnimationFrame(render);
  draw();
};

const initControls = () => {
  initController();
  createColorInputForm({
    label: "Sphere color",
    value: rgbToHex(denormalizeColor(sphereColor)),
    onChange: (v) => {
      gl.uniform3fv(program.uMaterialDiffuse, normalizeColor(hexToRgb(v)));
    },
  });
  createColorInputForm({
    label: "Light Diffuse Color",
    value: rgbToHex(denormalizeColor(lightDiffuseColor)),
    onChange: (v) => {
      gl.uniform3fv(program.uLightDiffuse, normalizeColor(hexToRgb(v)));
    },
  });
  createSliderInputForm({
    label: "Translate X",
    value: lightDirection[0],
    min: -10,
    max: 10,
    step: -0.1,
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
    min: -10,
    max: 10,
    step: -0.1,
    onChange: (v) => {
      lightDirection[1] = v;
      gl.uniform3fv(program.uLightDirection, [
        -lightDirection[0],
        -lightDirection[1],
        lightDirection[2],
      ]);
    },
  });
  createSliderInputForm({
    label: "Translate Z",
    value: lightDirection[2],
    min: -10,
    max: 10,
    step: -0.1,
    onChange: (v) => {
      lightDirection[2] = v;
      gl.uniform3fv(program.uLightDirection, [
        -lightDirection[0],
        -lightDirection[1],
        lightDirection[2],
      ]);
    },
  });
};

const init = async () => {
  // Setup GUI
  initGUI();
  createDescriptionPanel(
    "Renders an sphere while applying Goraud Shading in combination with the Lambert Light Model"
  );

  // Setup canvas
  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  // Initialize shaders and entry data for shaders
  initProgram();
  initLights();
  initBuffers();

  // Render
  render();

  // Form for controls
  initControls();
};

window.onload = init;
