import { loadData } from "../../lib/files.js";
import { createDescriptionPanel, initGUI } from "../../lib/gui/index.js";
import { calculateNormals } from "../../lib/math/3d.js";
import { linearInterpolation } from "../../lib/math/interpolation.js";
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
import Axis from "../../lib/webgl/models/axis/index.js";
import Floor from "../../lib/webgl/models/floor/index.js";
import Mesh from "../../lib/webgl/models/mesh/index.js";
import Scene from "../../lib/webgl/scene.js";
import { UniformType } from "../../lib/webgl/types.js";

let canvas: HTMLCanvasElement;
let gl: WebGL2RenderingContext;
let scene: Scene;
let camera: Camera;
let initialPosition = [-25, 0, 20] as [number, number, number],
  finalPosition = [40, 0, -20] as [number, number, number],
  interpolationSteps = 1000,
  ballColor = [1, 1, 0, 1],
  flagStartColor = [0, 1, 0, 1],
  flagEndColor = [0, 0, 1, 1];
let interpolatedPositions: [number, number, number][] = [];

const initProgram = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CAMERA_TYPE.ORBITING,
    PROJECTION_TYPE.PERSPECTIVE,
    gl,
    scene
  );
  camera.setPosition(new Vector([0, 2, 80]));
  camera.setElevation(-20);
  new Controller({ camera, canvas });
};

const initData = () => {
  const lightUniforms = {
    uLightPosition: {
      data: [0, 120, 120],
      type: UniformType.FLOAT,
    },
    uLightDiffuse: {
      data: [1, 1, 1, 1],
      type: UniformType.FLOAT,
    },
    uLightSpecular: {
      data: [1, 1, 1, 1],
      type: UniformType.FLOAT,
    },
    uShininess: {
      data: 230,
      type: UniformType.FLOAT,
    },
  };
  loadData("/data/models/geometries/flag.json").then((data) => {
    const { vertices, indices } = data;
    [
      { position: initialPosition, color: flagStartColor },
      { position: finalPosition, color: flagEndColor },
    ].forEach(({ position, color }, id) => {
      scene.add(
        new Mesh({
          id: `flag-${id}`,
          gl,
          attributes: {
            aPosition: {
              data: vertices,
              type: gl.FLOAT,
              size: 3,
            },
            aNormal: {
              data: calculateNormals(vertices, indices, 3),
              type: gl.FLOAT,
              size: 3,
            },
          },
          uniforms: {
            uMaterialDiffuse: {
              data: color,
              type: UniformType.VECTOR_FLOAT,
            },
            uTranslation: {
              data: position,
              type: UniformType.VECTOR_FLOAT,
            },
            ...lightUniforms,
          },
          indices,
        })
      );
    });
  });
  loadData("/data/models/geometries/ball.json").then((data) => {
    const { vertices, indices } = data;
    scene.add(
      new Mesh({
        id: `ball`,
        gl,
        attributes: {
          aPosition: {
            data: vertices,
            type: gl.FLOAT,
            size: 3,
          },
          aNormal: {
            data: calculateNormals(vertices, indices, 3),
            type: gl.FLOAT,
            size: 3,
          },
        },
        uniforms: {
          uMaterialDiffuse: {
            data: ballColor,
            type: UniformType.VECTOR_FLOAT,
          },
          uTranslation: {
            data: initialPosition,
            type: UniformType.VECTOR_FLOAT,
          },
          ...lightUniforms,
        },
        indices,
      })
    );
  });
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
  scene.add(new Axis({ gl, dimension: 82 }));
  interpolatedPositions = linearInterpolation(
    [initialPosition, finalPosition],
    interpolationSteps
  );
};

const animatePosition = (time: number) => {
  scene.updateUniform(
    "uTranslation",
    interpolatedPositions[time % interpolationSteps],
    "ball"
  );
};

const draw = () => {
  scene.render();
};

const render = (time: number) => {
  requestAnimationFrame(render);
  animatePosition(Math.floor(time * 0.25));
  draw();
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we showcase how the linear interpolation method work."
  );
  canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();

  initProgram();
  initData();
  render(0);
};

window.onload = init;
