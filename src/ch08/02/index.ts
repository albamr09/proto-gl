import { vertices } from "../../ch03/data/data.js";
import { loadData } from "../../lib/files.js";
import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
import { calculateNormals } from "../../lib/math/3d.js";
import { Matrix4 } from "../../lib/math/matrix.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera from "../../lib/webgl/core/camera/camera.js";
import {
  CameraType,
  ProjectionType,
} from "../../lib/webgl/core/camera/types.js";
import Controller from "../../lib/webgl/core/events/controller.js";
import PickingController from "../../lib/webgl/core/picking/picking.js";
import Program from "../../lib/webgl/core/program.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";
import Axis from "../../lib/webgl/models/axis/index.js";
import Floor from "../../lib/webgl/models/floor/index.js";
import Instance from "../../lib/webgl/rendering/instance.js";
import Scene from "../../lib/webgl/rendering/scene.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uLabelColor",
  "uMaterialDiffuse",
  "uTransform",
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
  "uOffScreen",
  "uAlpha",
] as const;

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let program: Program<typeof attributes, typeof uniforms>;

const initProgram = () => {
  scene = new Scene(gl, true);
  const camera = new Camera(
    CameraType.ORBITING,
    ProjectionType.PERSPECTIVE,
    gl,
    scene
  );
  const pickingController = new PickingController(scene, canvas);
  new Controller({ camera, canvas, pickingController });
  camera.setPosition(new Vector([0, 0, 40]));
  camera.setElevation(-40);
  camera.setAzimuth(30);

  program = new Program<typeof attributes, typeof uniforms>(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    attributes,
    uniforms
  );

  // Alpha blending configuration
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Config culling
  gl.enable(gl.CULL_FACE);
};

const loadObject = (
  path: string,
  id: string,
  properties?: {
    color?: number[];
    translationVector?: Vector;
    scaleVector?: Vector;
    rotationVector?: Vector;
  }
) => {
  const ligthUniforms = {
    uLightAmbient: {
      data: [0, 0, 0, 1],
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
  };
  loadData(path).then((data) => {
    const { vertices, indices } = data;
    const ballInstance = new Instance({
      id,
      gl,
      program,
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
      },
      indices,
      uniforms: {
        uOffScreen: {
          data: false,
          type: UniformKind.SCALAR_INT,
        },
        uMaterialDiffuse: {
          data: properties?.color ?? [1, 1, 1, 1],
          type: UniformKind.VECTOR_FLOAT,
        },
        uLabelColor: {
          data: [0, 0, 0, 1],
          type: UniformKind.VECTOR_FLOAT,
        },
        uTransform: {
          data: Matrix4.identity()
            .translate(properties?.translationVector ?? new Vector([0, 0, 0]))
            .rotateVecDeg(properties?.rotationVector ?? new Vector([0, 0, 0]))
            .scale(properties?.scaleVector ?? new Vector([1, 1, 1]))
            .toFloatArray(),
          type: UniformKind.MATRIX,
        },
        uAlpha: {
          data: 1,
          type: UniformKind.SCALAR_FLOAT,
        },
        ...ligthUniforms,
      },
      transformationProperties: { ...properties },
    });
    scene.add(ballInstance);
  });
};

const initData = () => {
  const nObjects = 100;
  const maxX = 30;
  const maxZ = 30;
  Array.from({ length: nObjects }).forEach((_, i) => {
    const generatedX = Math.random() * maxX - maxX / 2;
    const generatedZ = Math.random() * maxZ - maxZ / 2;
    loadObject("/data/models/geometries/ball.json", `ball-${i}`, {
      translationVector: new Vector([generatedX, 0, generatedZ]),
      scaleVector: new Vector([0.7, 0.7, 0.7]),
      color: [Math.random(), Math.random(), Math.random(), 1],
    });
  });
  scene.add(new Floor({ gl, dimension: 82, lines: 4 }));
  scene.add(new Axis({ gl, dimension: 82 }));
};

const render = () => {
  scene.render();
  requestAnimationFrame(render);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we will showcase how we can use unique ids in order to determine which object is selected."
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initProgram();
  initData();
  render();
  // Controls
};

window.onload = init;
