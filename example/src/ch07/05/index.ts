import { loadData } from "@example/utilities/files";
import {
  addChildrenToController,
  createCheckboxInputForm,
  createDescriptionPanel,
  createImageInputForm,
  createSliderInputForm,
  initController,
  initGUI,
} from "@example/utilities/gui/index";
import {
  calculateNormals,
  Vector,
  Camera,
  Controller,
  Instance,
  Scene,
  UniformKind,
} from "@proto-gl";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "@example/utilities/web-gl";

import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

const attributes = ["aPosition", "aNormal", "aTextureCoords", "aColor"];
const uniforms = [
  "uMaterialDiffuse",
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
  "uUsePerVertexColoring",
  "uUseLambert",
  "uAlpha",
  "uTextureSampler",
  "uLightTextureSampler",
  "uUseMultiply",
] as const;

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  camera = new Camera({ gl, scene });
  new Controller({ camera, canvas });

  // Camera
  camera.setPosition(new Vector([0, 0, 0]));
  camera.dolly(-4);
  camera.setAzimuth(45);
  camera.setElevation(-30);

  // Configure alpha blending
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};

const initData = async () => {
  loadData("/data/models/geometries/cube-texture.json").then(async (data) => {
    const { indices, vertices, diffuse, scalars, textureCoords } = data;
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
    const cubeObject = new Instance<typeof attributes, typeof uniforms>({
      id: "cube",
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      indices,
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
        uUsePerVertexColoring: {
          data: false,
          type: UniformKind.SCALAR_INT,
        },
        uUseLambert: {
          data: true,
          type: UniformKind.SCALAR_INT,
        },
        uAlpha: {
          data: 1,
          type: UniformKind.SCALAR_FLOAT,
        },
        uUseMultiply: {
          data: 1,
          type: UniformKind.SCALAR_INT,
        },
        ...lightUniforms,
      },
      textures: [
        {
          index: 0,
          uniform: "uTextureSampler",
          source: "/data/images/webgl-marble.png",
          target: gl.TEXTURE_2D,
        },
        {
          index: 1,
          uniform: "uLightTextureSampler",
          source: "/data/images/light.png",
          target: gl.TEXTURE_2D,
        },
      ],
    });
    scene.add(cubeObject);
  });
};

const draw = () => {
  scene.render();
};

const render = () => {
  requestAnimationFrame(render);
  draw();
};

const initControls = () => {
  initController();
  const { container: useVertexColorsInput } = createCheckboxInputForm({
    label: "Use Vertex Colors",
    value: false,
    onChange: (v) => {
      scene.updateUniform("uUsePerVertexColoring", v, "cube");
    },
  });
  const { container: useLambertInput } = createCheckboxInputForm({
    label: "Use Lambert Term",
    value: true,
    onChange: (v) => {
      scene.updateUniform("uUseLambert", v, "cube");
    },
  });
  const { container: alphaValueInput } = createSliderInputForm({
    label: "Alpha value",
    value: 1,
    min: 0,
    max: 1,
    step: 0.1,
    onChange: (v) => {
      scene.updateUniform("uAlpha", v, "cube");
    },
  });
  const { container: useMultipleTextureInput } = createCheckboxInputForm({
    label: "Use Multiply Texture",
    value: true,
    onChange: (v) => {
      scene.updateUniform("uUseMultiply", v, "cube");
    },
  });
  const { container: textureImageInput } = createImageInputForm({
    label: "Texture Image",
    value: "/data/images/webgl.png",
    onChange: (v) => {
      scene.updateTexture({ id: "cube", texture: { index: 0, data: v } });
    },
  });
  const { container: lightTextureImageInput } = createImageInputForm({
    label: "Overlay Texture Image",
    value: "/data/images/light.png",
    onChange: (v) => {
      scene.updateTexture({ id: "cube", texture: { index: 1, data: v } });
    },
  });
  addChildrenToController([
    useVertexColorsInput,
    useLambertInput,
    alphaValueInput,
    useMultipleTextureInput,
    textureImageInput,
    lightTextureImageInput,
  ]);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "In this example we will show how to use multiple textures.",
    "ch07/05/"
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
