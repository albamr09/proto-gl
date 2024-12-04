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
import Camera from "../../lib/webgl/camera/camera.js";
import Controller from "../../lib/webgl/camera/controller.js";
import Instance from "../../lib/webgl/rendering/instance.js";
import Scene from "../../lib/webgl/rendering/scene.js";
import Texture from "../../lib/webgl/core/texture.js";

import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";
import { CameraType, ProjectionType } from "../../lib/webgl/camera/types.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";

const attributes = ["aPosition", "aNormal", "aTextureCoords", "aColor"];
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

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;

const initProgram = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CameraType.ORBITING,
    ProjectionType.PERSPECTIVE,
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

const initData = async () => {
  loadData("/data/models/geometries/cube-texture.json").then((data) => {
    const { indices, vertices, diffuse, scalars, image, textureCoords } = data;
    // TODO: maybe this should be inside instance
    const texture = new Texture(image.replace("/common", "/data"));
    await texture.loadImageData();
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
          data: false,
          type: UniformKind.SCALAR_INT,
        },
        uAlpha: {
          data: 1,
          type: UniformKind.SCALAR_FLOAT,
        },
        uSampler: {
          data: 0,
          type: UniformKind.SCALAR_INT,
        },
        ...lightUniforms,
      },
      texture,
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
