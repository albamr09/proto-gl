import { loadData } from "@example/utilities/files";
import {
  createDescriptionPanel,
  initGUI,
  initController,
  createCheckboxInputForm,
  createSliderInputForm,
  createSelectorForm,
  addChildrenToController,
} from "@example/utilities/gui/index";
import {
  Vector,
  Controller,
  Camera,
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

enum CullingMode {
  FRONT = "FRONT",
  BACK = "BACK",
}

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;
let alphaValue = 0.5;

const attributes = ["aPosition", "aNormal", "aColor"] as const;
const uniforms = ["uLightAmbient", "uLightDiffuse", "uAlpha"] as const;

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  camera = new Camera({ gl, scene });
  camera.setPosition(new Vector([0, 0, 4]));
  camera.setAzimuth(-50);
  camera.setElevation(-30);
  new Controller({ camera, canvas });
};

const initData = () => {
  const lightUniforms = {
    uLightAmbient: {
      data: [1, 1, 1, 1],
      type: UniformKind.SCALAR_FLOAT,
    },
    uLightDiffuse: {
      data: [1, 1, 1, 1],
      type: UniformKind.SCALAR_FLOAT,
    },
  };
  loadData("/data/models/geometries/cube-complex.json").then((data) => {
    const { vertices, indices, scalars } = data;
    const model = new Instance<typeof attributes, typeof uniforms>({
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
        aColor: {
          data: scalars,
          size: 4,
          type: gl.FLOAT,
        },
      },
      indices,
      uniforms: {
        uAlpha: {
          data: alphaValue,
          type: UniformKind.SCALAR_FLOAT,
        },
        ...lightUniforms,
      },
    });
    scene.add(model);
  });
};

const draw = () => {
  scene.render();
};

const render = () => {
  draw();
  requestAnimationFrame(render);
};

const getEnableDisable = (v: boolean) => (v ? "enable" : "disable");

const initControls = () => {
  initController();

  const { container: alphaBlendInput } = createCheckboxInputForm({
    label: "Alpha Blending",
    value: true,
    onInit: (v) => {
      gl[getEnableDisable(v)](gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    },
    onChange: (v) => {
      gl[getEnableDisable(v)](gl.BLEND);
    },
  });
  const { container: faceCullingInput } = createCheckboxInputForm({
    label: "Face culling",
    value: true,
    onInit: (v) => {
      gl[getEnableDisable(v)](gl.CULL_FACE);
    },
    onChange: (v) => {
      gl[getEnableDisable(v)](gl.CULL_FACE);
    },
  });
  const { container: cullingModeInput } = createSelectorForm({
    label: "Culling Mode",
    value: CullingMode.FRONT,
    options: Object.values(CullingMode),
    onChange: (v) => {
      gl.cullFace(gl[v]);
    },
  });
  const { container: alphaValueInput } = createSliderInputForm({
    label: "Alpha Value",
    value: alphaValue,
    min: 0,
    max: 1,
    step: 0.1,
    onChange: (v) => {
      scene.updateUniform("uAlpha", v, "cube");
    },
  });
  addChildrenToController([
    alphaBlendInput,
    faceCullingInput,
    cullingModeInput,
    alphaValueInput,
  ]);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we will showcase how face culling works by enabling/disabling this phase on the rendering line. When it is enabled we can also configure how face culling is applied. Either by rendering either the front face of each polygon or by rendering the back face. Back culling means we discard the faces not 'visible' by the user, while front culling means we discard the faces seen by the user.",
    "ch06/07/"
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initProgram();
  initData();
  initControls();
  render();
};

window.onload = init;
