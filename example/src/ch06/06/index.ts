import { loadData } from "@example/utilities/files";
import {
  rgbToHex,
  denormalizeColor,
  hexToRgb,
  normalizeColor,
} from "@example/utilities/colors";
import {
  addChildrenToController,
  createCheckboxInputForm,
  createCollapsibleComponent,
  createColorInputForm,
  createDescriptionPanel,
  createSelectorForm,
  createSliderInputForm,
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
  Axis,
  Floor,
  Matrix4,
} from "@proto-gl";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "@example/utilities/web-gl";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

enum Order {
  SPHERE = "Sphere first",
  CONE = "Cone first",
}

enum BlendEquation {
  FUNC_ADD = "FUNC_ADD",
  FUNC_SUBTRACT = "FUNC_SUBTRACT",
  FUNC_REVERSE_SUBTRACT = "FUNC_REVERSE_SUBTRACT",
}

enum BlendFunc {
  ZERO = "ZERO",
  ONE = "ONE",
  SRC_COLOR = "SRC_COLOR",
  DST_COLOR = "DST_COLOR",
  SRC_ALPHA = "SRC_ALPHA",
  DST_ALPHA = "DST_ALPHA",
  CONSTANT_COLOR = "CONSTANT_COLOR",
  CONSTANT_ALPHA = "CONSTANT_ALPHA",
  ONE_MINUS_SRC_ALPHA = "ONE_MINUS_SRC_ALPHA",
  ONE_MINUS_DST_ALPHA = "ONE_MINUS_DST_ALPHA",
  ONE_MINUS_SRC_COLOR = "ONE_MINUS_SRC_COLOR",
  ONE_MINUS_DST_COLOR = "ONE_MINUS_DST_COLOR",
  ONE_MINUS_CONSTANT_COLOR = "ONE_MINUS_CONSTANT_COLOR",
  ONE_MINUS_CONSTANT_ALPHA = "ONE_MINUS_CONSTANT_ALPHA",
}

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;
let sphereColor: number[];
let sphereAlpha = 1;
let coneColor: number[];
let coneAlpha = 1;
let sourceFunction = BlendFunc.SRC_ALPHA;
let destinationFunction = BlendFunc.ONE_MINUS_SRC_ALPHA;
let alphaValue = 1;
let blendColor = [0, 0, 0];
let renderingOrder = Order.SPHERE;

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  camera = new Camera({ gl, scene });
  new Controller({ camera, canvas });
  camera.setPosition(new Vector([0, 5, 35]));
  camera.setAzimuth(-25);
  camera.setElevation(-25);
};

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uMaterialDiffuse",
  "uLightAmbient",
  "uLightDiffuse",
  "uLightPosition",
  "uUseLambert",
  "uTransform",
] as const;

