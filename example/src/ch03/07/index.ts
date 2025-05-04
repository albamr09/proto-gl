import {
  denormalizeColor,
  hexToRgb,
  normalizeColor,
  rgbToHex,
} from "@example/utilities/colors";
import { loadData } from "@example/utilities/files";
import {
  addChildrenToController,
  createCollapsibleComponent,
  createColorInputForm,
  createDescriptionPanel,
  createSliderInputForm,
  createVector3dSliders,
  initController,
  initGUI,
} from "@example/utilities/gui/index";
import {
  calculateNormals,
  computeNormalMatrix,
  Matrix4,
  Vector,
  Program,
} from "@proto-gl";
import {
  getGLContext,
  configureCanvas,
  autoResizeCanvas,
  clearScene,
} from "@example/utilities/web-gl";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

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

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uModelViewMatrix",
  "uProjectionMatrix",
  "uNormalMatrix",
  "uMaterialAmbientColor",
  "uMaterialDiffuseColor",
  "uMaterialSpecularColor",
  "uLightAmbientColor",
  "uLightDiffuseColor",
  "uLightSpecularColor",
  "uShininess",
  "uLightPosition",
] as const;

let gl: WebGL2RenderingContext;
let program: Program<typeof attributes, typeof uniforms>;
const objects: DataObject[] = [];
let lightPosition = [100, 400, 100],
  lightAmbientColor = [0.1, 0.1, 0.1],
  lightDiffuseColor = [1.0, 1.0, 1.0],
  lightSpecularColor = [0.5, 0.5, 0.5];
let modelTranslation = [-10, 0, -100];
let angle = 0,
  lastTime = 0;

const initProgram = () => {
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  program = new Program(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    attributes,
    uniforms
  );
};

