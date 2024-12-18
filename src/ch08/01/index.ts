import { loadData } from "../../lib/files.js";
import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
import { Matrix4 } from "../../lib/math/matrix.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera from "../../lib/webgl/camera/camera.js";
import Controller from "../../lib/webgl/camera/controller.js";
import { CameraType, ProjectionType } from "../../lib/webgl/camera/types.js";
import Program from "../../lib/webgl/core/program.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";
import Floor from "../../lib/webgl/models/floor/index.js";
import Instance from "../../lib/webgl/rendering/instance.js";
import Scene from "../../lib/webgl/rendering/scene.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

const attributes = ["aPosition"] as const;
const uniforms = ["uMaterialDiffuse", "uTransform"] as const;

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let program: Program<typeof attributes, typeof uniforms>;

const initProgram = () => {
  scene = new Scene(gl);
  const camera = new Camera(
    CameraType.ORBITING,
    ProjectionType.PERSPECTIVE,
    gl,
    scene
  );
  new Controller({ camera, canvas });
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
};

const loadObject = (
  path: string,
  id: string,
  properties: { translate: Vector; scale: Vector; color?: number[] }
) => {
  loadData(path).then((data) => {
    const { vertices, indices, diffuse } = data;
    const instance = new Instance<typeof attributes, typeof uniforms>({
      id,
      gl,
      program,
      indices,
      attributes: {
        aPosition: {
          data: vertices,
          size: 3,
          type: gl.FLOAT,
        },
      },
      uniforms: {
        uMaterialDiffuse: {
          data: properties.color ?? diffuse ?? [1, 1, 1, 1],
          type: UniformKind.VECTOR_FLOAT,
        },
        uTransform: {
          data: Matrix4.identity()
            .translate(properties.translate)
            .scale(properties.scale)
            .toFloatArray(),
          type: UniformKind.MATRIX,
        },
      },
    });
    scene.add(instance);
  });
};

const initData = () => {
  loadObject("/data/models/geometries/ball.json", "ball", {
    translate: new Vector([0, 0, -4]),
    scale: new Vector([3, 3, 3]),
    color: [1, 0, 0, 1],
  });
  loadObject("/data/models/geometries/ball.json", "disk", {
    translate: new Vector([-10, 0, -10]),
    scale: new Vector([3, 0.5, 3]),
    color: [0.3, 0.1, 0.9, 0.5],
  });
  loadObject("/data/models/geometries/flag.json", "flag", {
    translate: new Vector([-10, 0, 0]),
    scale: new Vector([1, 1, 1]),
  });
  loadObject("/data/models/geometries/cone3.json", "cone", {
    translate: new Vector([10, 0, 5]),
    scale: new Vector([1, 1, 1]),
  });
  loadObject("/data/models/geometries/cone3.json", "cone2", {
    translate: new Vector([-7, 0, 2]),
    scale: new Vector([0.5, 1, 0.5]),
    color: [0.3, 0.3, 0.6, 1],
  });
  loadObject("/data/models/geometries/cube-complex.json", "cube", {
    translate: new Vector([1, 2, 7]),
    scale: new Vector([4, 4, 4]),
    color: [0.1, 1, 0.2, 1],
  });
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
};

const render = () => {
  scene.render();
  requestAnimationFrame(render);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "This is an example on how to implement picking based on the color of each object using an offscreen framebuffer."
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
