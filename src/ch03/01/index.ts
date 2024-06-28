import { configureCanvas, autoResizeCanvas, createProgram, getGLContext, clearScene } from "../../utils/web-gl.js";
import vertexShaderSource from "./vs.glsl.js"
import fragmentShaderSource from "./fs.glsl.js"
import { vertices, indices } from "../data/data.js";
import {createColorInputForm, createDescriptionPanel, initController, initGUI} from "../../utils/gui/index.js";
import {denormalizeColor, hexToRgb, normalizeColor, rgbToHex} from "../../utils/colors.js";

type ProgramAttributes = {
  aPosition: number;
}

type ProgramUniforms = {
  uMaterialDiffuse: WebGLUniformLocation | null;
}

type ExtendedWebGLProgram = WebGLProgram & ProgramAttributes & ProgramUniforms;

// WebGL vars
let gl: WebGL2RenderingContext, program: ExtendedWebGLProgram, verticesBuffer: WebGLBuffer | null, indicesBuffer: WebGLBuffer | null, sphereVAO: WebGLVertexArrayObject | null;

// Control vars
let sphereColor = [0.5, 0.8, 0.1];

/**
*   Compiles the vertex and fragment shader to create the program
*/
const initProgram = () => {
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource) as ExtendedWebGLProgram;
  // Set locations onto the `program` instance
  program.aPosition = gl.getAttribLocation(program, "aPosition");
  program.uMaterialDiffuse = gl.getUniformLocation(program, "uMaterialDiffuse");
}

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

  // Indices data
  indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // Unbind
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindVertexArray(null);
}

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
}

/**
* Rendering loop
*/
const render = () => {
  requestAnimationFrame(render);
  draw();
}

const initControls = () => {
  initController();
  createColorInputForm({
    label: "Sphere color",
    value: rgbToHex(denormalizeColor(sphereColor)),
    onInit: (v) => {
      gl.uniform3fv(program.uMaterialDiffuse, normalizeColor(hexToRgb(v)));
    },
    onChange: (v) => {
      gl.uniform3fv(program.uMaterialDiffuse, normalizeColor(hexToRgb(v)));
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
    "Renders an sphere while applying Goraud Shading in combination with the Lambert Light Model"
  );

  // Setup canvas
  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  // Setup web gl and data
  gl = getGLContext();
  // Black clear color
  gl.clearColor(0, 0, 0, 1)
  initProgram();
  initData();

  // Loop
  render();
  
  // Form for controls
  initControls();
}

window.onload = init;
