import { loadData } from "@example/utilities/files";
import { createDescriptionPanel, initGUI } from "@example/utilities/gui/index";
import {
  Axis,
  Floor,
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

const attributes = ["aPosition", "aTextureCoords"] as const;
const uniforms = ["uSampler", "uCubeSampler", "uMaterialDiffuse"] as const;

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  camera = new Camera({ gl, scene });
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
        uMaterialDiffuse: {
          data: diffuse,
          type: UniformKind.VECTOR_FLOAT,
        },
      },
      textures: [
        {
          index: 0,
          uniform: "uSampler",
          target: gl.TEXTURE_2D,
          source: "/data/images/webgl.png",
          configuration: { generateMipmap: true },
        },
        {
          index: 1,
          uniform: "uCubeSampler",
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
