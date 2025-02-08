import { loadDataFromFolder } from "../../lib/files.js";
import {
  createButtonForm,
  createDescriptionPanel,
  createLowerLeftPanel,
  createSelectorForm,
  createSliderInputForm,
  createVector3dSliders,
  initController,
  initGUI,
  updateMatrixElement,
  createMatrixElement,
  createCheckboxInputForm,
  createCollapsibleComponent,
  addChildrenToController,
} from "../../lib/gui/index.js";
import { calculateNormals } from "../../lib/math/3d.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera from "../../lib/webgl/core/camera/camera.js";
import Controller from "../../lib/webgl/core/events/controller.js";
import Instance from "../../lib/webgl/rendering/instance.js";
import Axis from "../../lib/webgl/models/axis/index.js";
import Floor from "../../lib/webgl/models/floor/index.js";
import Program from "../../lib/webgl/core/program.js";
import Scene from "../../lib/webgl/rendering/scene.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";
import fragmentShaderSource from "./fs.gl.js";
import vertexShaderSource from "./vs.gl.js";
import {
  CameraType,
  ProjectionType,
} from "../../lib/webgl/core/camera/types.js";

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
  "uMaterialAmbient",
  "uMaterialDiffuse",
  "uStaticLight",
] as const;

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let program: Program<typeof attributes, typeof uniforms>;
let scene: Scene;
let camera: Camera;
let controller: Controller;
let cameraType = CameraType.TRACKING;
let porjectionType = ProjectionType.PERSPECTIVE;
let modelTranslation = [0, 25, 120];
let modelRotation = [0, 0, 0];
let dollyValue = 0;
let fovValue = 45;
let useStaticLight = false;
let followMouse = false;
let rotateSelectors: {
  textInput: HTMLInputElement;
  sliderInput: HTMLInputElement;
  container: HTMLDivElement;
}[];
let dollySelector: {
  textInput: HTMLInputElement;
  sliderInput: HTMLInputElement;
  container: HTMLDivElement;
};

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
  camera = new Camera(cameraType, porjectionType, gl);
  controller = new Controller({
    camera,
    canvas,
    onAngleChange: (v) => {
      v.elements.forEach((r, idx) => {
        rotateSelectors[idx].sliderInput.value = `${r}`;
        rotateSelectors[idx].textInput.value = `${r}`;
      });
    },
    onDollyChange: (dolly) => {
      dollySelector.sliderInput.value = `${dolly}`;
      dollySelector.textInput.value = `${dolly}`;
    },
  });
  camera.setInitialPosition(new Vector(modelTranslation));
  // Compute non-transposed version of the projection transform
  camera.setTransposeProjection(false);
};

const initData = () => {
  loadDataFromFolder("/data/models/nissan-gtr", 178, (data) => {
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
          uMaterialAmbient: {
            data: [...data.Ka, 1.0],
            type: UniformKind.VECTOR_FLOAT,
          },
          uMaterialDiffuse: {
            data: [...data.Kd, 1.0],
            type: UniformKind.VECTOR_FLOAT,
          },
          uStaticLight: {
            data: useStaticLight,
            type: UniformKind.SCALAR_INT,
          },
        },
        indices: data.indices,
      })
    );
  });

  scene.add(new Floor({ gl, dimension: 2000, lines: 100 }));
  scene.add(new Axis({ gl, dimension: 2000 }));
};

const initLightUniforms = () => {
  program.use();
  gl.uniform4fv(
    program.getUniformLocation("uLightAmbient"),
    [0.1, 0.1, 0.1, 1]
  );
  gl.uniform3fv(program.getUniformLocation("uLightPosition"), [0, 0, 2120]);
  gl.uniform4fv(
    program.getUniformLocation("uLightDiffuse"),
    [0.7, 0.7, 0.7, 1]
  );
};

const draw = () => {
  scene.render({
    cb: (o) => {
      o.updateUniform(
        "uProjectionMatrix",
        camera.getProjectionTransform().toFloatArray(),
        // Transpose matrix only if the projection
        // was not manully transposed before
        { transpose: !camera.isProjectionTransposed() }
      );
    },
  });
};

const updateTransformations = () => {
  const modelViewMatrix = camera.getViewTransform();
  const projectionMatrix = camera.getProjectionTransform();
  scene.updateModelViewMatrix(modelViewMatrix);
  scene.updateProjectionMatrix(projectionMatrix);

  updateMatrixElement(camera.getViewTransform().toFloatArray());
};

