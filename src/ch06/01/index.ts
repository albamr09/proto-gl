import { loadData } from "../../lib/files.js";
import {
  createCheckboxInputForm,
  createDescriptionPanel,
  createNumericInput,
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
import Camera, {
  CAMERA_TYPE,
  PROJECTION_TYPE,
} from "../../lib/webgl/camera.js";
import Controller from "../../lib/webgl/controller.js";
import Mesh from "../../lib/webgl/models/mesh/index.js";
import Scene from "../../lib/webgl/scene.js";
import { UniformType } from "../../lib/webgl/uniforms.js";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;
let useLambert = false,
  usePerVertex = false,
  showComplexCube = false,
  alphaValue = 1.0;

const initProgram = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CAMERA_TYPE.ORBITING,
    PROJECTION_TYPE.PERSPECTIVE,
    gl,
    scene
  );
  new Controller({ camera, canvas });
  camera.setAzimuth(45);
  camera.setElevation(-30);
  camera.setPosition(new Vector([0, 0, 3]));
};

const initData = () => {
  loadData("/data/models/geometries/cube-simple.json").then((data) => {
    const { indices, vertices, diffuse } = data;
    scene.add(
      new Mesh({
        id: "cube-simple",
        gl,
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
        uniforms: {
          uMaterialDiffuse: {
            data: diffuse,
            type: UniformType.VECTOR_FLOAT,
          },
        },
        indices,
      })
    );
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
    label: "Use Lambert",
    value: useLambert,
    onInit: (v) => {
      useLambert = v;
    },
    onChange: (v) => {
      useLambert = v;
    },
  });
  createCheckboxInputForm({
    label: "Use Per-Vertex",
    value: usePerVertex,
    onInit: (v) => {
      usePerVertex = v;
    },
    onChange: (v) => {
      usePerVertex = v;
    },
  });
  createCheckboxInputForm({
    label: "Show Complex Cube",
    value: showComplexCube,
    onInit: (v) => {
      showComplexCube = v;
    },
    onChange: (v) => {
      showComplexCube = v;
    },
  });
  createNumericInput({
    label: "Alpha Value",
    value: alphaValue,
    min: 0,
    max: 1,
    step: 0.05,
    onInit: (v) => {
      alphaValue = v;
    },
    onChange: (v) => {
      alphaValue = v;
    },
  });
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we show the difference between constant coloring and per-vertex coloring."
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
