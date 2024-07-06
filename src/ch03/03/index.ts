import {createDescriptionPanel, initGUI} from "../../utils/gui/index.js";
import {getGLContext, configureCanvas, autoResizeCanvas, clearScene, createProgram} from "../../utils/web-gl.js";
import {vertices, indices} from "../data/data.js"
import vertexShaderSource from "./vs.glsl.js";
import fragmentShaderSource from "./fs.glsl.js";

let gl: WebGL2RenderingContext, verticesBuffer: WebGLBuffer, indicesBuffer: WebGLBuffer, normalsBuffer: WebGLBuffer, sphereVAO: WebGLVertexArrayObject;

const initBuffers = () => {
  // Vertices
  gl.bindVertexArray(sphereVAO);
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  console.log(vertices);

  // Normals
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  
  // Indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  console.log(indices);

  // Unbind
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.bindVertexArray(null);
}

const draw = () => {
  clearScene(gl);
}

const render = () => {
  requestAnimationFrame(render);
  draw();
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
  gl.clearColor(0, 0, 0, 1);
  createProgram(gl, vertexShaderSource, fragmentShaderSource);
  
  // TODO: Initialize buffers
  initBuffers();
  // TODO: add uniforms

  render();
}

window.onload = init;
