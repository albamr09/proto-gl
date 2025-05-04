import { loadData } from "@example/utilities/files";
import {
  addChildrenToController,
  createDescriptionPanel,
  createSelectorForm,
  initController,
  initGUI,
} from "@example/utilities/gui/index";
import {
  calculateNormals,
  Vector,
  Camera,
  CameraType,
  ProjectionType,
  Controller,
  Axis,
  Floor,
  Scene,
  UniformKind,
  Mesh,
} from "@proto-gl";
import {
  configureCanvas,
  getGLContext,
  autoResizeCanvas,
} from "@example/utilities/web-gl";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;
let controller: Controller;
let cameraType = CameraType.ORBITING;
let projectionType = ProjectionType.PERSPECTIVE;
let initialPosition = new Vector([0, 2, 50]);
let dxSphere = 0.5;
let dxCone = 0.5;
let sphereZ = 0;
let coneX = 0;

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  camera = new Camera({
    type: cameraType,
    projection: projectionType,
    gl,
    scene,
  });
  camera.setPosition(initialPosition);
  camera.setInitialPosition(initialPosition);
  controller = new Controller({ camera, canvas });
};

const initData = () => {
  const lightUniforms = {
    uLightPosition: {
      data: [0, 120, 120],
      type: UniformKind.VECTOR_FLOAT,
    },
    uLightAmbient: {
      data: [0.2, 0.2, 0.2, 1],
      type: UniformKind.VECTOR_FLOAT,
    },
    uLightDiffuse: {
      data: [1, 1, 1, 1],
      type: UniformKind.VECTOR_FLOAT,
    },
    uLightSpecular: {
      data: [1, 1, 1, 1],
      type: UniformKind.VECTOR_FLOAT,
    },
    uShininess: {
      data: 230,
      type: UniformKind.SCALAR_FLOAT,
    },
  };
  loadData("/data/models/geometries/sphere2.json").then((data) => {
    const { vertices, indices, diffuse } = data;
    scene.add(
      new Mesh({
        id: "sphere",
        gl,
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
          uTranslation: {
            data: [0, 0, 0],
            type: UniformKind.VECTOR_FLOAT,
          },
          ...lightUniforms,
        },
        indices,
      })
    );
  });
  loadData("/data/models/geometries/cone3.json").then((data) => {
    const { vertices, indices, diffuse } = data;
    scene.add(
      new Mesh({
        id: "cone",
        gl,
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
          uTranslation: {
            data: [0, 0, 0],
            type: UniformKind.VECTOR_FLOAT,
          },
          ...lightUniforms,
        },
        indices,
      })
    );
  });
  scene.add(new Floor({ gl, dimension: 80, lines: 2 }));
  scene.add(new Axis({ gl, dimension: 80 }));
};

const animateObjects = () => {
  sphereZ += dxSphere;

  if (sphereZ >= 30 || sphereZ <= -30) {
    dxSphere = -dxSphere;
  }

  coneX += dxCone;
  if (coneX >= 35 || coneX <= -35) {
    dxCone = -dxCone;
  }

  // Sphere
  scene.updateUniform("uTranslation", [0, 0, sphereZ], "sphere");
  // Cone
  scene.updateUniform("uTranslation", [coneX, 0, 0], "cone");
};

const draw = () => {
  scene.render();
};

const render = () => {
  requestAnimationFrame(render);
  animateObjects();
  draw();
};

const initControls = () => {
  initController();

  const { container: cameraTypeInput } = createSelectorForm({
    label: "Camera Type",
    value: cameraType,
    options: Object.values(CameraType),
    onChange: (v) => {
      camera.setType(v);
    },
  });
  addChildrenToController(cameraTypeInput);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we showcase a simple animation of two objects. Such that you can see how to apply both global and local transforms."
  );

  canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();

  initProgram();
  initData();
  render();
  initControls();
};

window.onload = init;
