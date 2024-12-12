import { loadData } from "../../lib/files.js";
import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera from "../../lib/webgl/camera/camera.js";
import Controller from "../../lib/webgl/camera/controller.js";
import { CameraType, ProjectionType } from "../../lib/webgl/camera/types.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";
import Axis from "../../lib/webgl/models/axis/index.js";
import Floor from "../../lib/webgl/models/floor/index.js";
import Instance from "../../lib/webgl/rendering/instance.js";
import Scene from "../../lib/webgl/rendering/scene.js";

import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;

const attributes = ["aPosition", "aTextureCoords"] as const;
const uniforms = ["uSampler", "uCubeSampler", "uMaterialDiffuse"] as const;

const initProgram = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CameraType.ORBITING,
    ProjectionType.PERSPECTIVE,
    gl,
    scene
  );
  new Controller({ camera, canvas });
  camera.setPosition(new Vector([0, 0, 4]));
  camera.setAzimuth(45);
  camera.setElevation(-30);

  // Textures
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
};

const initData = () => {
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
  scene.add(new Axis({ gl, dimension: 82 }));
  loadData("/data/models/geometries/cube-texture.json").then((data) => {
    const { vertices, indices, diffuse, textureCoords } = data;
    const cubeInstance = new Instance<typeof attributes, typeof uniforms>({
      id: "cube",
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      indices,
      attributes: {
        aPosition: {
          data: vertices,
          type: gl.FLOAT,
          size: 3,
        },
        aTextureCoords: {
          data: textureCoords,
          type: gl.FLOAT,
          size: 2,
        },
      },
      uniforms: {
        uSampler: {
          data: 0,
          type: UniformKind.SCALAR_INT,
        },
        uCubeSampler: {
          data: 1,
          type: UniformKind.SCALAR_INT,
        },
        uMaterialDiffuse: {
          data: diffuse,
          type: UniformKind.VECTOR_FLOAT,
        },
      },
      textures: [
        {
          index: 0,
          target: gl.TEXTURE_2D,
          source: "/data/images/webgl.png",
          configuration: { generateMipmap: true },
        },
        {
          index: 1,
          target: gl.TEXTURE_CUBE_MAP,
          faces: {
            [gl.TEXTURE_CUBE_MAP_POSITIVE_X]:
              "/data/images/cubemap/positive-x.png",
            [gl.TEXTURE_CUBE_MAP_POSITIVE_Y]:
              "/data/images/cubemap/positive-y.png",
            [gl.TEXTURE_CUBE_MAP_POSITIVE_Z]:
              "/data/images/cubemap/positive-z.png",
            [gl.TEXTURE_CUBE_MAP_NEGATIVE_X]:
              "/data/images/cubemap/negative-x.png",
            [gl.TEXTURE_CUBE_MAP_NEGATIVE_Y]:
              "/data/images/cubemap/negative-y.png",
            [gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]:
              "/data/images/cubemap/negative-z.png",
          },
        },
      ],
    });
    scene.add(cubeInstance);
  });
};

const draw = () => {
  scene.render();
};

const render = () => {
  requestAnimationFrame(render);
  draw();
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we'll show how you can use cube maps in order to map textures using 3D coordinates"
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initProgram();
  initData();
  // Controls
  render();
};

window.onload = init;
