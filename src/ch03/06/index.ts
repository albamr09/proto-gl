import { loadData } from "../../utils/files.js";
import {
  createNumericInput,
  createVector3dSliders,
  createDescriptionPanel,
  initController,
  initGUI,
} from "../../utils/gui/index.js";
import { calculateNormals, computeNormalMatrix } from "../../utils/math/3d.js";
import { Matrix4 } from "../../utils/math/matrix.js";
import { Vector } from "../../utils/math/vector.js";
import {
  configureCanvas,
  autoResizeCanvas,
  getGLContext,
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
  uModelViewMatrix: WebGLUniformLocation | null;
  uNormalMatrix: WebGLUniformLocation | null;
  uProjectionMatrix: WebGLUniformLocation | null;
  uMaterialDiffuseColor: WebGLUniformLocation | null;
  uMaterialSpecularColor: WebGLUniformLocation | null;
  uMaterialAmbientColor: WebGLUniformLocation | null;
  uLightPosition: WebGLUniformLocation | null;
  uLightDiffuseColor: WebGLUniformLocation | null;
  uLightAmbientColor: WebGLUniformLocation | null;
  uLightSpecularColor: WebGLUniformLocation | null;
  uShininess: WebGLUniformLocation | null;
};

type ExtendedProgram = WebGLProgram & ProgramAttributes & ProgramUniforms;

type DataObject = {
  id: string;
  vertices: number[];
  indices: number[];
  ambient: number[];
  diffuse: number[];
  specular: number[];
  vao: WebGLVertexArrayObject | null;
  ibo: WebGLBuffer | null;
};

let gl: WebGL2RenderingContext;
let program: ExtendedProgram;
let objects: DataObject[] = [];
let modelViewTranslation = [0, -30, -54.2];
let lightPosition = [4.5, 3, 15],
  shininess = 200;

const setupData = (data: DataObject, id: string) => {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(data.vertices),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(program.aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aPosition);

  const normals = calculateNormals(data.vertices, data.indices, 3);
  const normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.vertexAttribPointer(program.aNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aNormal);

  const indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(data.indices),
    gl.STATIC_DRAW
  );

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  data.vao = vao;
  data.ibo = indicesBuffer;
  data.id = id;

  objects.push(data);
};

const initBuffers = () => {
  loadData("/data/models/geometries/plane.json").then((data) =>
    setupData(data, "plane")
  );
  loadData("/data/models/geometries/cone2.json").then((data) =>
    setupData(data, "cone")
  );
  loadData("/data/models/geometries/sphere1.json").then((data) =>
    setupData(data, "sphere")
  );
  loadData("/data/models/geometries/sphere3.json").then((data) =>
    setupData(data, "light")
  );
};

const initProgram = () => {
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  // Configure depth
  gl.clearDepth(100);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  program = createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource
  ) as ExtendedProgram;

  program.aPosition = gl.getAttribLocation(program, "aPosition");
  program.aNormal = gl.getAttribLocation(program, "aNormal");
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
  program.uLightPosition = gl.getUniformLocation(program, "uLightPosition");
};

const addMaterialUniforms = (object: DataObject) => {
  gl.uniform4fv(program.uMaterialAmbientColor, object.ambient);
  gl.uniform4fv(program.uMaterialDiffuseColor, object.diffuse);
  gl.uniform4fv(program.uMaterialSpecularColor, object.specular);
};

const draw = () => {
  clearScene(gl);
  objects.forEach((o) => {
    // Material
    addMaterialUniforms(o);
    if (o.id == "light") {
      synchWorld(true);
    } else {
      synchWorld();
    }
    gl.bindVertexArray(o.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.ibo);

    gl.drawElements(gl.TRIANGLES, o.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  });
};

const addLightUniforms = () => {
  gl.uniform3fv(program.uLightPosition, lightPosition);
  gl.uniform4f(program.uLightAmbientColor, 1, 1, 1, 1);
  gl.uniform4f(program.uLightAmbientColor, 1, 1, 1, 1);
  gl.uniform4f(program.uLightSpecularColor, 1, 1, 1, 1);
};

const synchWorld = (isLight = false) => {
  const { width, height } = gl.canvas;

  let modelViewMatrix = Matrix4.identity().translate(
    new Vector(modelViewTranslation)
  );
  modelViewMatrix = modelViewMatrix.rotateDeg(30, new Vector([1, 0, 0]));
  modelViewMatrix = modelViewMatrix.rotateDeg(10, new Vector([0, 1, 0]));
  // If object is the light, we update its position
  if (isLight) {
    const lightPosition =
      program.uLightPosition && gl.getUniform(program, program.uLightPosition);
    modelViewMatrix = modelViewMatrix.translate(new Vector([...lightPosition]));
  }
  const normalMatrix = computeNormalMatrix(modelViewMatrix);
  const projectionMatrix = Matrix4.perspective(45, width / height, 0.1, 10000);

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

const render = () => {
  requestAnimationFrame(render);
  addLightUniforms();
  draw();
};

const initLights = () => {
  gl.uniform4fv(program.uLightAmbientColor, [0.01, 0.01, 0.01, 1]);
  gl.uniform4fv(program.uLightDiffuseColor, [0.5, 0.5, 0.5, 1]);
  gl.uniform4fv(program.uMaterialDiffuseColor, [0.1, 0.5, 0.8, 1]);
};

const initGUIControl = () => {
  initController();
  createNumericInput({
    label: "Shininess",
    value: shininess,
    min: 0,
    max: 500,
    step: 1,
    onInit: (v) => {
      gl.uniform1f(program.uShininess, v);
    },
    onChange: (v) => {
      gl.uniform1f(program.uShininess, v);
    },
  });
  createVector3dSliders({
    labels: ["Translate X", "Translate Y", "Translate Z"],
    value: modelViewTranslation,
    min: -200,
    max: 50,
    step: 1,
    onInit: (v) => {
      modelViewTranslation = v;
    },
    onChange: (v) => {
      modelViewTranslation = v;
    },
  });
  createVector3dSliders({
    labels: ["Light X", "Light Y", "Light Z"],
    value: lightPosition,
    min: -200,
    max: 50,
    step: 1,
    onInit: (v) => {
      gl.uniform3fv(program.uLightPosition, v);
    },
    onChange: (v) => {
      gl.uniform3fv(program.uLightPosition, v);
    },
  });
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "Renders a scene with directional lights as well as directional lights."
  );

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();

  initProgram();
  initLights();
  initBuffers();
  initGUIControl();
  render();
};

window.onload = init;
