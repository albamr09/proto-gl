import { loadData } from "../../lib/files.js";
import {
  createDescriptionPanel,
  createLowerLeftPanel,
  createMatrixElement,
  createSelectorForm,
  createVector3dSliders,
  initController,
  initGUI,
  updateMatrixElement,
  updatePanelTitle,
} from "../../lib/gui/index.js";
import { calculateNormals, computeNormalMatrix } from "../../lib/math/3d.js";
import { Matrix4 } from "../../lib/math/matrix.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Instance from "../../lib/webgl/instance.js";
import Axis from "../../lib/webgl/models/axis.js";
import Floor from "../../lib/webgl/models/floor.js";
import Program from "../../lib/webgl/program.js";
import Scene from "../../lib/webgl/scene.js";
import { UniformType } from "../../lib/webgl/uniforms.js";
import fragmentShaderSource from "./fs.gl.js";
import vertexShaderSource from "./vs.gl.js";

enum COORDINATE_SYSTEM {
  WORLD_COORDINATES = "World Coordinates",
  CAMERA_COORDINATES = "Camera Coordinates",
}

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uLightPosition",
  "uLightDiffuse",
  "uLightAmbient",
  "uMaterialDiffuse",
  "uMaterialAmbient",
  "uWireFrame",
] as const;

let gl: WebGL2RenderingContext;
let program: Program<typeof attributes, typeof uniforms>;
let scene: Scene;
let modelViewMatrix: Matrix4,
  normalMatrix: Matrix4,
  cameraMatrix: Matrix4,
  projectionMatrix: Matrix4;

let modelTranslation = [0, -2, -50];
let coordinateSystem = COORDINATE_SYSTEM.WORLD_COORDINATES;

const initProgram = () => {
  // Background colors :)
  gl.clearColor(0.9, 0.9, 0.9, 1);
  // Depth testing
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  // Create program object: compiles program and "creates"
  // attributes and uniforms
  program = new Program(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    attributes,
    uniforms
  );
  scene = new Scene(gl);
};

const initData = async () => {
  const { vertices, diffuse, indices } = await loadData(
    "/data/models/geometries/cone3.json"
  );
  const floorModel = new Floor(80, 2);
  const axisModel = new Axis(82);
  scene.add(
    new Instance({
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
      uniforms: {
        uMaterialDiffuse: {
          data: diffuse,
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
      indices,
    })
  );
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
      renderingMode: gl.LINES,
      indices: floorModel.indices,
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
      renderingMode: gl.LINES,
      indices: axisModel.indices,
    })
  );
};

const initLightUniforms = () => {
  gl.uniform3fv(program.uniforms.uLightPosition, [0, 120, 120]);
  gl.uniform4fv(program.uniforms.uLightAmbient, [1.0, 1.0, 1.0, 1]);
  gl.uniform4fv(program.uniforms.uLightDiffuse, [1, 1, 1, 1]);
};

const setTransformUniforms = () => {
  modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector(modelTranslation));
  cameraMatrix = modelViewMatrix.inverse() as Matrix4;
  normalMatrix = computeNormalMatrix(modelViewMatrix);
  projectionMatrix = Matrix4.perspective(
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    1000
  );
  if (coordinateSystem == COORDINATE_SYSTEM.WORLD_COORDINATES) {
    gl.uniformMatrix4fv(
      program.uniforms.uModelViewMatrix,
      false,
      modelViewMatrix.toFloatArray()
    );
  } else {
    gl.uniformMatrix4fv(
      program.uniforms.uModelViewMatrix,
      false,
      cameraMatrix.toFloatArray()
    );
  }
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

const draw = () => {
  try {
    setTransformUniforms();
    scene.render();
  } catch (error) {
    console.error(`Could not render scene ${error}`);
  }
};

const updateGUIMatrixValues = () => {
  const matrix =
    coordinateSystem === COORDINATE_SYSTEM.WORLD_COORDINATES
      ? modelViewMatrix.toFloatArray()
      : cameraMatrix.toFloatArray();

  updateMatrixElement(matrix);
  updatePanelTitle("lower-left-panel", coordinateSystem);
};

const render = () => {
  requestAnimationFrame(render);
  draw();
  updateGUIMatrixValues();
};

const init = async () => {
  initGUI();
  createDescriptionPanel(
    "See the Camera Translation in action. Note that when we change from 'World Coordinates' to 'Camera Coordinates' then we need to negate the translation to be able to see the cone the same way."
  );
  createLowerLeftPanel(coordinateSystem);
  createMatrixElement("lower-left-panel", 4);

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  gl = getGLContext();

  initProgram();
  await initData();
  initLightUniforms();
  // Lights
  render();

  initController();
  createSelectorForm({
    label: "Coordinate System",
    value: coordinateSystem,
    options: Object.values(COORDINATE_SYSTEM),
    onChange(v) {
      coordinateSystem = v;
    },
  });
  createVector3dSliders({
    labels: ["Translate X", "Translate Y", "Translate Z"],
    value: modelTranslation,
    min: -500,
    max: 500,
    step: 1,
    onInit: (v) => {
      modelTranslation = v;
    },
    onChange(v) {
      modelTranslation = v;
    },
  });
};

window.onload = init;
