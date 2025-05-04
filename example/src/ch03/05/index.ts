import { createDescriptionPanel, initGUI } from "@example/utilities/gui/index";
import {
  autoResizeCanvas,
  clearScene,
  configureCanvas,
  createProgram,
  getGLContext,
} from "@example/utilities/web-gl";
import vertexShaderSource from "./vs.glsl";
import fragmentShaderSource from "./fs.glsl";
import {
  calculateNormals,
  computeNormalMatrix,
  Matrix4,
  Vector,
  Angle,
} from "@proto-gl";

type ProgramAttributes = {
  aPosition: number;
  aNormal: number;
};

type ProgramUniforms = {
  // Transformations
  uModelViewMatrix: WebGLUniformLocation | null;
  uProjectionMatrix: WebGLUniformLocation | null;
  uNormalMatrix: WebGLUniformLocation | null;
  // Lights
  uLightDirection: WebGLUniformLocation | null;
  uLightDiffuseColor: WebGLUniformLocation | null;
  uLightAmbientColor: WebGLUniformLocation | null;
  uMaterialDiffuseColor: WebGLUniformLocation | null;
};

type ExtendedProgram = WebGLProgram & ProgramAttributes & ProgramUniforms;

let gl: WebGL2RenderingContext, program: ExtendedProgram;

let verticesBuffer: WebGLBuffer | null,
  indicesBuffer: WebGLBuffer | null,
  normalsBuffer: WebGLBuffer | null;
let wallVAO: WebGLVertexArrayObject | null;
let modelViewMatrix = Matrix4.identity(),
  normalMatrix = Matrix4.identity(),
  projectionMatrix = Matrix4.identity();
let modelViewTranslation = [0, 0, -40];

const vertices = [
  -20,
  -8,
  20, // 0
  -10,
  -8,
  0, // 1
  10,
  -8,
  0, // 2
  20,
  -8,
  20, // 3
  -20,
  8,
  20, // 4
  -10,
  8,
  0, // 5
  10,
  8,
  0, // 6
  20,
  8,
  20, // 7
];

const indices = [0, 5, 4, 1, 5, 0, 1, 6, 5, 2, 6, 1, 2, 7, 6, 3, 7, 2];

const initProgram = () => {
  gl = getGLContext();
  gl.clearColor(0.9, 0.9, 0.9, 1);
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
  program.uLightDirection = gl.getUniformLocation(program, "uLightDirection");
  program.uLightDiffuseColor = gl.getUniformLocation(
    program,
    "uLightDiffuseColor"
  );
  program.uLightAmbientColor = gl.getUniformLocation(
    program,
    "uLightAmbientColor"
  );
  program.uMaterialDiffuseColor = gl.getUniformLocation(
    program,
    "uMaterialDiffuseColor"
  );
};

const initBuffers = () => {
  wallVAO = gl.createVertexArray();
  gl.bindVertexArray(wallVAO);

  verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.aPosition);
  gl.vertexAttribPointer(program.aPosition, 3, gl.FLOAT, false, 0, 0);

  const normals = calculateNormals(vertices, indices, 3);
  normalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(program.aNormal);
  gl.vertexAttribPointer(program.aNormal, 3, gl.FLOAT, false, 0, 0);

  indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

const initLights = () => {
  gl.uniform3fv(program.uLightDirection, [0, 0, -1]);
  gl.uniform4fv(program.uLightAmbientColor, [0.01, 0.01, 0.01, 1]);
  gl.uniform4fv(program.uLightDiffuseColor, [0.5, 0.5, 0.5, 1]);
  gl.uniform4fv(program.uMaterialDiffuseColor, [0.1, 0.5, 0.8, 1]);
};

const draw = () => {
  clearScene(gl);

  gl.bindVertexArray(wallVAO);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

const synchWorld = () => {
  const { width, height } = gl.canvas;

  modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector(modelViewTranslation));
  projectionMatrix = Matrix4.perspective(45, width / height, 0.1, 10000);
  normalMatrix = computeNormalMatrix(modelViewMatrix);
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
  synchWorld();
  draw();
};

const handleKeyInput = () => {
  const incrementValue = 10;
  // In degreess
  let pitch = 0;
  let yaw = 0;
  window.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "w":
        pitch += incrementValue;
        break;
      case "a":
        yaw -= incrementValue;
        break;
      case "s":
        pitch -= incrementValue;
        break;
      case "d":
        yaw += incrementValue;
        break;
    }

    const theta = Angle.toRadians(pitch);
    const phi = Angle.toRadians(yaw);

    // Spherical to cartesian coordinate transformation
    // https://en.neurochispas.com/trigonometry/spherical-to-cartesian-coordinates-formulas-and-examples/
    const lightDirectionX = Math.cos(theta) * Math.sin(phi);
    const lightDirectionY = Math.sin(theta);
    const lightDirectionZ = Math.cos(theta) * -Math.cos(phi);
    gl.uniform3fv(program.uLightDirection, [
      lightDirectionX,
      lightDirectionY,
      lightDirectionZ,
    ]);
  });
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "Renders a wall with lights. By pressing the WASD keys you can move the light.",
    "ch03/05/"
  );

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initProgram();
  initBuffers();
  initLights();

  handleKeyInput();
  render();
};

window.onload = init;
