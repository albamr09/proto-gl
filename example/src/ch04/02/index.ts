import { loadData } from "@example/utilities/files";
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
  addChildrenToController,
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
} from "@proto-gl";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "@example/utilities/web-gl";
import fragmentShaderSource from "./fs.gl";
import vertexShaderSource from "./vs.gl";

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
] as const;

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
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

  scene = new Scene({ gl, canvas });
};

const initData = async () => {
  const { vertices, indices, diffuse } = await loadData(
    "/data/models/geometries/cone3.json"
  );
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
          type: UniformKind.VECTOR_FLOAT,
        },
        uMaterialAmbient: {
          data: [0.2, 0.2, 0.2, 1],
          type: UniformKind.VECTOR_FLOAT,
        },
      },
      indices,
    })
  );
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
  scene.add(new Axis({ gl, dimension: 82 }));
};

const initLightUniforms = () => {
  // Make sure we update the uniforms on the object's program
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

const updateTransforms = () => {
  modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector(modelTranslation));
  modelViewMatrix = modelViewMatrix.rotateVecDeg(new Vector(modelRotation));
  cameraMatrix = modelViewMatrix.inverse() as Matrix4;
  const projectionMatrix = Matrix4.perspective(
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    1000
  );

  if (coordinateSystem == COORDINATE_SYSTEM.WORLD_COORDINATES) {
    scene.updateModelViewMatrix(modelViewMatrix);
  } else {
    scene.updateModelViewMatrix(cameraMatrix);
  }

  scene.updateProjectionMatrix(projectionMatrix);
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
  const { container: coordinateSystemInput } = createSelectorForm({
    label: "Coordinate System",
    value: coordinateSystem,
    options: Object.values(COORDINATE_SYSTEM),
    onChange(v) {
      coordinateSystem = v;
    },
  });
  const rotationInputs = createVector3dSliders({
    labels: ["Rotation X", "Rotation Y", "Rotation Z"],
    value: modelRotation,
    min: -180,
    max: 180,
    step: 0.1,
    onChange: (v) => {
      modelRotation = v;
    },
  }).map(({ container }) => container);

  addChildrenToController([coordinateSystemInput, ...rotationInputs]);
};

const init = async () => {
  initGUI();
  createDescriptionPanel(
    "See how camera rotation works. Note that the camera is located at [0, 2, 50] in world coordinates. The controls allow you to rotate the camera. The rotation will be done with respect to the origin (the objects are the ones rotating) when we are using world coordinates. But when we use the camera coordinate system the rotation will be done with respect the camera position",
    "ch04/02/"
  );
  createLowerLeftPanel(coordinateSystem);
  createMatrixElement("lower-left-panel", 4);

  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  gl = getGLContext();
  initProgram();
  await initData();
  initLightUniforms();
  render();

  initControls();
};

window.onload = init;
