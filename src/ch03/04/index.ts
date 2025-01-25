import {
  denormalizeColor,
  hexToRgb,
  normalizeColor,
  rgbToHex,
} from "../../lib/colors.js";
import {
  addChildrenToController,
  createCollapsibleComponent,
  createColorInputForm,
  createDescriptionPanel,
  createSliderInputForm,
  createVector3dSliders,
  initController,
  initGUI,
} from "../../lib/gui/index.js";
import { calculateNormals, computeNormalMatrix } from "../../lib/math/3d.js";
import { Matrix4 } from "../../lib/math/matrix.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  clearScene,
  configureCanvas,
  createProgram,
  getGLContext,
} from "../../lib/web-gl.js";
import { indices, vertices } from "../data/data.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

type ProgramUniforms = {
  uModelViewMatrix: WebGLUniformLocation | null;
  uProjectionMatrix: WebGLUniformLocation | null;
  uNormalMatrix: WebGLUniformLocation | null;
  // Material
  uMaterialAmbientColor: WebGLUniformLocation | null;
  uMaterialDiffuseColor: WebGLUniformLocation | null;
  uMaterialSpecularColor: WebGLUniformLocation | null;
  // Lights
  uLightAmbientColor: WebGLUniformLocation | null;
  uLightDiffuseColor: WebGLUniformLocation | null;
  uLightSpecularColor: WebGLUniformLocation | null;
  uLightDirection: WebGLUniformLocation | null;
  uShininess: WebGLUniformLocation | null;
};

type ProgramAttributes = {
  aPosition: number;
  aNormal: number;
};

type ExtendedProgram = WebGLProgram & ProgramAttributes & ProgramUniforms;

let gl: WebGL2RenderingContext, program: ExtendedProgram;
let sphereVAO: WebGLVertexArrayObject | null,
  verticesBuffer: WebGLBuffer | null,
  normalsBuffer: WebGLBuffer | null,
  indicesBuffer: WebGLBuffer | null;
let modelViewMatrix = Matrix4.identity(),
  projectionMatrix = Matrix4.identity(),
  normalMatrix = Matrix4.identity();

let modelTranslation = [0, 0, -1.5];
let materialAmbientColor = [1.0, 1.0, 1.0],
  materialDiffuseColor = [0.18, 0.4, 0.75],
  materialSpecularColor = [1.0, 1.0, 1.0];
let lightAmbientColor = [0.03, 0.03, 0.03],
  lightDiffuseColor = [1.0, 1.0, 1.0],
  lightSpecularColor = [1.0, 1.0, 1.0],
  lighDirection = [-0.25, -0.25, -0.25];

let shininess = 10.0;

const initProgram = () => {
  gl.clearColor(0.5, 0.5, 0.5, 1);
  gl.enable(gl.DEPTH_TEST);
  program = createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
  ) as ExtendedProgram;
  program.aPosition = gl.getAttribLocation(program, "aPosition");
  program.aNormal = gl.getAttribLocation(program, "aNormal");
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  program.uProjectionMatrix = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
  program.uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
  program.uMaterialAmbientColor = gl.getUniformLocation(
    program,
    "uMaterialAmbientColor"
  );
  program.uMaterialDiffuseColor = gl.getUniformLocation(
    program,
    "uMaterialDiffuseColor"
  );
  program.uMaterialSpecularColor = gl.getUniformLocation(
    program,
    "uMaterialSpecularColor"
  );
  program.uLightAmbientColor = gl.getUniformLocation(
    program,
    "uLightAmbientColor"
  );
  program.uLightDiffuseColor = gl.getUniformLocation(
    program,
    "uLightDiffuseColor"
  );
  program.uLightSpecularColor = gl.getUniformLocation(
    program,
    "uLightSpecularColor"
  );
  program.uLightDirection = gl.getUniformLocation(program, "uLightDirection");
  program.uShininess = gl.getUniformLocation(program, "uShininess");
};

