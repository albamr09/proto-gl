import { loadData } from "@example/utilities/files";
import {
  addChildrenToController,
  createButtonForm,
  createCollapsibleComponent,
  createDescriptionPanel,
  createLowerLeftPanel,
  createMatrixElement,
  createSelectorForm,
  createSliderInputForm,
  createVector3dSliders,
  initController,
  initGUI,
  updateMatrixElement,
} from "@example/utilities/gui/index";
import {
  calculateNormals,
  Matrix4,
  Vector,
  Instance,
  Axis,
  Floor,
  Program,
  Scene,
  UniformKind,
  Camera,
  CameraType,
} from "@proto-gl";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "@example/utilities/web-gl";
import fragmentShaderSource from "./fs.gl";
import vertexShaderSource from "./vs.gl";

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uMaterialDiffuse",
  "uMaterialAmbient",
  "uLightDiffuse",
  "uLightAmbient",
  "uLightPosition",
] as const;

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let program: Program<typeof attributes, typeof uniforms>;
let scene: Scene;
let modelViewMatrix = Matrix4.identity();
let modelTranslation = [0, 2, 50];
let modelRotation = [0, 0, 0];
let cameraType = CameraType.TRACKING;
let camera: Camera;

const initProgram = () => {
  // Background colors :)
  gl.clearColor(0.9, 0.9, 0.9, 1);
  // Depth testing
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  program = new Program(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    attributes,
    uniforms
  );
  scene = new Scene({ gl, canvas });
  camera = new Camera({ type: cameraType });
  camera.setInitialPosition(new Vector(modelTranslation));
};

const initData = () => {
  loadData("/data/models/geometries/cone3.json").then((data) => {
    scene.add(
      new Instance({
        gl,
        program,
        attributes: {
          aPosition: {
            data: data.vertices,
            size: 3,
            type: gl.FLOAT,
          },
          aNormal: {
            data: calculateNormals(data.vertices, data.indices, 3),
            size: 3,
            type: gl.FLOAT,
          },
        },
        uniforms: {
          uMaterialDiffuse: {
            data: data.diffuse,
            type: UniformKind.VECTOR_FLOAT,
          },
          uMaterialAmbient: {
            data: [0.2, 0.2, 0.2, 1],
            type: UniformKind.VECTOR_FLOAT,
          },
        },
        indices: data.indices,
      })
    );
  });
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
  scene.add(new Axis({ gl, dimension: 82 }));
};

const initLightUniforms = () => {
  program.use();
  gl.uniform3fv(program.getUniformLocation("uLightPosition"), [0, 120, 120]);
  gl.uniform4fv(
    program.getUniformLocation("uLightAmbient"),
    [1.0, 1.0, 1.0, 1.0]
  );
  gl.uniform4fv(
    program.getUniformLocation("uLightDiffuse"),
    [1.0, 1.0, 1.0, 1.0]
  );
};

const draw = () => {
  scene.render();
};

const updateTransforms = () => {
  modelViewMatrix = camera.getViewTransform();
  const projectionMatrix = Matrix4.perspective(
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    1000
  );

  scene.updateModelViewMatrix(modelViewMatrix);
  scene.updateProjectionMatrix(projectionMatrix);
};

const updateGUI = () => {
  const matrix = camera.getViewTransform().toFloatArray();
  updateMatrixElement(matrix);
};

const render = () => {
  requestAnimationFrame(render);
  updateTransforms();
  updateGUI();
  draw();
};

const initControls = () => {
  initController();
  const { selectInput: cameraTypeSelector, container: cameraTypeInput } =
    createSelectorForm({
      label: "Camera Type",
      value: cameraType,
      options: Object.values(CameraType),
      onChange: (v) => {
        camera.setType(v);
      },
    });
  const dollySlider = createSliderInputForm({
    label: "Dolly",
    value: 0,
    min: -100,
    max: 100,
    step: 1,
    onChange: (v) => {
      camera.dolly(v);
    },
  });
  const translateSliders = createVector3dSliders({
    labels: ["Translate X", "Translate Y", "Translate Z"],
    value: modelTranslation,
    min: -500,
    max: 500,
    step: 1,
    onInit: (v) => {
      camera.setPosition(new Vector(v));
    },
    onChange: (v) => {
      camera.setPosition(new Vector(v));
    },
  });
  const rotateSliders = createVector3dSliders({
    labels: ["Rotate X", "Rotate Y", "Rotate Z"],
    value: modelRotation,
    min: -360,
    max: 360,
    step: 1,
    onInit: (v) => {
      // Rotation on X
      camera.setElevation(v[0]);
      // Rotation on Y
      camera.setAzimuth(v[1]);
    },
    onChange: (v) => {
      // Rotation on X
      camera.setElevation(v[0]);
      // Rotation on Y
      camera.setAzimuth(v[1]);
    },
  });
  const { container: resetButton } = createButtonForm({
    label: "Reset",
    onClick: () => {
      camera.reset();
      dollySlider.sliderInput.value = "0";
      dollySlider.textInput.value = "0";
      const position = camera.getPosition();

      translateSliders.forEach((s, i) => {
        s.sliderInput.value = position.at(i).toString();
        s.textInput.value = position.at(i).toString();
      });

      rotateSliders.forEach((s) => {
        s.sliderInput.value = "0";
        s.textInput.value = "0";
      });

      cameraTypeSelector.value = camera.type;
    },
  });
  const { container: translationCollapsible } = createCollapsibleComponent({
    label: "Translation",
    children: translateSliders.map(({ container }) => container),
  });
  const { container: rotationCollapsible } = createCollapsibleComponent({
    label: "Rotation",
    children: rotateSliders.map(({ container }) => container),
  });
  addChildrenToController([
    cameraTypeInput,
    dollySlider.container,
    translationCollapsible,
    rotationCollapsible,
    resetButton,
  ]);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "Tinker with how the different camera types work. We differentiate between an orbiting camera type (the camera always points to the center and it moves 'around' the scene) and a tracking camera type (the camera is being moved, so you can 'look up', etc)",
    "ch04/04/"
  );

  createLowerLeftPanel("Camera Matrix");
  createMatrixElement("lower-left-panel", 4);

  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  gl = getGLContext();

  initProgram();
  initLightUniforms();
  initData();
  render();

  initControls();
};

window.onload = init;
