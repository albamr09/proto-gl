import { loadData } from "../../lib/files.js";
import {
  createCheckboxInputForm,
  createDescriptionPanel,
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
import Camera from "../../lib/webgl/camera/camera.js";
import { CameraType, ProjectionType } from "../../lib/webgl/camera/types.js";
import Controller from "../../lib/webgl/camera/controller.js";
import Instance from "../../lib/webgl/rendering/instance.js";
import Scene from "../../lib/webgl/rendering/scene.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";
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
    CameraType.ORBITING,
    ProjectionType.PERSPECTIVE,
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
      type: UniformKind.VECTOR_FLOAT,
    },
    uLightAmbient: {
      data: [1, 1, 1, 1],
      type: UniformKind.VECTOR_FLOAT,
    },
    uLightDiffuse: {
      data: [1, 1, 1, 1],
      type: UniformKind.VECTOR_FLOAT,
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
            type: UniformKind.VECTOR_FLOAT,
          },
          uUseLambert: {
            data: useLambert,
            type: UniformKind.SCALAR_INT,
          },
          uUsePerVertexColoring: {
            data: usePerVertex,
            type: UniformKind.SCALAR_INT,
          },
          uAlpha: {
            data: alphaValue,
            type: UniformKind.SCALAR_FLOAT,
          },
          uSampler: {
            data: 0,
            type: UniformKind.SCALAR_INT,
          },
          ...lightUniforms,
        },
        indices,
      })
    );
  });
  // Texture
  texture = gl.createTexture();
  const image = new Image();
  image.src = "/data/images/webgl.png";
  image.onload = () => {
    // Load texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };
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
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we show how to render a simple texture."
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