const render = () => {
  requestAnimationFrame(render);
  updateTransformations();
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
        cameraType = v;
        camera.setType(v);
      },
    });
  const {
    selectInput: projectionTypeSelector,
    container: projectionTypeInput,
  } = createSelectorForm({
    label: "Projection Type",
    value: porjectionType,
    options: Object.values(ProjectionType),
    onChange: (v) => {
      porjectionType = v;
      camera.setProjection(v);
    },
  });
  const translateSelectors = createVector3dSliders({
    labels: ["Translate X", "Translate Y", "Translate Z"],
    value: modelTranslation,
    min: -500,
    max: 500,
    step: 0.1,
    onInit: (v) => {
      camera.setPosition(new Vector(v));
    },
    onChange: (v) => {
      camera.setPosition(new Vector(v));
    },
  });
  rotateSelectors = createVector3dSliders({
    labels: ["Rotate X", "Rotate Y", "Rotate Z"],
    value: modelRotation,
    min: -360,
    max: 360,
    step: 0.1,
    onInit: (v) => {
      camera.setElevation(v[0]);
      camera.setAzimuth(v[1]);
    },
    onChange: (v) => {
      camera.setElevation(v[0]);
      camera.setAzimuth(v[1]);
    },
  });
  dollySelector = createSliderInputForm({
    label: "Dolly",
    value: dollyValue,
    min: -100,
    max: 100,
    step: 0.1,
    onInit: (v) => {
      camera.dolly(v);
    },
    onChange: (v) => {
      camera.dolly(v);
    },
  });
  const fovSlider = createSliderInputForm({
    label: "FOV",
    value: fovValue,
    min: 1,
    max: 200,
    step: 0.1,
    onInit: (v) => {
      camera.setFov(v);
    },
    onChange: (v) => {
      camera.setFov(v);
    },
  });
  const {
    checkboxInput: usetStaticLightCheck,
    container: useStaticLightInput,
  } = createCheckboxInputForm({
    label: "Static Light",
    value: useStaticLight,
    onChange: (v) => {
      scene.updateUniform("uStaticLight", v);
    },
  });
  const { checkboxInput: followMouseCheck, container: followMouseInput } =
    createCheckboxInputForm({
      label: "Follow mouse (TRACKING)",
      value: followMouse,
      onInit: (v) => {
        controller.setFollowMouse(v);
      },
      onChange: (v) => {
        controller.setFollowMouse(v);
      },
    });
  const { container: resetButton } = createButtonForm({
    label: "Reset",
    onClick: () => {
      camera.reset();
      dollySelector.sliderInput.value = "0";
      dollySelector.textInput.innerHTML = "0";
      fovSlider.sliderInput.value = "45";
      fovSlider.textInput.innerHTML = "45";
      translateSelectors.forEach((s, i) => {
        s.sliderInput.value = camera.getPosition().at(i).toString();
        s.textInput.value = camera.getPosition().at(i).toString();
      });
      rotateSelectors.forEach((s) => {
        s.sliderInput.value = "0";
        s.textInput.value = "0";
      });
      usetStaticLightCheck.checked = false;
      followMouseCheck.checked = false;
      useStaticLight = false;
      cameraTypeSelector.value = CameraType.TRACKING;
      projectionTypeSelector.value = ProjectionType.PERSPECTIVE;
    },
  });

  const { container: cameraCollapsible } = createCollapsibleComponent({
    label: "Camera",
    children: [
      cameraTypeInput,
      projectionTypeInput,
      dollySelector.container,
      fovSlider.container,
    ],
    openByDefault: true,
  });
  const { container: translationCollapsible } = createCollapsibleComponent({
    label: "Translation",
    children: translateSelectors.map(({ container }) => container),
  });
  const { container: rotationCollapsible } = createCollapsibleComponent({
    label: "Rotation",
    children: rotateSelectors.map(({ container }) => container),
  });
  addChildrenToController([
    cameraCollapsible,
    translationCollapsible,
    rotationCollapsible,
    useStaticLightInput,
    followMouseInput,
    resetButton,
  ]);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example you can interact with the scene using your mouse or your keyboard, this will make the camera 'move'. Also you are able to switch between projection modes using the controller on your right, so you can choose between perspective or orthographic mode."
  );

  canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();

  const panelId = createLowerLeftPanel("Camera Matrix");
  createMatrixElement(panelId, 4);

  initProgram();
  initData();
  initLightUniforms();
  render();
  initControls();
};

window.onload = init;
