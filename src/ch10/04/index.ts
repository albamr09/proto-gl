import { loadData } from "../../lib/files.js";
import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
import { calculateNormals } from "../../lib/math/3d.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera from "../../lib/webgl/core/camera/camera.js";
import Controller from "../../lib/webgl/core/events/controller.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";
import Instance from "../../lib/webgl/rendering/instance.js";
import Scene from "../../lib/webgl/rendering/scene.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;

const attributes = [
  "aPosition",
  "aTextureCoords",
  "aNormal",
  "aTangent",
] as const;
const uniforms = [
  "uSampler",
  "uNormalSampler",
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
  "uMaterialAmbient",
] as const;

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  camera = new Camera({ gl, scene });
  new Controller({ camera, canvas });

  camera.setPosition(new Vector([0, 0, 2]));
  camera.setAzimuth(40);
  camera.setElevation(-30);
};

const initData = () => {
  loadData("/data/models/geometries/cube-texture.json").then((data) => {
    const { indices, vertices, textureCoords } = data;

    const instance = new Instance<typeof attributes, typeof uniforms>({
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
        aTextureCoords: {
          data: textureCoords,
          size: 2,
          type: gl.FLOAT,
        },
        aNormal: {
          data: calculateNormals(vertices, indices, 3),
          size: 3,
          type: gl.FLOAT,
        },
        aTangent: {
          data: textureCoords,
          size: 3,
          type: gl.FLOAT,
        },
      },
      uniforms: {
        uLightAmbient: {
          data: [1, 1, 1, 1],
          type: UniformKind.VECTOR_FLOAT,
        },
        uLightDiffuse: {
          data: [1, 1, 1, 1],
          type: UniformKind.VECTOR_FLOAT,
        },
        uLightPosition: {
          data: [0, 5, 20],
          type: UniformKind.VECTOR_FLOAT,
        },
        uMaterialAmbient: {
          data: [0.2, 0.2, 0.2, 1],
          type: UniformKind.VECTOR_FLOAT,
        },
      },
      textures: [
        {
          index: 0,
          source: "/data/images/fieldstone.jpg",
          target: gl.TEXTURE_2D,
          uniform: "uSampler",
        },
        {
          index: 1,
          source: "/data/images/fieldstone-normal.jpg",
          target: gl.TEXTURE_2D,
          uniform: "uNormalSampler",
        },
      ],
    });

    scene.add(instance);
  });
};

const render = () => {
  scene.render();
  requestAnimationFrame(render);
};

const init = () => {
  initGUI();
  createDescriptionPanel("On this example we show how to use normal maps");

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initProgram();
  initData();
  render();
  // Controls
};

window.onload = init;
