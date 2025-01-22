import { createDescriptionPanel, initGUI } from "../lib/gui/index.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../lib/web-gl.js";
import Camera from "../lib/webgl/core/camera/camera.js";
import { CameraType, ProjectionType } from "../lib/webgl/core/camera/types.js";
import Controller from "../lib/webgl/core/events/controller.js";
import Floor from "../lib/webgl/models/floor/index.js";
import Scene from "../lib/webgl/rendering/scene.js";
import { loadData } from "../lib/files.js";
import Instance from "../lib/webgl/rendering/instance.js";
import Program from "../lib/webgl/core/program.js";
import vertexShaderSource from "./vs.gsls.js";
import fragmentShaderSource from "./fs.gsls.js";
import { Vector } from "../lib/math/vector.js";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;

const attributes = ["aPosition"] as const;

const initProgram = () => {
  scene = new Scene(gl);
  const camera = new Camera(
    CameraType.TRACKING,
    ProjectionType.PERSPECTIVE,
    gl,
    scene
  );
  new Controller({ camera, canvas });
  camera.setPosition(new Vector([0, 0.5, 5]));
  camera.setAzimuth(25);
  camera.setElevation(-10);
};

const initData = () => {
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));

  const program = new Program<typeof attributes>(
    gl,
    vertexShaderSource,
    fragmentShaderSource
  );

  for (let i = 1; i < 25; i++) {
    loadData(`/data/models/bmw-i8/part${i}.json`).then((data) => {
      const { vertices, indices } = data;
      console.log(i);
      const instance = new Instance<typeof attributes>({
        id: `model${i}`,
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
      });
      scene.add(instance);
    });
  }
};

const render = () => {
  requestAnimationFrame(render);
  scene.render();
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we will create a demo application using our WebGL library."
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
