import { loadData } from "../../lib/files.js";
import {
  createSelectorForm,
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
import Camera, {
  CAMERA_TYPE,
  PROJECTION_TYPE,
} from "../../lib/webgl/camera.js";
import Controller from "../../lib/webgl/controller.js";
import Instance from "../../lib/webgl/instance.js";
import Axis from "../../lib/webgl/models/axis/index.js";
import Floor from "../../lib/webgl/models/floor/index.js";
import Scene from "../../lib/webgl/scene.js";
import { UniformType } from "../../lib/webgl/types.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;

enum RenderingOrder {
  CONE = "Render cone first",
  WALL = "Render wall first",
}

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uMaterialDiffuse",
  "uMaterialAmbient",
  "uLightAmbient",
  "uLightDiffuse",
  "uLightPosition",
  "uTranslate",
] as const;

const initProgram = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CAMERA_TYPE.ORBITING,
    PROJECTION_TYPE.PERSPECTIVE,
    gl,
    scene
  );
  camera.setPosition(new Vector([0, 5, 35]));
  camera.setAzimuth(47);
  camera.setElevation(-3);
  new Controller({ camera, canvas });

  // Alpha blending configuration
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Config culling
  gl.enable(gl.CULL_FACE);
};

const initData = () => {
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
  scene.add(new Axis({ gl, dimension: 82 }));
  const lightUniforms = {
    uLightPosition: {
      data: [0, 7, 3],
      type: UniformType.FLOAT,
    },
    uLightAmbient: {
      data: [1, 1, 1, 1],
      type: UniformType.FLOAT,
    },
    uLightDiffuse: {
      data: [1, 1, 1, 1],
      type: UniformType.FLOAT,
    },
  };
  loadData("/data/models/geometries/cone3.json").then((data) => {
    const { vertices, indices, diffuse } = data;
    const coneInstance = new Instance<typeof attributes, typeof uniforms>({
      id: "cone",
      gl,
      vertexShaderSource,
      fragmentShaderSource,
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
          type: UniformType.FLOAT,
        },
        uTranslate: {
          data: [0, 0, -5],
          type: UniformType.FLOAT,
        },
        ...lightUniforms,
      },
      indices,
    });
    scene.add(coneInstance);
  });
  loadData("/data/models/geometries/wall.json").then((data) => {
    const { vertices, indices } = data;
    const wallInstance = new Instance<typeof attributes, typeof uniforms>({
      id: "wall",
      gl,
      vertexShaderSource,
      fragmentShaderSource,
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
          data: [0.5, 0.5, 0.2, 1.0],
          type: UniformType.FLOAT,
        },
        uMaterialAmbient: {
          data: [0.2, 0.2, 0.2, 1.0],
          type: UniformType.FLOAT,
        },
        uTranslate: {
          data: [0, 0, 5],
          type: UniformType.FLOAT,
        },
        ...lightUniforms,
      },
      indices,
    });
    scene.add(wallInstance);
  });
};

const initControls = () => {
  initController();
  createSelectorForm({
    label: "Camera type",
    value: CAMERA_TYPE.ORBITING,
    options: Object.values(CAMERA_TYPE),
    onChange: (v) => {
      camera.setType(v);
    },
  });
  createSelectorForm({
    label: "Rendering order",
    value: RenderingOrder.CONE,
    options: Object.values(RenderingOrder),
    onChange: (v) => {
      if (v == RenderingOrder.CONE) {
        // Move cone to end of render order
        scene.renderLast("cone");
        // Move wall to end of render order, so it
        // will be after cone
        scene.renderLast("wall");
      }
      if (v == RenderingOrder.WALL) {
        scene.renderLast("wall");
        scene.renderLast("cone");
      }
    },
  });
  createSliderInputForm({
    label: "Wall Alpha",
    value: 1,
    min: 0,
    max: 1,
    step: 0.1,
    onChange: (v) => {
      const diffuse = scene.getUniform("wall", "uMaterialDiffuse")?.getData();
      if (diffuse) {
        scene.updateUniform(
          "uMaterialDiffuse",
          [...diffuse.slice(0, 3), v],
          "wall"
        );
      }
    },
  });
  createSliderInputForm({
    label: "Cone Alpha",
    value: 1,
    min: 0,
    max: 1,
    step: 0.1,
    onChange: (v) => {
      const diffuse = scene.getUniform("cone", "uMaterialDiffuse")?.getData();
      if (diffuse) {
        scene.updateUniform(
          "uMaterialDiffuse",
          [...diffuse.slice(0, 3), v],
          "cone"
        );
      }
    },
  });
};

const draw = () => {
  scene.render();
};

const render = () => {
  draw();
  requestAnimationFrame(render);
};

const init = () => {
  initGUI();

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initProgram();
  initData();
  render();
  initControls();
};

window.onload = init;
