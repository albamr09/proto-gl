import { loadData } from "../../utils/files.js";
import { createDescriptionPanel, initGUI } from "../../utils/gui/index.js";
import { calculateNormals, computeNormalMatrix } from "../../utils/math/3d.js";
import { Matrix4 } from "../../utils/math/matrix.js";
import { Vector } from "../../utils/math/vector.js";
import {
  getGLContext,
  configureCanvas,
  autoResizeCanvas,
  createProgram,
  clearScene,
} from "../../utils/web-gl.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

type ProgramAttributes = {
  aPosition: number;
  aNormal: number;
};

type ProgramUniforms = {
  // Transform
  uModelViewMatrix: WebGLUniformLocation | null;
  uNormalMatrix: WebGLUniformLocation | null;
  uProjectionMatrix: WebGLUniformLocation | null;
  // Materials
  uMaterialDiffuseColor: WebGLUniformLocation | null;
  uMaterialAmbientColor: WebGLUniformLocation | null;
  uMaterialSpecularColor: WebGLUniformLocation | null;
  // Lights
  uLightDiffuseColor: WebGLUniformLocation | null;
  uLightAmbientColor: WebGLUniformLocation | null;
  uLightSpecularColor: WebGLUniformLocation | null;
  uLightDirection: WebGLUniformLocation | null;
  uShininess: WebGLUniformLocation | null;
};

type ExtendedProgram = WebGLProgram & ProgramAttributes & ProgramUniforms;

type DataObject = {
  indices: number[];
  vertices: number[];
  Ka: number[];
  Kd: number[];
  Ks: number[];
  alias: string;
  vao: WebGLVertexArrayObject | null;
  indicesBuffer: WebGLBuffer | null;
};

let gl: WebGL2RenderingContext;
let program: ExtendedProgram;
const objects: DataObject[] = [];

const initProgram = () => {
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  program = createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
  ) as ExtendedProgram;

  program.aPosition = gl.getAttribLocation(program, "aPosition");
  // program.aNormal = gl.getAttribLocation(program, "aNormal");
  program.uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
  program.uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
  program.uProjectionMatrix = gl.getUniformLocation(
    program,
    "uProjectionMatrix"
  );
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
  program.uShininess = gl.getUniformLocation(program, "uShininess");
  program.uLightDirection = gl.getUniformLocation(program, "uLightDirection");
};

const initBuffer = (data: DataObject) => {
  const { vertices, indices } = data;
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Vertices
  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.aPosition);
  gl.vertexAttribPointer(program.aPosition, 3, gl.FLOAT, false, 0, 0);

  // Normals
  const normals = calculateNormals(vertices, indices, 3);
  const normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  // gl.enableVertexAttribArray(program.aNormal);
  // gl.vertexAttribPointer(program.aNormal, 3, gl.FLOAT, false, 0, 0);

  // Indices
  const indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  data.vao = vao;
  data.indicesBuffer = indicesBuffer;
  objects.push(data);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

const initData = async () => {
  for (let i = 1; i < 179; i++) {
    const data = await loadData(`/data/models/nissan-gtr/part${i}.json`);
    initBuffer(data);
  }
};

const initLights = () => {
  gl.uniform3fv(program.uLightDirection, [1.0, 1.0, 1.0]);
  gl.uniform4fv(program.uLightAmbientColor, [1.0, 1.0, 1.0, 1.0]);
  gl.uniform4fv(program.uLightDiffuseColor, [1.0, 1.0, 1.0, 1.0]);
  gl.uniform4fv(program.uLightSpecularColor, [1.0, 1.0, 1.0, 1.0]);
  gl.uniform1f(program.uShininess, 20);
};

const synchWorld = () => {
  let modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector([-10, 0, -100]));
  modelViewMatrix = modelViewMatrix.rotateDeg(30, new Vector([1, 0, 0]));
  modelViewMatrix = modelViewMatrix.rotateDeg(30, new Vector([0, 1, 0]));
  const normalMatrix = computeNormalMatrix(modelViewMatrix);
  const projectionMatrix = Matrix4.perspective(
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

const setUniforms = (object: DataObject) => {
  gl.uniform3fv(program.uMaterialDiffuseColor, object.Kd);
  gl.uniform3fv(program.uMaterialAmbientColor, object.Ka);
  gl.uniform3fv(program.uMaterialSpecularColor, object.Ks);
};

const draw = () => {
  clearScene(gl);
  synchWorld();

  objects.forEach((o) => {
    gl.bindVertexArray(o.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indicesBuffer);

    setUniforms(o);
    gl.drawElements(gl.TRIANGLES, o.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  });
};

const init = async () => {
  initGUI();
  createDescriptionPanel(
    "Renders a complex model using Phong shading and Phong lights."
  );

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();

  initProgram();
  await initData();
  initLights();
  draw();
};

window.onload = init;
