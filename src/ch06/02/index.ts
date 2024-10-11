import { loadData } from "../../lib/files.js";
import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
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
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

let canvas: HTMLCanvasElement;
let gl: WebGL2RenderingContext;
let scene: Scene;
let camera: Camera;

const initScene = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CAMERA_TYPE.ORBITING,
    PROJECTION_TYPE.PERSPECTIVE,
    gl,
    scene
  );
  camera.setPosition(new Vector([0, 5, 30]));
  camera.setAzimuth(0);
  camera.setElevation(-3);
  new Controller({ camera, canvas });
};

const LightAttributes = ["aPos"] as const;

const initData = () => {
  loadData("/data/models/geometries/sphere3.json").then((data) => {
    const { vertices, indices, ambient, diffuse, specular } = data;
    scene.add(
      new Instance<typeof LightAttributes>({
        id: "red-light",
        gl,
        vertexShaderSource,
        fragmentShaderSource,
        attributes: {
          aPos: {
            data: vertices,
            size: 3,
            type: gl.FLOAT,
          },
        },
        indices,
      })
    );
  });
};

const render = () => {
  scene.render();
  requestAnimationFrame(render);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "In this example we will show how to render different light sources on the same scene"
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initScene();
  // Lights?
  initData();
  render();
  // Controls
};

window.onload = init;
