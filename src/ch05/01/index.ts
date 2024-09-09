import { loadData } from "../../lib/files.js";
import {
  createDescriptionPanel,
  createSelectorForm,
  initController,
  initGUI,
} from "../../lib/gui/index.js";
import { Vector } from "../../lib/math/vector.js";
import {
  configureCanvas,
  getGLContext,
  autoResizeCanvas,
} from "../../lib/web-gl.js";
import Camera, {
  CAMERA_TYPE,
  PROJECTION_TYPE,
} from "../../lib/webgl/camera.js";
import Controller from "../../lib/webgl/controller.js";
import Cone from "../../lib/webgl/models/cone/cone.js";
import Scene from "../../lib/webgl/scene.js";
import { UniformType } from "../../lib/webgl/uniforms.js";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;
let controller: Controller;
let cameraType = CAMERA_TYPE.ORBITING;
let projectionType = PROJECTION_TYPE.PERSPECTIVE;
let initialPosition = new Vector([0, 2, 50]);

const initProgram = () => {
  camera = new Camera(cameraType, projectionType, gl);
  scene = new Scene(gl, camera);
  camera.setPosition(initialPosition);
  camera.setInitialPosition(initialPosition);
  controller = new Controller({ camera, canvas });
};

const initLights = () => {
  // gl.uniform3fv(program.uLightPosition, [0, 120, 120]);
  //       gl.uniform4fv(program.uLightAmbient, [0.2, 0.2, 0.2, 1]);
  //       gl.uniform4fv(program.uLightDiffuse, [1, 1, 1, 1]);
  //       gl.uniform4fv(program.uLightSpecular, [1, 1, 1, 1]);
  //       gl.uniform1f(program.uShininess, 230);
};

const initData = () => {
  loadData("/data/models/geometries/sphere2.json").then((data) => {
    const { vertices, indices, diffuse } = data;
    scene.add(
      new Cone({
        gl,
        attributes: {
          aPosition: {
            data: vertices,
            size: 3,
            type: gl.FLOAT,
          },
        },
        uniforms: {
          uMaterialDiffuse: {
            data: diffuse,
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
  });
  loadData("/data/models/geometries/cone3.json").then((data) => {
    const { vertices, indices, diffuse } = data;
    scene.add(
      new Cone({
        gl,
        attributes: {
          aPosition: {
            data: vertices,
            size: 3,
            type: gl.FLOAT,
          },
        },
        uniforms: {
          uMaterialDiffuse: {
            data: diffuse,
            type: UniformType.VECTOR_FLOAT,
          },
        },
        indices,
      })
    );
  });
  // scene.add(
  //   Instance.fromModel({
  //     model: new Floor(80, 2),
  //     gl,
  //     program,
  //   })
  // );
  // scene.add(
  //   Instance.fromModel({
  //     model: new Axis(82),
  //     gl,
  //     program,
  //   })
  // );
};

const draw = () => {
  scene.render();
};

const render = () => {
  requestAnimationFrame(render);
  draw();
};

const initControls = () => {
  initController();

  createSelectorForm({
    label: "Camera Type",
    value: cameraType,
    options: Object.values(CAMERA_TYPE),
    onChange: (v) => {
      camera.setType(v);
    },
  });
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
