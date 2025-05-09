import { loadData } from "@example/utilities/files";
import {
  addChildrenToController,
  createCheckboxInputForm,
  createDescriptionPanel,
  createNumericInput,
  initController,
  initGUI,
} from "@example/utilities/gui/index";
import {
  calculateNormals,
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

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;
let useLambert = true,
  usePerVertex = false,
  showComplexCube = false,
  alphaValue = 1.0;

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  camera = new Camera({ gl, scene });
  new Controller({ camera, canvas });
  camera.setAzimuth(-45);
  camera.setElevation(-30);
  camera.setPosition(new Vector([0, 0, 3]));
};

const attributes = ["aPosition", "aNormal", "aColor"] as const;
const uniforms = [
  "uMaterialDiffuse",
  "uUsePerVertexColoring",
  "uUseLambert",
  "uAlpha",
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
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
  loadData("/data/models/geometries/cube-complex.json").then((data) => {
    const { indices, diffuse, vertices, scalars } = data;
    scene.add(
      new Instance<typeof attributes, typeof uniforms>({
        id: "cube-complex",
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
          aColor: {
            data: scalars,
            size: 4,
            type: gl.FLOAT,
          },
        },
        uniforms: {
          uMaterialDiffuse: {
            data: diffuse,
            type: UniformKind.VECTOR_FLOAT,
          },
          uUseLambert: {
            data: useLambert,
            type: UniformKind.SCALAR_INT,
          },
          uUsePerVertexColoring: {
            data: usePerVertex,
            type: UniformKind.SCALAR_INT,
          },
          uAlpha: {
            data: alphaValue,
            type: UniformKind.SCALAR_FLOAT,
          },
          ...lightUniforms,
        },
        indices,
        configuration: {
          visible: false,
        },
      })
    );
  });
  loadData("/data/models/geometries/cube-simple.json").then((data) => {
    const { indices, vertices, diffuse, scalars } = data;
    scene.add(
      new Instance<typeof attributes, typeof uniforms>({
        id: "cube-simple",
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
          aColor: {
            data: scalars,
            size: 4,
            type: gl.FLOAT,
          },
        },
        uniforms: {
          uMaterialDiffuse: {
            data: diffuse,
            type: UniformKind.VECTOR_FLOAT,
          },
          uUseLambert: {
            data: useLambert,
            type: UniformKind.SCALAR_INT,
          },
          uUsePerVertexColoring: {
            data: usePerVertex,
            type: UniformKind.SCALAR_INT,
          },
          uAlpha: {
            data: alphaValue,
            type: UniformKind.SCALAR_FLOAT,
          },
          ...lightUniforms,
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
  const { container: useLambertInput } = createCheckboxInputForm({
    label: "Use Lambert",
    value: useLambert,
    onInit: (v) => {
      useLambert = v;
    },
    onChange: (v) => {
      useLambert = v;
      scene.updateUniform("uUseLambert", v);
    },
  });
  const { container: usePerVertexInput } = createCheckboxInputForm({
    label: "Use Per-Vertex",
    value: usePerVertex,
    onInit: (v) => {
      usePerVertex = v;
    },
    onChange: (v) => {
      usePerVertex = v;
      scene.updateUniform("uUsePerVertexColoring", v);
    },
  });
  const { container: showComplexCubeInput } = createCheckboxInputForm({
    label: "Show Complex Cube",
    value: showComplexCube,
    onInit: (v) => {
      showComplexCube = v;
    },
    onChange: (v) => {
      showComplexCube = v;
      scene.setConfigurationValue("visible", v, "cube-complex");
      scene.setConfigurationValue("visible", !v, "cube-simple");
    },
  });
  const { container: alphaInput } = createNumericInput({
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
      scene.updateUniform("uAlpha", v);
      // Allow translucency
      if (v < 1) {
        scene.setGLParameters((gl) => {
          gl.disable(gl.DEPTH_TEST);
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        });
      } else {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.disable(gl.BLEND);
      }
    },
  });

  addChildrenToController([
    useLambertInput,
    usePerVertexInput,
    showComplexCubeInput,
    alphaInput,
  ]);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we show the difference between constant coloring and per-vertex coloring.",
    "ch06/01/"
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
