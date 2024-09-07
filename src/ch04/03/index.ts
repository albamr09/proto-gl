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
    labels: ["Translation X", "Translation Y", "Translation Z"],
    value: modelTranslation,
    min: -500,
    max: 500,
    step: 0.1,
    onChange: (v) => {
      modelTranslation = v;
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
    "See how camera rotation and translation works. As with the previous examples, when we operate on the camera coordinate system the transformations are applied on the camera. When we rotate we rotate the camera around itself, and when we translate we move the camera. For example if the translation vector is [0, -2, -50], then the camera is moved down two units from the origin towards the 'inside' of the screen 50 units (in our case it means the camera i behind the object which is assumed to be on (0,0), if you rotate 180 degrees on the Y axis you will se the cone is behind you!). However when we transform the scene using the world coordinate system then the objects are the ones that move, so when you rotate it seems that the camera is rotating with respect to the origin, when the objects are the ones moving (really objects are always the ones moving but you get what I mean)."
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
