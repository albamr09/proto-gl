import { loadData } from "../../lib/files.js";
import {
  addChildrenToController,
  createDescriptionPanel,
  createNumericInput,
  initController,
  initGUI,
} from "../../lib/gui/index.js";
import { calculateNormals, computeTangents } from "../../lib/math/3d.js";
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
const SHININESS = 8;

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
  "uMaterialDiffuse",
  "uShininess",
] as const;

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  camera = new Camera({ gl, scene });
  new Controller({ camera, canvas });

  camera.setPosition(new Vector([0, 0, 2.8]));
  camera.setAzimuth(40);
  camera.setElevation(-30);
};

const initData = () => {
  loadData("/data/models/geometries/cube-texture.json").then((data) => {
    const { indices, vertices, textureCoords, diffuse } = data;

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
          data: computeTangents(vertices, textureCoords, indices),
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
        uMaterialDiffuse: {
          data: diffuse,
          type: UniformKind.VECTOR_FLOAT,
        },
        uShininess: {
          data: SHININESS,
          type: UniformKind.SCALAR_FLOAT,
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

const initControls = () => {
  initController();
  const { container: shininessContainer } = createNumericInput({
    label: "Shininess",
    value: SHININESS,
    min: 0,
    max: 10000,
    step: 1,
    onChange: (value) => {
      scene.updateUniform("uShininess", value);
    },
  });

  addChildrenToController([shininessContainer]);
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
  initControls();
};

window.onload = init;
