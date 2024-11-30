import { loadData } from "../../lib/files.js";
import {
  createDescriptionPanel,
  createNumericInput,
  createSelectorForm,
  initController,
  initGUI,
} from "../../lib/gui/index.js";
import { calculateNormals } from "../../lib/math/3d.js";
import {
  bSplineInterpolation,
  lagrangeInterpolation,
  linearInterpolation,
} from "../../lib/math/interpolation.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera from "../../lib/webgl/camera/camera.js";
import { CameraType, ProjectionType } from "../../lib/webgl/camera/types.js";
import Controller from "../../lib/webgl/camera/controller.js";
import Axis from "../../lib/webgl/models/axis/index.js";
import Floor from "../../lib/webgl/models/floor/index.js";
import Mesh from "../../lib/webgl/models/mesh/index.js";
import Scene from "../../lib/webgl/rendering/scene.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";

enum INTERPOLATION {
  LINEAR = "linear",
  POLYNOMIAL = "polynomial",
  BSPLINE = "b-spline",
}

let canvas: HTMLCanvasElement;
let gl: WebGL2RenderingContext;
let scene: Scene;
let camera: Camera;
let interpolationSteps = 1000,
  ballColor = [1, 1, 0, 1],
  flagStartColor = [0, 1, 0, 1],
  flagEndColor = [0, 0, 1, 1],
  flagColor = [0.5, 0.5, 0.5, 1],
  flagIds: string[] = [],
  linearControlPoints = [
    [-25, 0, 20],
    [-40, 0, -10],
    [0, 0, 10],
    [25, 0, -5],
    [40, 0, -20],
  ] as [number, number, number][],
  polynomialControlPoints = [
    [21, 0, 23],
    [-3, 0, -10],
    [-21, 0, -53],
    [50, 0, -31],
    [-24, 0, 2],
  ] as [number, number, number][],
  bSplineControlPoints = [
    [-21, 0, 23],
    [32, 0, -10],
    [0, 0, -53],
    [-32, 0, -10],
    [21, 0, 23],
  ] as [number, number, number][],
  controlPoints: [number, number, number][] = [];
let interpolatedPositions: [number, number, number][] = [];
let interpolationMethod = INTERPOLATION.POLYNOMIAL;
let highlightDistThreshold = 5;
const ANIMATION_DURATION = 3000;

const getColorFromIdx = (idx: number) => {
  return idx == 0
    ? flagStartColor
    : idx == controlPoints.length - 1
    ? flagEndColor
    : flagColor;
};

const updateControlPoints = () => {
  switch (interpolationMethod) {
    case INTERPOLATION.LINEAR:
      controlPoints = linearControlPoints;
      highlightDistThreshold = 5;
      break;
    case INTERPOLATION.POLYNOMIAL:
      controlPoints = polynomialControlPoints;
      highlightDistThreshold = 20;
      break;
    case INTERPOLATION.BSPLINE:
      controlPoints = bSplineControlPoints;
      highlightDistThreshold = 20;
      break;
  }
  controlPoints.forEach((_, idx) => {
    scene.updateUniform(
      "uMaterialDiffuse",
      getColorFromIdx(idx),
      `flag-${idx}`
    );
  });
};

const computeInterpolatedPositions = (method: INTERPOLATION, steps: number) => {
  if (method == INTERPOLATION.LINEAR) {
    interpolatedPositions = linearInterpolation(controlPoints, steps);
  } else if (method == INTERPOLATION.POLYNOMIAL) {
    interpolatedPositions = lagrangeInterpolation(controlPoints, steps) ?? [];
  } else if (method == INTERPOLATION.BSPLINE) {
    interpolatedPositions = bSplineInterpolation(controlPoints, steps);
  }
};

const initProgram = () => {
  scene = new Scene(gl);
  camera = new Camera(
    CameraType.ORBITING,
    ProjectionType.PERSPECTIVE,
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
    controlPoints.forEach((position, id) => {
      flagIds.push(`flag-${id}`);
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
              data: getColorFromIdx(id),
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
            data: controlPoints[0],
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
};

const distance = (x: [number, number, number], y: [number, number, number]) => {
  return Math.sqrt(
    Math.pow(x[0] - y[0], 2) +
      Math.pow(x[1] - y[1], 2) +
      Math.pow(x[2] - y[2], 2)
  );
};

const animatePosition = (progress: number) => {
  const posIdx = Math.floor((interpolatedPositions.length - 1) * progress);
  scene.updateUniform("uTranslation", interpolatedPositions[posIdx], "ball");
  controlPoints.forEach((v, idx) => {
    if (idx == 0 || idx == controlPoints.length - 1) return;
    if (distance(v, interpolatedPositions[posIdx]) < highlightDistThreshold) {
      scene.updateUniform("uMaterialDiffuse", [1, 0, 0, 1], `flag-${idx}`);
    } else {
      scene.updateUniform("uMaterialDiffuse", flagColor, `flag-${idx}`);
    }
  });
};

const draw = () => {
  scene.render();
};

const render = (timestamp: number) => {
  const progress = (timestamp % ANIMATION_DURATION) / ANIMATION_DURATION;
  requestAnimationFrame(render);
  animatePosition(progress);
  draw();
};

const initControls = () => {
  initController();

  createSelectorForm({
    label: "Interpolation Method",
    value: interpolationMethod,
    options: Object.values(INTERPOLATION),
    onInit: (v) => {
      interpolationMethod = v;
      updateControlPoints();
      flagIds.forEach((id, i) => {
        scene.updateUniform("uTranslation", controlPoints[i], id);
      });
      computeInterpolatedPositions(interpolationMethod, interpolationSteps);
    },
    onChange: (v) => {
      interpolationMethod = v;
      updateControlPoints();
      flagIds.forEach((id, i) => {
        scene.updateUniform("uTranslation", controlPoints[i], id);
      });
      computeInterpolatedPositions(interpolationMethod, interpolationSteps);
    },
  });

  createNumericInput({
    label: "Interpolation Steps",
    value: interpolationSteps,
    min: 0,
    max: 2000,
    step: 1,
    onInit: (v) => {
      interpolationSteps = v;
      computeInterpolatedPositions(interpolationMethod, interpolationSteps);
    },
    onChange: (v) => {
      interpolationSteps = v;
      computeInterpolatedPositions(interpolationMethod, interpolationSteps);
    },
  });
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we showcase how different interpolation methods work."
  );
  canvas = configureCanvas();
  autoResizeCanvas(canvas);
  gl = getGLContext();

  initProgram();
  initData();
  render(0);
  initControls();
};

window.onload = init;
