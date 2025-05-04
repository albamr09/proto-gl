import { loadData } from "@example/utilities/files";
import {
  addChildrenToController,
  createButtonForm,
  createDescriptionPanel,
  createSelectorForm,
  initController,
  initGUI,
} from "@example/utilities/gui/index";
import {
  calculateNormals,
  Vector,
  Camera,
  Controller,
  Instance,
  Scene,
  UniformKind,
  Matrix4,
  FilterTypes,
} from "@proto-gl";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "@example/utilities/web-gl";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";
import NormalFilter from "./normalFilter/index";

type ExtendedFilterTypes = FilterTypes | "normal";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;
let selectedFilters: ExtendedFilterTypes[] = [];

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  camera = new Camera({ gl, scene });
  new Controller({ camera, canvas });
  camera.setAzimuth(-45);
  camera.setElevation(-30);
  camera.setPosition(new Vector([0, 0, 25]));

  // Configure alpha blending
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Configure texture load
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
};

const attributes = ["aPosition", "aNormal", "aTextureCoords"] as const;
const uniforms = [
  "uMaterialDiffuse",
  "uTransformation",
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
          uTransformation: {
            data: Matrix4.identity()
              .scale(new Vector([6, 6, 6]))
              .toFloatArray(),
            type: UniformKind.MATRIX,
          },
          ...lightUniforms,
        },
        indices,
        textures: [
          {
            index: 0,
            uniform: "uSampler",
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

  const { container: addButton } = createButtonForm({
    label: "Add filter",
    onClick: () => {
      const filterSelector = createFilterSelector();
      addChildrenToController([filterSelector]);
    },
  });

  addChildrenToController([addButton]);
};

const createFilterSelector = () => {
  const idx = selectedFilters.length;
  selectedFilters.push("normal");

  const { container: filterSelector } = createSelectorForm({
    label: "Filter",
    value: selectedFilters[idx],
    options: [
      "normal",
      "grayscale",
      "invert",
      "wavy",
      "blur",
      "filmgrain",
      "stretch",
    ],
    onChange: (v) => {
      // Remove previous
      selectedFilters.splice(idx, 1);
      // Add new
      selectedFilters.splice(idx, 0, v as ExtendedFilterTypes);
      const filtersToAdd = selectedFilters.map((filter) => {
        if (filter == "normal") return new NormalFilter();
        else return filter;
      });
      scene.setFilters(filtersToAdd);
    },
  });

  return filterSelector;
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we show how to apply post-processing effects to your scene",
    "ch10/01/"
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
