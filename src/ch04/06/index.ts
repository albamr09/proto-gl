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
} from "../../lib/gui/index.js";
import { calculateNormals, computeNormalMatrix } from "../../lib/math/3d.js";
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
import Axis from "../../lib/webgl/models/axis.js";
import Floor from "../../lib/webgl/models/floor.js";
import Program from "../../lib/webgl/program.js";
import Scene, { UniformType } from "../../lib/webgl/scene.js";
import fragmentShaderSource from "./fs.gl.js";
import vertexShaderSource from "./vs.gl.js";

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
  "uMaterialAmbient",
  "uMaterialDiffuse",
  "uWireFrame",
  "uStaticLight",
] as const;

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let program: Program<typeof attributes, typeof uniforms>;
let scene: Scene<typeof attributes, typeof uniforms>;
let camera: Camera;
let controller: Controller;
let cameraType = CAMERA_TYPE.TRACKING;
let porjectionType = PROJECTION_TYPE.PERSPECTIVE;
let modelTranslation = [0, 25, 120];
let modelRotation = [0, 0, 0];
let dollyValue = 0;
let fovValue = 45;
let useStaticLight = false;
let followMouse = false;
let rotateSelectors: {
  textInput: HTMLInputElement;
  sliderInput: HTMLInputElement;
}[];
let dollySelector: {
  textInput: HTMLInputElement;
  sliderInput: HTMLInputElement;
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
  scene = new Scene(gl, program);
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
};

const initData = () => {
  loadDataFromFolder("/data/models/nissan-gtr", 178, (data) => {
    scene.addObject({
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
          size: 4,
          type: UniformType.VECTOR_FLOAT,
        },
        uMaterialDiffuse: {
          data: [...data.Kd, 1.0],
          size: 4,
          type: UniformType.VECTOR_FLOAT,
        },
        uWireFrame: {
          data: false,
          size: 1,
          type: UniformType.INT,
        },
        uStaticLight: {
          data: useStaticLight,
          size: 1,
          type: UniformType.INT,
        },
      },
      indices: data.indices,
    });
  });

  const floorModel = new Floor(2000, 100);
  const axisModel = new Axis(2000);

  scene.addObject({
    attributes: {
      aPosition: {
        data: floorModel.vertices,
        size: 3,
        type: gl.FLOAT,
      },
    },
    uniforms: {
      uWireFrame: {
        data: floorModel.wireframe,
        size: 1,
        type: UniformType.INT,
      },
      uMaterialDiffuse: {
        data: floorModel.color,
        size: 4,
        type: UniformType.VECTOR_FLOAT,
      },
    },
    indices: floorModel.indices,
    renderingMode: gl.LINES,
  });
  scene.addObject({
    attributes: {
      aPosition: {
        data: axisModel.vertices,
        size: 3,
        type: gl.FLOAT,
      },
    },
    uniforms: {
      uWireFrame: {
        data: axisModel.wireframe,
        size: 1,
        type: UniformType.INT,
      },
      uMaterialDiffuse: {
        data: axisModel.color,
        size: 4,
        type: UniformType.VECTOR_FLOAT,
      },
    },
    indices: axisModel.indices,
    renderingMode: gl.LINES,
  });
};

const initLightUniforms = () => {
  gl.uniform4fv(program.uniforms.uLightAmbient, [0.1, 0.1, 0.1, 1]);
  gl.uniform3fv(program.uniforms.uLightPosition, [0, 0, 2120]);
  gl.uniform4fv(program.uniforms.uLightDiffuse, [0.7, 0.7, 0.7, 1]);
};

const draw = () => {
  scene.render();
};

const updateTransformations = () => {
  const modelViewMatrix = camera.getViewTransform();
  const normalMatrix = computeNormalMatrix(modelViewMatrix);
  const projectionMatrix = camera.getProjectionTransform();

  updateMatrixElement(camera.getViewTransform().toFloatArray());

  gl.uniformMatrix4fv(
    program.uniforms.uModelViewMatrix,
    false,
    modelViewMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(
    program.uniforms.uNormalMatrix,
    false,
    normalMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(
    program.uniforms.uProjectionMatrix,
    false,
    projectionMatrix.toFloatArray()
  );
};

const render = () => {
  requestAnimationFrame(render);
  updateTransformations();
  draw();
};

const initControls = () => {
  initController();
  const cameraTypeSelector = createSelectorForm({
    label: "Camera Type",
    value: cameraType,
    options: Object.values(CAMERA_TYPE),
    onChange: (v) => {
      cameraType = v;
      camera.setType(v);
    },
  });
  const projectionTypeSelector = createSelectorForm({
    label: "Projection Type",
    value: porjectionType,
    options: Object.values(PROJECTION_TYPE),
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
      camera.setAzimuth(v[0]);
      camera.setAzimuth(v[1]);
    },
    onChange: (v) => {
      camera.setAzimuth(v[0]);
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
  const usetStaticLightCheck = createCheckboxInputForm({
    label: "Static Light",
    value: useStaticLight,
    onChange: (v) => {
      scene.updateUniform("uStaticLight", v);
    },
  });
  const followMouseCheck = createCheckboxInputForm({
    label: "Follow mouse (TRACKING)",
    value: followMouse,
    onInit: (v) => {
      controller.setFollowMouse(v);
    },
    onChange: (v) => {
      controller.setFollowMouse(v);
    },
  });
  createButtonForm({
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
      cameraTypeSelector.value = CAMERA_TYPE.TRACKING;
      projectionTypeSelector.value = PROJECTION_TYPE.PERSPECTIVE;
    },
  });
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "This example renders a complex object (a car) and defines a camera that can be interacted with using the mouse."
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
