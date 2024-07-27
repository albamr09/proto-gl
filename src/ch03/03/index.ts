import {
  createColorInputForm,
  createDescriptionPanel,
  createNumericInput,
  createVector3dSliders,
  initController,
  initGUI,
} from "../../lib/gui/index.js";
import {
  getGLContext,
  configureCanvas,
  autoResizeCanvas,
  clearScene,
  createProgram,
} from "../../lib/web-gl.js";
import { vertices, indices } from "../data/data.js";
import vertexShaderSource from "./vs.glsl.js";
import fragmentShaderSource from "./fs.glsl.js";
import {
  denormalizeColor,
  hexToRgb,
  normalizeColor,
  rgbToHex,
  rgbToRgba,
} from "../../lib/colors.js";
import { Matrix4 } from "../../lib/math/matrix.js";
import { calculateNormals, computeNormalMatrix } from "../../lib/math/3d.js";
import { Vector } from "../../lib/math/vector.js";

type ProgramAttributes = {
  aPosition: number;
  aNormal: number;
};

type ProgramUnforms = {
  uMaterialDiffuseColor: WebGLUniformLocation | null;
  uMaterialAmbientColor: WebGLUniformLocation | null;
  uMaterialSpecularColor: WebGLUniformLocation | null;
  uLightDiffuseColor: WebGLUniformLocation | null;
  uLightAmbientColor: WebGLUniformLocation | null;
  uLightSpecularColor: WebGLUniformLocation | null;
  uShininnessFactor: WebGLUniformLocation | null;
  uLightDirection: WebGLUniformLocation | null;
  // Transformation matrices
  uModelViewMatrix: WebGLUniformLocation | null;
  uProjectionMatrix: WebGLUniformLocation | null;
  uNormalMatrix: WebGLUniformLocation | null;
};

type ExtendedWebGLProgram = ProgramAttributes & ProgramUnforms & WebGLProgram;

let gl: WebGL2RenderingContext,
  verticesBuffer: WebGLBuffer | null,
  indicesBuffer: WebGLBuffer | null,
  normalsBuffer: WebGLBuffer | null,
  sphereVAO: WebGLVertexArrayObject | null,
  program: ExtendedWebGLProgram;

let materialDiffuseColor = [46 / 256, 99 / 256, 191 / 256, 1],
  lightDiffuseColor = [1.0, 1.0, 1.0, 1],
  lightDirection = [-0.25, -0.25, -0.25],
  lightAmbientColor = [0.03, 0.03, 0.03, 1],
  materialAmbientColor = [1, 1, 1, 1],
  lightSpecularColor = [1, 1, 1, 1],
  materialSpecularColor = [1, 1, 1, 1],
  shinninessFactor = 10;
let modelViewMatrix = Matrix4.identity(),
  normalMatrix = Matrix4.identity(),
  projectionMatrix = Matrix4.identity();

const initProgram = () => {
  gl.clearColor(0.5, 0.5, 0.5, 1);
  gl.enable(gl.DEPTH_TEST);
  program = createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
  ) as ExtendedWebGLProgram;
  program.aPosition = gl.getAttribLocation(program, "aPosition");
  program.aNormal = gl.getAttribLocation(program, "aNormal");
  program.uMaterialDiffuseColor = gl.getUniformLocation(
    program,
    "uMaterialDiffuseColor"
  );
  program.uMaterialAmbientColor = gl.getUniformLocation(
    program,
    "uMaterialAmbientColor"
  );
  program.uMaterialSpecularColor = gl.getUniformLocation(
    program,
    "uMaterialSpecularColor"
  );
  program.uLightDiffuseColor = gl.getUniformLocation(
    program,
    "uLightDiffuseColor"
  );
  program.uLightAmbientColor = gl.getUniformLocation(
    program,
    "uLightAmbientColor"
  );
  program.uLightSpecularColor = gl.getUniformLocation(
    program,
    "uLightSpecularColor"
  );
  program.uShininnessFactor = gl.getUniformLocation(
    program,
    "uShininnessFactor"
  );
  program.uLightDirection = gl.getUniformLocation(program, "uLightDirection");
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  program.uProjectionMatrix = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  program.uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
};

