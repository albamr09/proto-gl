import { loadData } from "../../lib/files.js";
import {
  addChildrenToController,
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
import Camera from "../../lib/webgl/core/camera/camera.js";
import {
  CameraType,
  ProjectionType,
} from "../../lib/webgl/core/camera/types.js";
import Controller from "../../lib/webgl/core/events/controller.js";
import Instance from "../../lib/webgl/rendering/instance.js";
import Axis from "../../lib/webgl/models/axis/index.js";
import Floor from "../../lib/webgl/models/floor/index.js";
import Scene from "../../lib/webgl/rendering/scene.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";
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
    CameraType.ORBITING,
    ProjectionType.PERSPECTIVE,
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
      type: UniformKind.SCALAR_FLOAT,
    },
    uLightAmbient: {
      data: [1, 1, 1, 1],
      type: UniformKind.SCALAR_FLOAT,
    },
    uLightDiffuse: {
      data: [1, 1, 1, 1],
      type: UniformKind.SCALAR_FLOAT,
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
          type: UniformKind.SCALAR_FLOAT,
        },
        uTranslate: {
          data: [0, 0, -5],
          type: UniformKind.SCALAR_FLOAT,
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
          type: UniformKind.SCALAR_FLOAT,
        },
        uMaterialAmbient: {
          data: [0.2, 0.2, 0.2, 1.0],
          type: UniformKind.SCALAR_FLOAT,
        },
        uTranslate: {
          data: [0, 0, 5],
          type: UniformKind.SCALAR_FLOAT,
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
  const { container: cameraTypeInput } = createSelectorForm({
    label: "Camera type",
    value: CameraType.ORBITING,
    options: Object.values(CameraType),
    onChange: (v) => {
      camera.setType(v);
    },
  });
  const { container: renderingOrderInput } = createSelectorForm({
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
  const { container: wallAlphaInput } = createSliderInputForm({
    label: "Wall Alpha",
    value: 1,
    min: 0,
    max: 1,
    step: 0.1,
    onChange: (v) => {
      // TODO: i should know the typeo f the data and the type of the uniform just from its name
      const diffuse = scene.getUniform("wall", "uMaterialDiffuse")?.getData();
      // TODO: i should not be checking if this is array
      if (diffuse && Array.isArray(diffuse)) {
        scene.updateUniform(
          "uMaterialDiffuse",
          [...diffuse.slice(0, 3), v],
          "wall"
        );
      }
    },
  });
  const { container: coneAlphaInput } = createSliderInputForm({
    label: "Cone Alpha",
    value: 1,
    min: 0,
    max: 1,
    step: 0.1,
    onChange: (v) => {
      const diffuse = scene.getUniform("cone", "uMaterialDiffuse")?.getData();
      // TODO: i should not be checking if this is array
      if (diffuse && Array.isArray(diffuse)) {
        scene.updateUniform(
          "uMaterialDiffuse",
          [...diffuse.slice(0, 3), v],
          "cone"
        );
      }
    },
  });
  addChildrenToController([
    cameraTypeInput,
    renderingOrderInput,
    wallAlphaInput,
    coneAlphaInput,
  ]);
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
