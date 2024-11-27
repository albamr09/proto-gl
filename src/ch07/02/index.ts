import { loadData } from "../../lib/files.js";
import {
  createCheckboxInputForm,
  createDescriptionPanel,
  createImageInputForm,
  createNumericInput,
  initController,
  initGUI,
} from "../../lib/gui/index.js";
import { calculateNormals } from "../../lib/math/3d.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera from "../../lib/webgl/camera.js";
import { CAMERA_TYPE, PROJECTION_TYPE } from "../../lib/webgl/types.js";
import Controller from "../../lib/webgl/controller.js";
import Instance from "../../lib/webgl/instance.js";
import Scene from "../../lib/webgl/scene.js";
import { UniformType } from "../../lib/webgl/types.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;
let texture: WebGLTexture | null;
let useLambert = true,
  usePerVertex = false,
  alphaValue = 1.0;

const initProgram = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CAMERA_TYPE.ORBITING,
    PROJECTION_TYPE.PERSPECTIVE,
    gl,
    scene
  );
  new Controller({ camera, canvas });
  camera.setAzimuth(-45);
  camera.setElevation(-30);
  camera.setPosition(new Vector([0, 0, 3]));

  // Configure alpha blending
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Configure texture load
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
};

const attributes = [
  "aPosition",
  "aNormal",
  "aColor",
  "aTextureCoords",
] as const;
const uniforms = [
  "uMaterialDiffuse",
  "uUsePerVertexColoring",
  "uUseLambert",
  "uAlpha",
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
  "uSampler",
] as const;

const initData = () => {
  const lightUniforms = {
    uLightPosition: {
      data: [0, 5, 20],
      type: UniformType.VECTOR_FLOAT,
    },
    uLightAmbient: {
      data: [1, 1, 1, 1],
      type: UniformType.VECTOR_FLOAT,
    },
    uLightDiffuse: {
      data: [1, 1, 1, 1],
      type: UniformType.VECTOR_FLOAT,
    },
  };
  loadData("/data/models/geometries/cube-texture.json").then((data) => {
    const { indices, vertices, diffuse, scalars, textureCoords } = data;
    scene.add(
      new Instance<typeof attributes, typeof uniforms>({
        id: "cube",
        gl,
        vertexShaderSource,
        fragmentShaderSource,
        attributes: {
          aPosition: {
            data: vertices,
            size: 3,
            type: gl.FLOAT,
          },
          aNormal: {
            data: calculateNormals(vertices, indices, 3),
            size: 3,
            type: gl.FLOAT,
          },
          aColor: {
            data: scalars,
            size: 4,
            type: gl.FLOAT,
          },
          aTextureCoords: {
            data: textureCoords,
            size: 2,
            type: gl.FLOAT,
          },
        },
        uniforms: {
          uMaterialDiffuse: {
            data: diffuse,
            type: UniformType.VECTOR_FLOAT,
          },
          uUseLambert: {
            data: useLambert,
            type: UniformType.INT,
          },
          uUsePerVertexColoring: {
            data: usePerVertex,
            type: UniformType.INT,
          },
          uAlpha: {
            data: alphaValue,
            type: UniformType.FLOAT,
          },
          uSampler: {
            data: 0,
            type: UniformType.INT,
          },
          ...lightUniforms,
        },
        indices,
      })
    );
  });
};

const draw = () => {
  scene.render(() => {
    const uniform = scene.getUniform("cube", "uSampler");
    if (!uniform) return;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniform.getLocation()!, 0);
  });
};

const render = () => {
  requestAnimationFrame(render);
  draw();
};

const initControls = () => {
  initController();
  createCheckboxInputForm({
    label: "Use Lambert",
    value: useLambert,
    onInit: (v) => {
      useLambert = v;
    },
    onChange: (v) => {
      useLambert = v;
      scene.updateUniform("uUseLambert", v);
    },
  });
  createCheckboxInputForm({
    label: "Use Per-Vertex",
    value: usePerVertex,
    onInit: (v) => {
      usePerVertex = v;
    },
    onChange: (v) => {
      usePerVertex = v;
      scene.updateUniform("uUsePerVertexColoring", v);
    },
  });
  createNumericInput({
    label: "Alpha Value",
    value: alphaValue,
    min: 0,
    max: 1,
    step: 0.05,
    onInit: (v) => {
      alphaValue = v;
    },
    onChange: (v) => {
      alphaValue = v;
      scene.updateUniform("uAlpha", v, "cube");
    },
  });
  createImageInputForm({
    label: "Texture Image",
    value: "/data/images/webgl.png",
    onInit: (v) => {
      // Create texture
      texture = gl.createTexture();
      // Load texture
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.bindTexture(gl.TEXTURE_2D, null);
    },
    onChange: (v) => {
      // Load texture
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.bindTexture(gl.TEXTURE_2D, null);
    },
  });
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we show how to render a simple texture while allowing to select any image as a texture."
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);
  initProgram();
  initData();
  render();
  initControls();
};

window.onload = init;