const initBuffers = () => {
  sphereVAO = gl.createVertexArray();
  gl.bindVertexArray(sphereVAO);
  // Vertices
  verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  // Bind with VAO
  gl.enableVertexAttribArray(program.aPosition);
  gl.vertexAttribPointer(program.aPosition, 3, gl.FLOAT, false, 0, 0);

  // Normals
  const normals = calculateNormals(vertices, indices, 3);
  normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  // Bind with VAO
  gl.enableVertexAttribArray(program.aNormal);
  gl.vertexAttribPointer(program.aNormal, 3, gl.FLOAT, false, 0, 0);

  // Indices
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

const synchWorld = () => {
  modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector([0, 0, -1.5]));
  normalMatrix = computeNormalMatrix(modelViewMatrix);
  projectionMatrix = Matrix4.perspective(
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    10000
  );
  gl.uniformMatrix4fv(
    program.uModelViewMatrix,
    false,
    modelViewMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(
    program.uNormalMatrix,
    false,
    normalMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(
    program.uProjectionMatrix,
    false,
    projectionMatrix.toFloatArray()
  );
};

const draw = () => {
  clearScene(gl);

  gl.bindVertexArray(sphereVAO);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  // Unbing
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindVertexArray(null);
};

const render = () => {
  requestAnimationFrame(render);
  synchWorld();
  draw();
};

const initControls = () => {
  initController();
  createColorInputForm({
    label: "Material Diffuse Color",
    value: rgbToHex(denormalizeColor(materialDiffuseColor)),
    onInit: (v) => {
      gl.uniform4fv(
        program.uMaterialDiffuseColor,
        rgbToRgba(normalizeColor(hexToRgb(v)))
      );
    },
    onChange: (v) => {
      gl.uniform4fv(
        program.uMaterialDiffuseColor,
        rgbToRgba(normalizeColor(hexToRgb(v)))
      );
    },
  });
  createColorInputForm({
    label: "Material Ambient Color",
    value: rgbToHex(denormalizeColor(materialAmbientColor)),
    onInit: (v) => {
      gl.uniform4fv(
        program.uMaterialAmbientColor,
        rgbToRgba(normalizeColor(hexToRgb(v)))
      );
    },
    onChange: (v) => {
      gl.uniform4fv(
        program.uMaterialAmbientColor,
        rgbToRgba(normalizeColor(hexToRgb(v)))
      );
    },
  });
  createColorInputForm({
    label: "Material Specular Color",
    value: rgbToHex(denormalizeColor(materialSpecularColor)),
    onInit: (v) => {
      gl.uniform4fv(
        program.uMaterialSpecularColor,
        rgbToRgba(normalizeColor(hexToRgb(v)))
      );
    },
    onChange: (v) => {
      gl.uniform3fv(
        program.uMaterialSpecularColor,
        rgbToRgba(normalizeColor(hexToRgb(v)))
      );
    },
  });
  createColorInputForm({
    label: "Light Diffuse Color",
    value: rgbToHex(denormalizeColor(lightDiffuseColor)),
    onInit: (v) => {
      gl.uniform4fv(
        program.uLightDiffuseColor,
        rgbToRgba(normalizeColor(hexToRgb(v)))
      );
    },
    onChange: (v) => {
      gl.uniform4fv(
        program.uLightDiffuseColor,
        rgbToRgba(normalizeColor(hexToRgb(v)))
      );
    },
  });
  createColorInputForm({
    label: "Light Ambient Color",
    value: rgbToHex(denormalizeColor(lightAmbientColor)),
    onInit: (v) => {
      gl.uniform4fv(
        program.uLightAmbientColor,
        rgbToRgba(normalizeColor(hexToRgb(v)))
      );
    },
    onChange: (v) => {
      gl.uniform4fv(
        program.uLightAmbientColor,
        rgbToRgba(normalizeColor(hexToRgb(v)))
      );
    },
  });
  createColorInputForm({
    label: "Light Specular Color",
    value: rgbToHex(denormalizeColor(lightSpecularColor)),
    onInit: (v) => {
      gl.uniform4fv(
        program.uLightSpecularColor,
        rgbToRgba(normalizeColor(hexToRgb(v)))
      );
    },
    onChange: (v) => {
      gl.uniform4fv(
        program.uLightSpecularColor,
        rgbToRgba(normalizeColor(hexToRgb(v)))
      );
    },
  });
  createNumericInput({
    label: "Shininess Factor",
    value: shinninessFactor,
    min: 0,
    max: 50,
    step: 0.1,
    onInit: (v) => {
      gl.uniform1f(program.uShininnessFactor, v);
    },
    onChange: (v) => {
      gl.uniform1f(program.uShininnessFactor, v);
    },
  });
  createVector3dSliders({
    labels: ["Light X", "Light Y", "Light Z"],
    value: lightDirection,
    min: -2,
    max: 2,
    step: 0.1,
    onInit: (v) => {
      lightDirection = v;
      gl.uniform3fv(program.uLightDirection, v);
    },
    onChange: (v) => {
      lightDirection = v;
      gl.uniform3fv(program.uLightDirection, v);
    },
  });
};

const init = () => {
  // Set up GUI
  initGUI();
  createDescriptionPanel(
    "Renders an sphere while applying Goraud Shading in combination with the Phong Light Model."
  );

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  // Setup GL and compile program
  gl = getGLContext();
  initProgram();
  initBuffers();

  render();
  initControls();
};

window.onload = init;
