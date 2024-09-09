import { loadData } from "../../lib/files.js";
import {
  createDescriptionPanel,
  createLowerLeftPanel,
  createMatrixElement,
  updateMatrixElement,
  updatePanelTitle,
  createSelectorForm,
  createVector3dSliders,
  initController,
  initGUI,
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
let modelTranslation = [0, -2, -50];
let modelRotation = [0, 0, 0];
let coordinateSystem = COORDINATE_SYSTEM.WORLD_COORDINATES;
let modelViewMatrix = Matrix4.identity(),
  cameraMatrix = Matrix4.identity();

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
};

const initData = async () => {
  const { vertices, indices, diffuse } = await loadData(
    "/data/models/geometries/cone3.json"
  );
  const floorModel = new Floor(82, 2);
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
          type: UniformType.VECTOR_FLOAT,
        },
        uMaterialAmbient: {
          data: [0.2, 0.2, 0.2, 1],
          type: UniformType.VECTOR_FLOAT,
        },
        uWireFrame: {
          data: false,
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
          type: UniformType.INT,
        },
        uMaterialDiffuse: {
          data: floorModel.color,
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
          type: UniformType.INT,
        },
        uMaterialDiffuse: {
          data: axisModel.color,
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
  gl.uniform4fv(program.uniforms.uLightAmbient, [1.0, 1.0, 1.0, 1.0]);
  gl.uniform4fv(program.uniforms.uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
};

const updateTransforms = () => {
  modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector(modelTranslation));
  modelViewMatrix = modelViewMatrix.rotateVecDeg(new Vector(modelRotation));
  cameraMatrix = modelViewMatrix.inverse() as Matrix4;
  const normalMatrix = computeNormalMatrix(modelViewMatrix);
  const projectionMatrix = Matrix4.perspective(
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
  scene.render();
};

const updateGUI = () => {
  const matrix =
    coordinateSystem == COORDINATE_SYSTEM.WORLD_COORDINATES
      ? modelViewMatrix.toFloatArray()
      : cameraMatrix.toFloatArray();

  updatePanelTitle("lower-left-panel", coordinateSystem);
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
  createSelectorForm({
    label: "Coordinate System",
    value: coordinateSystem,
    options: Object.values(COORDINATE_SYSTEM),
    onChange(v) {
      coordinateSystem = v;
    },
  });
  createVector3dSliders({
    labels: ["Rotation X", "Rotation Y", "Rotation Z"],
    value: modelRotation,
    min: -180,
    max: 180,
    step: 0.1,
    onChange: (v) => {
      modelRotation = v;
    },
  });
};

const init = async () => {
  initGUI();
  createDescriptionPanel(
    "See how camera rotation works. Note that the camera is located at [0, 2, 50] in world coordinates. The controls allow you to rotate the camera. The rotation will be done with respect to the origin (the objects are the ones rotating) when we are using world coordinates. But when we use the camera coordinate system the rotation will be done with respect the camera position"
  );
  createLowerLeftPanel(coordinateSystem);
  createMatrixElement("lower-left-panel", 4);

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  gl = getGLContext();
  initProgram();
  await initData();
  initLightUniforms();
  render();

  initControls();
};

window.onload = init;