const initData = () => {
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
  scene.add(new Axis({ gl, dimension: 82 }));
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
  loadData("/data/models/geometries/cone3.json").then((data) => {
    const { diffuse, vertices, indices } = data;
    coneColor = diffuse.slice(0, 3);
    scene.add(
      new Instance<typeof attributes, typeof uniforms>({
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
            type: UniformKind.VECTOR_FLOAT,
          },
          uUseLambert: {
            data: true,
            type: UniformKind.SCALAR_INT,
          },
          uTransform: {
            data: Matrix4.identity()
              .translate(new Vector([0, 0, -3.5]))
              .toFloatArray(),
            type: UniformKind.MATRIX,
          },
          ...lightUniforms,
        },
        indices,
      })
    );
  });
  loadData("/data/models/geometries/sphere2.json").then((data) => {
    const { diffuse, vertices, indices } = data;
    sphereColor = diffuse.slice(0, 3);
    scene.add(
      new Instance<typeof attributes, typeof uniforms>({
        id: "sphere",
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
            type: UniformKind.VECTOR_FLOAT,
          },
          uUseLambert: {
            data: true,
            type: UniformKind.SCALAR_INT,
          },
          uTransform: {
            data: Matrix4.identity()
              .scale(new Vector([0.5, 0.5, 0.5]))
              .translate(new Vector([0, 0, 2.5]))
              .toFloatArray(),
            type: UniformKind.MATRIX,
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
  draw();
  requestAnimationFrame(render);
};

const getEnableOrDisable = (x: boolean) => {
  return x ? "enable" : "disable";
};

const initControls = () => {
  initController();
  const { container: enableBlendInput } = createCheckboxInputForm({
    label: "Blending",
    value: true,
    onInit: (v) => {
      gl[getEnableOrDisable(v)](gl.BLEND);
    },
    onChange: (v) => {
      gl[getEnableOrDisable(v)](gl.BLEND);
    },
  });
  const { container: enableDepthTestInput } = createCheckboxInputForm({
    label: "Depth Test",
    value: true,
    onInit: (v) => {
      gl[getEnableOrDisable(v)](gl.BLEND);
    },
    onChange: (v) => {
      gl[getEnableOrDisable(v)](gl.BLEND);
    },
  });
  const { container: enableFaceCullingInput } = createCheckboxInputForm({
    label: "Face culling",
    value: true,
    onInit: (v) => {
      gl[getEnableOrDisable(v)](gl.CULL_FACE);
    },
    onChange: (v) => {
      gl[getEnableOrDisable(v)](gl.CULL_FACE);
    },
  });
  const { container: useLambertInput } = createCheckboxInputForm({
    label: "Use Lambert Term",
    value: true,
    onChange: (v) => {
      scene.updateUniform("uUseLambert", v);
    },
  });
  const { container: sphereColorInput } = createColorInputForm({
    label: "Sphere Color",
    value: rgbToHex(denormalizeColor(sphereColor ?? [0, 0, 0])),
    onChange: (v) => {
      const color = normalizeColor(hexToRgb(v));
      sphereColor = color;
      scene.updateUniform(
        "uMaterialDiffuse",
        [...color, sphereAlpha],
        "sphere"
      );
    },
  });
  const { container: sphereAlphaInput } = createSliderInputForm({
    label: "Sphere Alpha",
    value: sphereAlpha,
    min: 0,
    max: 1,
    step: 0.1,
    onChange: (v) => {
      sphereAlpha = v;
      scene.updateUniform("uMaterialDiffuse", [...sphereColor, v], "sphere");
    },
  });
  const { container: coneColorInput } = createColorInputForm({
    label: "Cone Color",
    value: rgbToHex(denormalizeColor(coneColor ?? [0, 0, 0])),
    onChange: (v) => {
      const color = normalizeColor(hexToRgb(v));
      coneColor = color;
      scene.updateUniform("uMaterialDiffuse", [...color, coneAlpha], "cone");
    },
  });
  const { container: coneAlphaInput } = createSliderInputForm({
    label: "Cone Alpha",
    value: coneAlpha,
    min: 0,
    max: 1,
    step: 0.1,
    onChange: (v) => {
      coneAlpha = v;
      scene.updateUniform("uMaterialDiffuse", [...coneColor, v], "cone");
    },
  });
  const { container: blendEquationInput } = createSelectorForm({
    label: "Blend Function",
    value: BlendEquation.FUNC_ADD,
    options: Object.values(BlendEquation),
    onInit: (v) => {
      gl.blendEquation(gl[v]);
    },
    onChange: (v) => {
      gl.blendEquation(gl[v]);
    },
  });
  const { container: sourceFunctionInput } = createSelectorForm({
    label: "Source Function",
    value: sourceFunction,
    options: Object.values(BlendFunc),
    onInit: (v) => {
      sourceFunction = v;
      gl.blendFunc(gl[v], gl[destinationFunction]);
    },
    onChange: (v) => {
      sourceFunction = v;
      gl.blendFunc(gl[v], gl[destinationFunction]);
    },
  });
  const { container: destinationFunctionInput } = createSelectorForm({
    label: "Destination Function",
    value: destinationFunction,
    options: Object.values(BlendFunc),
    onInit: (v) => {
      destinationFunction = v;
      gl.blendFunc(gl[sourceFunction], gl[v]);
    },
    onChange: (v) => {
      destinationFunction = v;
      gl.blendFunc(gl[sourceFunction], gl[v]);
    },
  });
  const { container: blendColorInput } = createColorInputForm({
    label: "Blend color",
    value: rgbToHex(denormalizeColor(blendColor)),
    onInit: (v) => {
      blendColor = normalizeColor(hexToRgb(v));
      gl.blendColor(blendColor[0], blendColor[1], blendColor[2], alphaValue);
    },
    onChange: (v) => {
      blendColor = normalizeColor(hexToRgb(v));
      gl.blendColor(blendColor[0], blendColor[1], blendColor[2], alphaValue);
    },
  });
  const { container: alphaValueInput } = createSliderInputForm({
    label: "Alpha Value",
    value: alphaValue,
    min: 0,
    max: 1,
    step: 0.1,
    onChange: (v) => {
      alphaValue = v;
      gl.blendColor(blendColor[0], blendColor[1], blendColor[2], alphaValue);
    },
  });
  const { container: renderingOrderInput } = createSelectorForm({
    label: "Render order",
    value: renderingOrder,
    options: Object.values(Order),
    onChange: (v) => {
      if (v == Order.CONE) {
        // Move cone to end of render order
        scene.renderLast("cone");
        // Move sphere to end of render order, so it
        // will be after cone
        scene.renderLast("sphere");
      }
      if (v == Order.SPHERE) {
        scene.renderLast("sphere");
        scene.renderLast("cone");
      }
    },
  });
  const { container: blendCollapsible } = createCollapsibleComponent({
    label: "Blend",
    children: [
      enableBlendInput,
      blendEquationInput,
      sourceFunctionInput,
      destinationFunctionInput,
      blendColorInput,
    ],
  });
  const { container: depthCollapsible } = createCollapsibleComponent({
    label: "Depth",
    children: [enableDepthTestInput, alphaValueInput, enableFaceCullingInput],
  });
  addChildrenToController([
    blendCollapsible,
    depthCollapsible,
    useLambertInput,
    sphereColorInput,
    sphereAlphaInput,
    coneColorInput,
    coneAlphaInput,
    renderingOrderInput,
  ]);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "In this example we will see how different blending configuration changes the scene. Whenever blending is enabled, you can play with the transparency of the object by changing the values under its alpha channels (that is Sphere Alpha and Cone Alpha). You can also change how the source color and the destination color are computed by by the means of 'Source Function' and 'Destination Function'. And finally you may want to use the field 'Blend Function' to see different ways of merging the source and destination color.",
    "ch06/06/"
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
