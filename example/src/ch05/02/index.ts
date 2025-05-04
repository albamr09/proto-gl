import { loadData } from "@example/utilities/files";
import { createDescriptionPanel, initGUI } from "@example/utilities/gui/index";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "@example/utilities/web-gl";
import {
  calculateNormals,
  Camera,
  Controller,
  Axis,
  Floor,
  Scene,
  UniformKind,
  Mesh,
} from "@proto-gl";

let canvas: HTMLCanvasElement;
let gl: WebGL2RenderingContext;
let scene: Scene;
let camera: Camera;
const gravity = 9.8;
let bouncingBalls: BouncingBall[] = [];
let sceneTime = 0;
const nBalls = 500;

// Generate a random position
const generatePosition = () => {
  return [
    Math.floor(Math.random() * 50) - Math.floor(Math.random() * 50),
    Math.floor(Math.random() * 30) + 50,
    Math.floor(Math.random() * 50),
  ];
};

class BouncingBall {
  private id: string;
  private position: number[];
  private H0: number;
  private V0: number;
  private VF: number;
  private HF: number;
  private bouncingTime: number;
  private BOUNCINESS: number;

  constructor(id: string) {
    this.id = id;
    this.position = generatePosition();

    this.H0 = this.position[1];
    this.V0 = 0;
    this.VF = Math.sqrt(2 * gravity * this.H0);
    this.HF = 0;

    this.bouncingTime = 0;
    this.BOUNCINESS = Math.random() + 0.5;
  }

  getId() {
    return this.id;
  }

  getPosition() {
    return this.position;
  }

  update(time: number) {
    const t = time - this.bouncingTime;
    const h = this.H0 + this.V0 * t - 0.5 * gravity * t * t;

    if (h <= 0) {
      this.bouncingTime = time;
      this.V0 = this.VF * this.BOUNCINESS;
      this.HF = (this.V0 * this.V0) / (2 * gravity);
      this.VF = Math.sqrt(2 * gravity * this.HF);
      this.H0 = 0;
    } else {
      this.position[1] = h;
    }
  }
}

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  camera = new Camera({
    gl,
    scene,
  });
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
  loadData("/data/models/geometries/ball.json").then((data) => {
    const { vertices, indices } = data;
    const normals = calculateNormals(vertices, indices, 3);
    Array.from({ length: nBalls }).forEach((_, idx) => {
      const id = `sphere-${idx}`;
      scene.add(
        new Mesh({
          id,
          gl,
          attributes: {
            aPosition: {
              data: vertices,
              size: 3,
              type: gl.FLOAT,
            },
            aNormal: {
              data: normals,
              size: 3,
              type: gl.FLOAT,
            },
          },
          uniforms: {
            uMaterialDiffuse: {
              data: [Math.random(), Math.random(), Math.random(), 1],
              type: UniformKind.SCALAR_FLOAT,
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
      bouncingBalls.push(new BouncingBall(id));
    });
  });
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
  scene.add(new Axis({ gl, dimension: 82 }));
};

const animate = () => {
  bouncingBalls.forEach((b) => {
    b.update(sceneTime);
    scene.updateUniform("uTranslation", b.getPosition(), b.getId());
  });
  sceneTime += 33 / 1000;
};

const draw = () => {
  scene.render();
};

const render = () => {
  requestAnimationFrame(render);
  animate();
  draw();
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we show how to use parametric curves to control an animation. To be more concrete, we compute the position of every object (sphere) at time t."
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initProgram();
  initData();
  render();
};

window.onload = init;
