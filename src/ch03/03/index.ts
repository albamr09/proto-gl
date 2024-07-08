import {createColorInputForm, createDescriptionPanel, createVector3dSliders, initController, initGUI} from "../../utils/gui/index.js";
import {getGLContext, configureCanvas, autoResizeCanvas, clearScene, createProgram} from "../../utils/web-gl.js";
import {vertices, indices} from "../data/data.js"
import vertexShaderSource from "./vs.glsl.js";
import fragmentShaderSource from "./fs.glsl.js";
import {calculateNormals} from "../../utils/math.js";
import {denormalizeColor, hexToRgb, normalizeColor, rgbToHex} from "../../utils/colors.js";
import {Matrix4} from "../../utils/math/matrix.js";
import {computeNormalMatrix} from "../../utils/math/3d.js";

type ProgramAttributes = {
  aPosition: number;
  aNormal: number;
}

type ProgramUnforms = {
  uMaterialColor: WebGLUniformLocation | null;
  uLightDiffuseColor: WebGLUniformLocation | null;
  uLightDirection: WebGLUniformLocation | null;
  // Transformation matrices
  uModelViewMatrix: WebGLUniformLocation | null;
  uProjectionMatrix: WebGLUniformLocation | null;
  uNormalMatrix: WebGLUniformLocation | null;
}

type ExtendedWebGLProgram = ProgramAttributes & ProgramUnforms & WebGLProgram;

let gl: WebGL2RenderingContext, verticesBuffer: WebGLBuffer | null, indicesBuffer: WebGLBuffer | null, normalsBuffer: WebGLBuffer | null, sphereVAO: WebGLVertexArrayObject | null, program: ExtendedWebGLProgram;

let materialColor = [0.5, 0.2, 0], lightDiffuseColor = [1.0, 1.0, 1.0], lightDirection = [0, 0, 0];
let modelViewMatrix = Matrix4.identity(),
  normalMatrix = Matrix4.identity(),
  projectionMatrix = Matrix4.identity();

const initProgram = () => {
  gl.clearColor(0.5, 0.5, 0.5, 1);
  gl.enable(gl.DEPTH_TEST);
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource) as ExtendedWebGLProgram;
  program.aPosition = gl.getAttribLocation(program, "aPosition");
  program.aNormal = gl.getAttribLocation(program, "aNormal");
  program.uMaterialColor = gl.getUniformLocation(program, "uMaterialColor");
  program.uLightDiffuseColor = gl.getUniformLocation(program, "uLightDiffuseColor");
  program.uLightDirection = gl.getUniformLocation(program, "uLightDirection");
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  program.uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
  program.uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
}

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
  const normals = calculateNormals(vertices, indices);
  normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  // Bind with VAO
  // gl.enableVertexAttribArray(program.aNormal);
  // gl.vertexAttribPointer(program.aNormal, 3, gl.FLOAT, false, 0, 0)
  
  // Indices
  indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // Unbind
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindVertexArray(null);
}

const synchWorld = () => {
  normalMatrix = computeNormalMatrix(modelViewMatrix);
  gl.uniformMatrix4fv(program.uModelViewMatrix, false, modelViewMatrix.toFloatArray());
  gl.uniformMatrix4fv(program.uNormalMatrix, false, normalMatrix.toFloatArray());
  gl.uniformMatrix4fv(program.uProjectionMatrix, false, projectionMatrix.toFloatArray());
}

const draw = () => {
  clearScene(gl);

  gl.bindVertexArray(sphereVAO);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  
  // Unbing
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindVertexArray(null);
}

const render = () => {
  requestAnimationFrame(render);
  synchWorld();
  draw();
}

const initControls = () => {
  initController();
  createColorInputForm({
    label: "Sphere Color",
    value: rgbToHex(denormalizeColor(materialColor)),
    onInit: (v) => {
      gl.uniform3fv(program.uMaterialColor, normalizeColor(hexToRgb(v)));
    },
    onChange: (v) => {
      gl.uniform3fv(program.uMaterialColor, normalizeColor(hexToRgb(v)));
    }
  })
  createColorInputForm({
    label: "Light Color",
    value: rgbToHex(denormalizeColor(lightDiffuseColor)),
    onInit: (v) => {
      gl.uniform3fv(program.uLightDiffuseColor, normalizeColor(hexToRgb(v)));
    },
    onChange: (v) => {
      gl.uniform3fv(program.uLightDiffuseColor, normalizeColor(hexToRgb(v)));
    }
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
    }
  })
}

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
}

window.onload = init;
