import { loadData } from "../../lib/files.js";
import {
  createCheckboxInputForm,
  createDescriptionPanel,
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
import Camera from "../../lib/webgl/camera.js";
import Controller from "../../lib/webgl/controller.js";
import Instance from "../../lib/webgl/instance.js";
import Scene from "../../lib/webgl/scene.js";
import Texture from "../../lib/webgl/texture.js";
import {
  CAMERA_TYPE,
  PROJECTION_TYPE,
  UniformType,
} from "../../lib/webgl/types.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

const attributes = ["aPosition", "aNormal", "aTextureCoords", "aColor"];

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;

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
};

const initData = () => {
  loadData("/data/models/geometries/cube-texture.json").then((data) => {
    const { indices, vertices, diffuse, scalars, image, textureCoords } = data;
    const texture = new Texture(image.replace("/common", "/data"));
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
    const cubeObject = new Instance<typeof attributes>({
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
  // createImageInputForm({
  //   label: "Texture Image",
  //   value: "/data/images/webgl.png",
  //   onInit: (v) => {
  //     // Create texture
  //     texture = gl.createTexture();
  //     loadTexture(v);
  //   },
  //   onChange: (v) => {
  //     loadTexture(v);
  //   },
  // });
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "In this example we will show how to use the differente texture wrapping modes."
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
