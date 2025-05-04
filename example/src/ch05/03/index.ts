import { loadData } from "@example/utilities/files";
import { createDescriptionPanel, initGUI } from "@example/utilities/gui/index";
import {
  calculateNormals,
  Camera,
  Controller,
  Axis,
  Floor,
  Scene,
  UniformKind,
  Mesh,
  linearInterpolation,
  Vector,
} from "@proto-gl";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "@example/utilities/web-gl";
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
  scene = new Scene({ gl, canvas });
  camera = new Camera({ gl, scene });
  camera.setPosition(new Vector([0, 2, 80]));
  camera.setElevation(-20);
  new Controller({ camera, canvas });
};

const initData = () => {
  const lightUniforms = {
    uLightPosition: {
      data: [0, 120, 120],
      type: UniformKind.SCALAR_FLOAT,
    },
    uLightDiffuse: {
      data: [1, 1, 1, 1],
      type: UniformKind.SCALAR_FLOAT,
    },
    uLightSpecular: {
      data: [1, 1, 1, 1],
      type: UniformKind.SCALAR_FLOAT,
    },
    uShininess: {
      data: 230,
      type: UniformKind.SCALAR_FLOAT,
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
              type: UniformKind.VECTOR_FLOAT,
            },
            uTranslation: {
              data: position,
              type: UniformKind.VECTOR_FLOAT,
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
            type: UniformKind.VECTOR_FLOAT,
          },
          uTranslation: {
            data: initialPosition,
            type: UniformKind.VECTOR_FLOAT,
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
    "On this example we showcase how the linear interpolation method work.",
    "ch05/03/"
  );
  canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();

  initProgram();
  initData();
  render(0);
};

window.onload = init;
