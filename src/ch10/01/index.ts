import { loadData } from "../../lib/files.js";
import {
  addChildrenToController,
  createDescriptionPanel,
  createSelectorForm,
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
import Scene from "../../lib/webgl/rendering/scene.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";
import { FilterTypes } from "../../lib/webgl/rendering/postprocess/types.js";
import NormalFilter from "./normalFilter/index.js";
import Filter from "../../lib/webgl/rendering/postprocess/filters/index.js";

type ExtendedFilterTypes = FilterTypes | "normal";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;
let selectedFilter: ExtendedFilterTypes = "normal";
let normalFilter: NormalFilter;

const initProgram = () => {
  normalFilter = new NormalFilter();
  scene = new Scene({ gl, canvas, filters: [normalFilter] });
  camera = new Camera(
    CameraType.ORBITING,
    ProjectionType.PERSPECTIVE,
    gl,
    scene
  );
  new Controller({ camera, canvas });
  camera.setAzimuth(-45);
  camera.setElevation(-30);
  camera.setPosition(new Vector([0, 0, 10]));

  // Configure alpha blending
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Configure texture load
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
};

const attributes = ["aPosition", "aNormal", "aTextureCoords"] as const;
const uniforms = [
  "uMaterialDiffuse",
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
  "uSampler",
] as const;

const initData = () => {
  const lightUniforms = {
    uLightPosition: {
      data: [0, 5, 20],
      type: UniformKind.VECTOR_FLOAT,
    },
    uLightAmbient: {
      data: [1, 1, 1, 1],
      type: UniformKind.VECTOR_FLOAT,
    },
    uLightDiffuse: {
      data: [1, 1, 1, 1],
      type: UniformKind.VECTOR_FLOAT,
    },
  };
  loadData("/data/models/geometries/cube-texture.json").then((data) => {
    const { indices, vertices, diffuse, textureCoords } = data;
    scene.add(
      new Instance<typeof attributes, typeof uniforms>({
        id: "cube",
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
          aTextureCoords: {
            data: textureCoords,
            size: 2,
            type: gl.FLOAT,
          },
        },
        uniforms: {
          uMaterialDiffuse: {
            data: diffuse,
            type: UniformKind.VECTOR_FLOAT,
          },
          uSampler: {
            data: 0,
            type: UniformKind.SCALAR_INT,
          },
          ...lightUniforms,
        },
        indices,
        textures: [
          {
            index: 0,
            source: "/data/images/webgl.png",
            target: gl.TEXTURE_2D,
          },
        ],
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

  const { container: filterSelector } = createSelectorForm({
    label: "Filter",
    value: selectedFilter,
    options: ["normal", "grayscale", "invert", "wavy", "blur", "filmgrain"],
    onChange: (v) => {
      updateFilter((filter) => {
        scene.removeFilter(filter);
      });
      selectedFilter = v as ExtendedFilterTypes;
      updateFilter((filter) => {
        scene.addFilter(filter);
      });
    },
  });

  addChildrenToController([filterSelector]);
};

const updateFilter = (action: (filter: Filter | FilterTypes) => void) => {
  if (selectedFilter == "normal") {
    action(normalFilter);
  } else {
    action(selectedFilter);
  }
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we show how to apply post-processing effects to your scene"
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
