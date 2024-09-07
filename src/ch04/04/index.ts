import { loadData } from "../../lib/files.js";
import {
  createButtonForm,
  createDescriptionPanel,
  createLowerLeftPanel,
  createMatrixElement,
  createSelectorForm,
  createSliderInputForm,
  createVector3dSliders,
  initController,
  initGUI,
  updateMatrixElement,
} from "../../lib/gui/index.js";
import { calculateNormals, computeNormalMatrix } from "../../lib/math/3d.js";
import { Matrix4 } from "../../lib/math/matrix.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera, { CAMERA_TYPE } from "../../lib/webgl/camera.js";
import Instance from "../../lib/webgl/instance.js";
import Axis from "../../lib/webgl/models/axis.js";
import Floor from "../../lib/webgl/models/floor.js";
import Program from "../../lib/webgl/program.js";
import Scene from "../../lib/webgl/scene.js";
import { UniformType } from "../../lib/webgl/uniforms.js";
import fragmentShaderSource from "./fs.gl.js";
import vertexShaderSource from "./vs.gl.js";

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uWireFrame",
  "uMaterialDiffuse",
  "uMaterialAmbient",
  "uLightDiffuse",
  "uLightAmbient",
  "uLightPosition",
] as const;

let gl: WebGL2RenderingContext;
let program: Program<typeof attributes, typeof uniforms>;
let scene: Scene;
let modelViewMatrix = Matrix4.identity();
let modelTranslation = [0, 2, 50];
let modelRotation = [0, 0, 0];
let cameraType = CAMERA_TYPE.TRACKING;
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
  scene = new Scene(gl);
  camera = new Camera(cameraType);
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
            size: 4,
            type: UniformType.VECTOR_FLOAT,
          },
          uMaterialAmbient: {
            data: [0.2, 0.2, 0.2, 1],
            size: 4,
            type: UniformType.VECTOR_FLOAT,
          },
          uWireFrame: {
            data: false,
            size: 1,
            type: UniformType.INT,
          },
        },
        indices: data.indices,
      })
    );
  });
  const floorModel = new Floor(82, 2);
  const axisModel = new Axis(82);
  scene.add(
    new Instance({
      gl,
      program,
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
    })
  );
  scene.add(
    new Instance({
      gl,
      program,
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
    })
  );
};

const initLightUniforms = () => {
  gl.uniform3fv(program.uniforms.uLightPosition, [0, 120, 120]);
  gl.uniform4fv(program.uniforms.uLightAmbient, [1.0, 1.0, 1.0, 1.0]);
  gl.uniform4fv(program.uniforms.uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
};

const draw = () => {
  scene.render();
};

const updateTransforms = () => {
  modelViewMatrix = camera.getViewTransform();
  const normalMatrix = computeNormalMatrix(modelViewMatrix);
  const projectionMatrix = Matrix4.perspective(
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    1000
  );

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
  const cameraTypeSelector = createSelectorForm({
    label: "Camera Type",
    value: cameraType,
    options: Object.values(CAMERA_TYPE),
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
  createButtonForm({
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
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "Tinker with how the different camera types work. We differentiate between an orbiting camera type (the camera always points to the center and it moves 'around' the scene) and a tracking camera type (the camera is being moved, so you can 'look up', etc)"
  );

  createLowerLeftPanel("Camera Matrix");
  createMatrixElement("lower-left-panel", 4);

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  gl = getGLContext();

  initProgram();
  initLightUniforms();
  initData();
  render();

  initControls();
};

window.onload = init;
