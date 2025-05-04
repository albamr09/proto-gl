import { loadData } from "@example/utilities/files";
import {
  addChildrenToController,
  createCheckboxInputForm,
  createDescriptionPanel,
  initController,
  initGUI,
} from "@example/utilities/gui/index";
import {
  calculateNormals,
  Matrix4,
  Vector,
  Camera,
  Controller,
  Program,
  UniformKind,
  Floor,
  Instance,
  PickingController,
  Scene,
  Axis,
} from "@proto-gl";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "@example/utilities/web-gl";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uLabelColor",
  "uMaterialDiffuse",
  "uTransform",
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
  "uOffScreen",
  "uAlpha",
] as const;

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let program: Program<typeof attributes, typeof uniforms>;
let showOffscreenBuffer = false;

const initProgram = () => {
  scene = new Scene({
    gl,
    canvas,
    editorConfiguration: { allow: true, showGuides: false },
  });
  const camera = new Camera({ gl, scene });
  const pickingController = new PickingController(scene, canvas);
  new Controller({ camera, canvas, pickingController });
  camera.setPosition(new Vector([0, 0, 40]));
  camera.setElevation(-40);
  camera.setAzimuth(30);

  program = new Program<typeof attributes, typeof uniforms>(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    attributes,
    uniforms
  );

  // Alpha blending configuration
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Config culling
  gl.enable(gl.CULL_FACE);
};

const loadObject = (
  path: string,
  id: string,
  properties?: {
    color?: number[];
    translationVector?: Vector;
    scaleVector?: Vector;
    rotationVector?: Vector;
  }
) => {
  const ligthUniforms = {
    uLightAmbient: {
      data: [0, 0, 0, 1],
      type: UniformKind.VECTOR_FLOAT,
    },
    uLightDiffuse: {
      data: [1, 1, 1, 1],
      type: UniformKind.VECTOR_FLOAT,
    },
    uLightPosition: {
      data: [0, 5, 20],
      type: UniformKind.VECTOR_FLOAT,
    },
  };
  loadData(path).then((data) => {
    const { vertices, indices } = data;
    let previousColor: number[];
    const ballInstance = new Instance({
      id,
      gl,
      program,
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
      indices,
      uniforms: {
        uOffScreen: {
          data: false,
          type: UniformKind.SCALAR_INT,
        },
        uMaterialDiffuse: {
          data: properties?.color ?? [1, 1, 1, 1],
          type: UniformKind.VECTOR_FLOAT,
        },
        uLabelColor: {
          data: [0, 0, 0, 1],
          type: UniformKind.VECTOR_FLOAT,
        },
        uTransform: {
          data: Matrix4.identity()
            .translate(properties?.translationVector ?? new Vector([0, 0, 0]))
            .rotateVecDeg(properties?.rotationVector ?? new Vector([0, 0, 0]))
            .scale(properties?.scaleVector ?? new Vector([1, 1, 1]))
            .toFloatArray(),
          type: UniformKind.MATRIX,
        },
        uAlpha: {
          data: 1,
          type: UniformKind.SCALAR_FLOAT,
        },
        ...ligthUniforms,
      },
      transformationProperties: { ...properties },
      onClick: (instance) => {
        previousColor = (
          instance.getUniform("uMaterialDiffuse") as any
        ).getData() as number[];
        const labelColor = (
          instance.getUniform("uLabelColor") as any
        ).getData();
        instance.updateUniform("uMaterialDiffuse", labelColor);
      },
      onDragFinish: (instance) => {
        if (!previousColor || previousColor.length != 4) return;
        instance.updateUniform("uMaterialDiffuse", previousColor);
        previousColor = [];
        scene.remove(id);
      },
    });
    scene.add(ballInstance);
  });
};

const initData = () => {
  const nObjects = 100;
  const maxX = 30;
  const maxZ = 30;
  Array.from({ length: nObjects }).forEach((_, i) => {
    const isCylinder = i % 2 == 0;
    const generatedX = Math.random() * maxX - maxX / 2;
    const generatedZ = Math.random() * maxZ - maxZ / 2;
    const color = Math.random();
    const scale = isCylinder
      ? Math.min(Math.random() / 3, 0.4)
      : Math.max(1.0, Math.random() + 0.3);
    const path = isCylinder
      ? "/data/models/geometries/cylinder.json"
      : "/data/models/geometries/ball.json";
    loadObject(path, `object-${i}`, {
      translationVector: new Vector([generatedX, 0, generatedZ]),
      scaleVector: new Vector([scale, scale, scale]),
      color: [color, color, color, 1],
    });
  });
  scene.add(new Floor({ gl, dimension: 82, lines: 4 }));
  scene.add(new Axis({ gl, dimension: 82 }));
};

const render = () => {
  scene.render({ offscreen: showOffscreenBuffer });
  requestAnimationFrame(render);
};

const initControls = () => {
  initController();
  const { container: showOffscreenFrameBufferInput } = createCheckboxInputForm({
    label: "Show Offscreen Framebuffer",
    value: showOffscreenBuffer,
    onChange: (v) => {
      showOffscreenBuffer = v;
    },
  });
  addChildrenToController([showOffscreenFrameBufferInput]);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we will showcase how we can use unique ids in order to determine which object is selected."
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
