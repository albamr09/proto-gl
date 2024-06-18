// Import necessary modules and dependencies
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
  createColorInputForm,
  createSliderInputForm,
  initGUI,
} from "../../utils/gui/index.js";
import {
  denormalizeColor,
  hexToRgb,
  normalizeColor,
  rgbToHex,
} from "../../utils/colors.js";

// Define types for program attributes and uniforms
type ProgramAttributes = {
  aVertexPosition: number;
  aVertexNormal: number;
};

type ProgramUniforms = {
  uProjectionMatrix: WebGLUniformLocation | null;
  uModelViewMatrix: WebGLUniformLocation | null;
  uNormalMatrix: WebGLUniformLocation | null;
  uLightDiffuse: WebGLUniformLocation | null;
  uLightAmbient: WebGLUniformLocation | null;
  uLightSpecular: WebGLUniformLocation | null;
  uMaterialAmbient: WebGLUniformLocation | null;
  uMaterialDiffuse: WebGLUniformLocation | null;
  uMaterialSpecular: WebGLUniformLocation | null;
  uLightDirection: WebGLUniformLocation | null;
  uShininess: WebGLUniformLocation | null;
};

type ExtendedWebGLProgram = WebGLProgram & ProgramAttributes & ProgramUniforms;

// Create auxiliary global variables
let gl: WebGL2RenderingContext,
  program: ExtendedWebGLProgram,
  sphereVAO: WebGLVertexArrayObject | null,
  sphereIndicesBuffer: WebGLBuffer | null,
  lightDiffuseColor = [1, 1, 1, 1],
  lightAmbientColor = [0.03, 0.03, 0.03, 1],
  lightSpecularColor = [1, 1, 1, 1],
  lightDirection = [-0.25, -0.25, -0.25],
  sphereColor = [46 / 256, 99 / 256, 191 / 256, 1],
  materialAmbient = [1, 1, 1, 1],
  materialSpecular = [1, 1, 1, 1],
  modelViewMatrix = mat4.create(),
  projectionMatrix = mat4.create(),
  normalMatrix = mat4.create(),
  shininess = 10;
  
// Initialize WebGL program
const initProgram = () => {
  gl = getGLContext();
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
  program.uMaterialAmbient = gl.getUniformLocation(program, "uMaterialAmbient");
  program.uMaterialDiffuse = gl.getUniformLocation(program, "uMaterialDiffuse");
  program.uMaterialSpecular = gl.getUniformLocation(
    program,
    "uMaterialSpecular"
  );
  program.uLightDiffuse = gl.getUniformLocation(program, "uLightDiffuse");
  program.uLightAmbient = gl.getUniformLocation(program, "uLightAmbient");
  program.uLightSpecular = gl.getUniformLocation(program, "uLightSpecular");
  program.uLightDirection = gl.getUniformLocation(program, "uLightDirection");
  program.uShininess = gl.getUniformLocation(program, "uShininess");
};

// Setup lighting
const initLights = () => {
  gl.uniform3fv(program.uLightDirection, lightDirection);
  gl.uniform4fv(program.uLightDiffuse, lightDiffuseColor);
  gl.uniform4fv(program.uLightAmbient, lightAmbientColor);
  gl.uniform4fv(program.uLightSpecular, lightSpecularColor);
  gl.uniform4fv(program.uMaterialAmbient, materialAmbient);
  gl.uniform4fv(program.uMaterialDiffuse, sphereColor);
  gl.uniform4fv(program.uMaterialSpecular, materialSpecular);
  gl.uniform1f(program.uShininess, shininess);
};

// Create and populate buffers with data
const initBuffers = () => {
  const normals = calculateNormals(vertices, indices);

  // Create VAO
  sphereVAO = gl.createVertexArray();
  gl.bindVertexArray(sphereVAO);

  // Add vertices to VAO
  const sphereVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.aVertexPosition);
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

  // Add normals to VAO
  const sphereNormalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.aVertexNormal);
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

// Draw the scene
const draw = () => {
  clearScene(gl);

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
    gl.bindVertexArray(sphereVAO);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndicesBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  } catch (error) {
    console.error(error);
  }
};

// Render loop
const render = () => {
  requestAnimationFrame(render);
  draw();
};

// Initialize control forms
const initControls = () => {
  initGUI();
  createColorInputForm({
    label: "Sphere color",
    value: rgbToHex(denormalizeColor(sphereColor)),
    onChange: (v) => {
      gl.uniform4fv(program.uMaterialDiffuse, [
        ...normalizeColor(hexToRgb(v)),
        0,
      ]);
    },
  });
  createColorInputForm({
    label: "Material Ambient",
    value: rgbToHex(denormalizeColor(materialAmbient)),
    onChange: (v) => {
      gl.uniform4fv(program.uMaterialAmbient, [
        ...normalizeColor(hexToRgb(v)),
        0,
      ]);
    },
  });
  createColorInputForm({
    label: "Material Specular",
    value: rgbToHex(denormalizeColor(materialSpecular)),
    onChange: (v) => {
      gl.uniform4fv(program.uMaterialSpecular, [
        ...normalizeColor(hexToRgb(v)),
        0,
      ]);
    },
  });
  createColorInputForm({
    label: "Light Diffuse Color",
    value: rgbToHex(denormalizeColor(lightDiffuseColor)),
    onChange: (v) => {
      gl.uniform4fv(program.uLightDiffuse, [...normalizeColor(hexToRgb(v)), 0]);
    },
  });
  createColorInputForm({
    label: "Light Ambient Color",
    value: rgbToHex(denormalizeColor(lightAmbientColor)),
    onChange: (v) => {
      gl.uniform4fv(program.uLightAmbient, [...normalizeColor(hexToRgb(v)), 0]);
    },
  });
  createColorInputForm({
    label: "Light Specular Color",
    value: rgbToHex(denormalizeColor(lightSpecularColor)),
    onChange: (v) => {
      gl.uniform4fv(program.uLightSpecular, [
        ...normalizeColor(hexToRgb(v)),
        0,
      ]);
    },
  });
  createSliderInputForm({
    label: "Shininess",
    value: shininess,
    min: 0,
    max: 50,
    step: 0.1,
    onChange: (v) => {
      gl.uniform1f(program.uShininess, v);
    },
  });
  createSliderInputForm({
    label: "Translate X",
    value: lightDirection[0],
    min: -10,
    max: 10,
    step: 0.1,
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
    step: 0.1,
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
    step: 0.1,
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