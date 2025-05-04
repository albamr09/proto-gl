import { loadData } from "@example/utilities/files";
import {
  addChildrenToController,
  createCheckboxInputForm,
  createDescriptionPanel,
  createImageInputForm,
  createNumericInput,
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

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;
let texture: WebGLTexture | null;
let useLambert = true,
  usePerVertex = false,
  alphaValue = 1.0;

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  camera = new Camera({ gl, scene });
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
};

const draw = () => {
  scene.render({
    cb: () => {
      const uniform = scene.getUniform("cube", "uSampler");
      if (!uniform) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniform.getLocation()!, 0);
    },
  });
};

const render = () => {
  requestAnimationFrame(render);
  draw();
};

const initControls = () => {
  initController();
  const { container: useLambertInput } = createCheckboxInputForm({
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
  const { container: usePerVertexInput } = createCheckboxInputForm({
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
  const { container: alphaValueInput } = createNumericInput({
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
  const { container: textureImageInput } = createImageInputForm({
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

  addChildrenToController([
    useLambertInput,
    usePerVertexInput,
    alphaValueInput,
    textureImageInput,
  ]);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we show how to render a simple texture while allowing to select any image as a texture.",
    "ch07/02/"
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