const initBuffers = () => {
  // Create VAO that will hold vertices and normals information
  sphereVAO = gl.createVertexArray();
  gl.bindVertexArray(sphereVAO);

  // Vertices
  verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(program.aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aPosition);

  // Normals
  const normals = calculateNormals(vertices, indices, 3);
  normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.vertexAttribPointer(program.aNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aNormal);

  // Indices
  indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // Unbind
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

const synchWorld = () => {
  modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector(modelTranslation));
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

  // Bind VAO and indices
  gl.bindVertexArray(sphereVAO);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  // Unbind
  gl.bindVertexArray(sphereVAO);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

const render = () => {
  requestAnimationFrame(render);
  synchWorld();
  draw();
};

const initControls = () => {
  initController();
  const materialAmbientInput = createColorInputForm({
    label: "Material Ambient Color",
    value: rgbToHex(denormalizeColor(materialAmbientColor)),
    onInit: (v) => {
      gl.uniform4fv(program.uMaterialAmbientColor, [
        ...normalizeColor(hexToRgb(v)),
        1,
      ]);
    },
    onChange: (v) => {
      gl.uniform4fv(program.uMaterialAmbientColor, [
        ...normalizeColor(hexToRgb(v)),
        1,
      ]);
    },
  });
  const materialDiffuseInput = createColorInputForm({
    label: "Material Diffuse Color",
    value: rgbToHex(denormalizeColor(materialDiffuseColor)),
    onInit: (v) => {
      gl.uniform4fv(program.uMaterialDiffuseColor, [
        ...normalizeColor(hexToRgb(v)),
        1,
      ]);
    },
    onChange: (v) => {
      gl.uniform4fv(program.uMaterialDiffuseColor, [
        ...normalizeColor(hexToRgb(v)),
        1,
      ]);
    },
  });
  const materialSpecularInput = createColorInputForm({
    label: "Material Specular Color",
    value: rgbToHex(denormalizeColor(materialSpecularColor)),
    onInit: (v) => {
      gl.uniform4fv(program.uMaterialSpecularColor, [
        ...normalizeColor(hexToRgb(v)),
        1,
      ]);
    },
    onChange: (v) => {
      gl.uniform4fv(program.uMaterialSpecularColor, [
        ...normalizeColor(hexToRgb(v)),
        1,
      ]);
    },
  });
  const materialCollapsible = createCollapsibleComponent({
    label: "Material",
    children: [
      materialAmbientInput,
      materialDiffuseInput,
      materialSpecularInput,
    ],
  });
  const lightAmbientInput = createColorInputForm({
    label: "Light Ambient Color",
    value: rgbToHex(denormalizeColor(lightAmbientColor)),
    onInit: (v) => {
      gl.uniform4fv(program.uLightAmbientColor, [
        ...normalizeColor(hexToRgb(v)),
        1,
      ]);
    },
    onChange: (v) => {
      gl.uniform4fv(program.uLightAmbientColor, [
        ...normalizeColor(hexToRgb(v)),
        1,
      ]);
    },
  });
  const lightDiffuseInput = createColorInputForm({
    label: "Light Diffuse Color",
    value: rgbToHex(denormalizeColor(lightDiffuseColor)),
    onInit: (v) => {
      gl.uniform4fv(program.uLightDiffuseColor, [
        ...normalizeColor(hexToRgb(v)),
        1,
      ]);
    },
    onChange: (v) => {
      gl.uniform4fv(program.uLightDiffuseColor, [
        ...normalizeColor(hexToRgb(v)),
        1,
      ]);
    },
  });
  const lightSpecularInput = createColorInputForm({
    label: "Light Specular Color",
    value: rgbToHex(denormalizeColor(lightSpecularColor)),
    onInit: (v) => {
      gl.uniform4fv(program.uLightSpecularColor, [
        ...normalizeColor(hexToRgb(v)),
        1,
      ]);
    },
    onChange: (v) => {
      gl.uniform4fv(program.uLightSpecularColor, [
        ...normalizeColor(hexToRgb(v)),
        1,
      ]);
    },
  });
  const lightPositionsInput = createVector3dSliders({
    labels: ["Light X", "Light Y", "Light Z"],
    value: lighDirection,
    min: -2,
    max: 2,
    step: 0.1,
    onInit: (v) => {
      gl.uniform3fv(program.uLightDirection, v);
    },
    onChange: (v) => {
      gl.uniform3fv(program.uLightDirection, v);
    },
  }).map(({ container }) => container);

  const lightCollapsible = createCollapsibleComponent({
    label: "Lights",
    children: [
      lightAmbientInput,
      lightDiffuseInput,
      lightSpecularInput,
      ...lightPositionsInput,
    ],
  });
  const { container: shininessInput } = createSliderInputForm({
    label: "Shininess",
    value: shininess,
    min: 0.1,
    max: 50,
    step: 0.1,
    onInit: (v) => {
      gl.uniform1f(program.uShininess, v);
    },
    onChange: (v) => {
      gl.uniform1f(program.uShininess, v);
    },
  });
  addChildrenToController([
    materialCollapsible,
    lightCollapsible,
    shininessInput,
  ]);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "Render lights using Phong Shading alongside the Phong Light Model. The lights are computed on the fragment shader summing up ambient lights, diffuse lights and specular lights."
  );

  // Setup
  const canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();
  initProgram();

  // Data
  initBuffers();

  // Render
  render();
  initControls();
};

window.onload = init;