const initBuffer = (data: DataObject) => {
  const { vertices, indices } = data;
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Vertices
  const verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.getAttribute("aPosition"));
  gl.vertexAttribPointer(
    program.getAttribute("aPosition"),
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  // Normals
  const normals = calculateNormals(vertices, indices, 3);
  const normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.getAttribute("aNormal"));
  gl.vertexAttribPointer(
    program.getAttribute("aNormal"),
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

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

const initData = () => {
  for (let i = 1; i < 179; i++) {
    loadData(`/data/models/nissan-gtr/part${i}.json`).then(initBuffer);
  }
};

const synchWorld = () => {
  let modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector(modelTranslation));
  modelViewMatrix = modelViewMatrix.rotateDeg(-20, new Vector([1, 0, 0]));
  modelViewMatrix = modelViewMatrix.rotateDeg(angle, new Vector([0, 1, 0]));
  const normalMatrix = computeNormalMatrix(modelViewMatrix);
  const projectionMatrix = Matrix4.perspective(
    45,
    gl.canvas.width / gl.canvas.height,
    1,
    10000
  );

  gl.uniformMatrix4fv(
    program.getUniformLocation("uModelViewMatrix"),
    false,
    modelViewMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(
    program.getUniformLocation("uNormalMatrix"),
    false,
    normalMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(
    program.getUniformLocation("uProjectionMatrix"),
    false,
    projectionMatrix.toFloatArray()
  );
};

const setUniforms = (object: DataObject) => {
  gl.uniform4fv(program.getUniformLocation("uMaterialDiffuseColor"), [
    ...object.Kd,
    1.0,
  ]);
  gl.uniform4fv(program.getUniformLocation("uMaterialAmbientColor"), [
    ...object.Ka,
    1.0,
  ]);
  gl.uniform4fv(program.getUniformLocation("uMaterialSpecularColor"), [
    ...object.Ks,
    1.0,
  ]);
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

const animate = () => {
  const timeNow = new Date().getTime();
  if (lastTime) {
    const elapsed = timeNow - lastTime;
    angle += (90 * elapsed) / 10000;
  }
  lastTime = timeNow;
};

const render = () => {
  requestAnimationFrame(render);
  draw();
  animate();
};

const initControls = () => {
  initController();
  const { container: lightDiffuseInput } = createColorInputForm({
    label: "Light Diffuse Color",
    value: rgbToHex(denormalizeColor(lightDiffuseColor)),
    onInit: (v) => {
      lightDiffuseColor = normalizeColor(hexToRgb(v));
      gl.uniform4fv(program.getUniformLocation("uLightDiffuseColor"), [
        ...lightDiffuseColor,
        1.0,
      ]);
    },
    onChange: (v) => {
      lightDiffuseColor = normalizeColor(hexToRgb(v));
      gl.uniform4fv(program.getUniformLocation("uLightDiffuseColor"), [
        ...lightDiffuseColor,
        1.0,
      ]);
    },
  });
  const { container: lighSpecularInput } = createColorInputForm({
    label: "Light Specular Color",
    value: rgbToHex(denormalizeColor(lightSpecularColor)),
    onInit: (v) => {
      lightSpecularColor = normalizeColor(hexToRgb(v));
      gl.uniform4fv(program.getUniformLocation("uLightSpecularColor"), [
        ...lightSpecularColor,
        1.0,
      ]);
    },
    onChange: (v) => {
      lightSpecularColor = normalizeColor(hexToRgb(v));
      gl.uniform4fv(program.getUniformLocation("uLightSpecularColor"), [
        ...lightSpecularColor,
        1.0,
      ]);
    },
  });
  const { container: lightAmbientInput } = createColorInputForm({
    label: "Light Ambient Color",
    value: rgbToHex(denormalizeColor(lightAmbientColor)),
    onInit: (v) => {
      lightAmbientColor = normalizeColor(hexToRgb(v));
      gl.uniform4fv(program.getUniformLocation("uLightAmbientColor"), [
        ...lightAmbientColor,
        1.0,
      ]);
    },
    onChange: (v) => {
      lightAmbientColor = normalizeColor(hexToRgb(v));
      gl.uniform4fv(program.getUniformLocation("uLightAmbientColor"), [
        ...lightAmbientColor,
        1.0,
      ]);
    },
  });
  const { container: shininessInput } = createSliderInputForm({
    label: "Shininess",
    value: 20,
    min: 0,
    max: 100,
    step: 1,
    onInit: (v) => {
      gl.uniform1f(program.getUniformLocation("uShininess"), v);
    },
    onChange: (v) => {
      gl.uniform1f(program.getUniformLocation("uShininess"), v);
    },
  });
  const carPositionInputs = createVector3dSliders({
    labels: ["Car X", "Car Y", "Car Z"],
    value: modelTranslation,
    min: -200,
    max: 200,
    step: 1,
    onInit: (v) => {
      modelTranslation = v;
    },
    onChange: (v) => {
      modelTranslation = v;
    },
  }).map(({ container }) => container);
  const lightsPositionInputs = createVector3dSliders({
    labels: ["Light X", "Light Y", "Light Z"],
    value: lightPosition,
    min: -500,
    max: 500,
    step: 1,
    onInit: (v) => {
      gl.uniform3fv(program.getUniformLocation("uLightPosition"), v);
    },
    onChange: (v) => {
      gl.uniform3fv(program.getUniformLocation("uLightPosition"), v);
    },
  }).map(({ container }) => container);

  const { container: lightsCollapsible } = createCollapsibleComponent({
    label: "Lights",
    children: [
      lightDiffuseInput,
      lightAmbientInput,
      lighSpecularInput,
      ...lightsPositionInputs,
    ],
  });

  addChildrenToController([
    ...carPositionInputs,
    shininessInput,
    lightsCollapsible,
  ]);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "Renders a complex model using Phong shading and Phong lights."
  );

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();

  initProgram();
  initData();
  initControls();
  render();
};

window.onload = init;
