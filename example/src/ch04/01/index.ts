import { loadData } from "@example/utilities/files";
import {
  addChildrenToController,
  createDescriptionPanel,
  createLowerLeftPanel,
  createMatrixElement,
  createSelectorForm,
  createVector3dSliders,
  initController,
  initGUI,
  updateMatrixElement,
  updatePanelTitle,
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
let modelViewMatrix: Matrix4, cameraMatrix: Matrix4, projectionMatrix: Matrix4;

let modelTranslation = [0, -2, -50];
let coordinateSystem = COORDINATE_SYSTEM.WORLD_COORDINATES;

const initProgram = () => {
  // Create program object: compiles program and "creates"
  // attributes and uniforms
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
  const { vertices, diffuse, indices } = await loadData(
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
  program.use();
  gl.uniform3fv(program.getUniformLocation("uLightPosition"), [0, 120, 120]);
  gl.uniform4fv(
    program.getUniformLocation("uLightAmbient"),
    [1.0, 1.0, 1.0, 1]
  );
  gl.uniform4fv(program.getUniformLocation("uLightDiffuse"), [1, 1, 1, 1]);
};

const setTransformUniforms = () => {
  modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector(modelTranslation));
  cameraMatrix = modelViewMatrix.inverse() as Matrix4;
  projectionMatrix = Matrix4.perspective(
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    1000
  );
  scene.updateModelViewMatrix(modelViewMatrix);
  scene.updateProjectionMatrix(projectionMatrix);
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
    "See the Camera Translation in action. Note that when we change from 'World Coordinates' to 'Camera Coordinates' then we need to negate the translation to be able to see the cone the same way.",
    "ch04/01/"
  );
  createLowerLeftPanel(coordinateSystem);
  createMatrixElement("lower-left-panel", 4);

  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  gl = getGLContext();

  initProgram();
  await initData();
  initLightUniforms();
  // Lights
  render();

  initController();
  const { container: coordinateSystemInput } = createSelectorForm({
    label: "Coordinate System",
    value: coordinateSystem,
    options: Object.values(COORDINATE_SYSTEM),
    onChange(v) {
      coordinateSystem = v;
    },
  });
  const translationInputs = createVector3dSliders({
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
  }).map(({ container }) => container);

  addChildrenToController([coordinateSystemInput, ...translationInputs]);
};

window.onload = init;
