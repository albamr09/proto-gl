import { loadData } from "../../lib/files.js";
import {
  createCheckboxInputForm,
  createDescriptionPanel,
  createImageInputForm,
  createSelectorForm,
  createSliderInputForm,
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
import Camera, {
  CAMERA_TYPE,
  PROJECTION_TYPE,
} from "../../lib/webgl/camera.js";
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

const attributes = [
  "aPosition",
  "aColor",
  "aNormal",
  "aTextureCoords",
] as const;
const uniforms = [
  "uMaterialDiffuse",
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
  "uUsePerVertexColoring",
  "uUseLambert",
  "uAlpha",
  "uSampler",
] as const;

enum MagFilter {
  LINEAR = "LINEAR",
  NEAREST = "NEAREST",
}

enum MinFilter {
  LINEAR = "LINEAR",
  NEAREST = "NEAREST",
  NEAREST_MIPMAP_NEAREST = "NEAREST_MIPMAP_NEAREST",
  LINEAR_MIPMAP_NEAREST = "LINEAR_MIPMAP_NEAREST",
  NEAREST_MIPMAP_LINEAR = "NEAREST_MIPMAP_LINEAR",
  LINEAR_MIPMAP_LINEAR = "LINEAR_MIPMAP_LINEAR",
}

const initProgram = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CAMERA_TYPE.ORBITING,
    PROJECTION_TYPE.PERSPECTIVE,
    gl,
    scene
  );
  new Controller({ camera, canvas });

  // Camera
  camera.setPosition(new Vector([0, 0, 0]));
  camera.dolly(-4);
  camera.setAzimuth(45);
  camera.setElevation(-30);

  // Configure alpha blending
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Configure texture loading
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
};

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
    const { vertices, indices, diffuse, scalars, textureCoords } = data;
    const cubeInstance = new Instance<typeof attributes, typeof uniforms>({
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
        aColor: {
          data: scalars,
          size: 4,
          type: gl.FLOAT,
        },
        aNormal: {
          data: calculateNormals(vertices, indices, 3),
          size: 3,
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
        uUsePerVertexColoring: {
          data: false,
          type: UniformType.INT,
        },
        uUseLambert: {
          data: false,
          type: UniformType.INT,
        },
        uAlpha: {
          data: 1,
          type: UniformType.FLOAT,
        },
        uSampler: {
          data: 0,
          type: UniformType.INT,
        },
        ...lightUniforms,
      },
      indices,
    });
    scene.add(cubeInstance);
  });
};

const draw = () => {
  scene.render(() => {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  });
};

const render = () => {
  draw();
  requestAnimationFrame(render);
};

const loadTexture = (image: HTMLImageElement) => {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
};

const initControls = () => {
  initController();
  createCheckboxInputForm({
    label: "Use Vertex Colors",
    value: false,
    onChange: (v) => {
      scene.updateUniform("uUsePerVertexColoring", v, "cube");
    },
  });
  createCheckboxInputForm({
    label: "Use Lambert Term",
    value: false,
    onChange: (v) => {
      scene.updateUniform("uUseLambert", v, "cube");
    },
  });
  createSliderInputForm({
    label: "Alpha value",
    value: 1,
    min: 0,
    max: 1,
    step: 0.1,
    onChange: (v) => {
      scene.updateUniform("uAlpha", v, "cube");
    },
  });
  createImageInputForm({
    label: "Texture Image",
    value: "/data/images/webgl.png",
    onInit: (v) => {
      // Create texture
      texture = gl.createTexture();
      loadTexture(v);
    },
    onChange: (v) => {
      loadTexture(v);
    },
  });
  createSelectorForm({
    label: "Magnification Filter",
    value: MagFilter.NEAREST,
    options: Object.values(MagFilter),
    onChange: (v) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[v]);
      gl.bindTexture(gl.TEXTURE_2D, null);
    },
  });
  createSelectorForm({
    label: "Minification Filter",
    value: MinFilter.NEAREST,
    options: Object.values(MinFilter),
    onChange: (v) => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[v]);
      gl.bindTexture(gl.TEXTURE_2D, null);
    },
  });
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "In this example we will show how different texture filter modes work"
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
