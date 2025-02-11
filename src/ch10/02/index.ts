import {
  addChildrenToController,
  createDescriptionPanel,
  createNumericInput,
  initController,
  initGUI,
} from "../../lib/gui/index.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Camera from "../../lib/webgl/core/camera/camera.js";
import {
  CameraType,
  ProjectionType,
} from "../../lib/webgl/core/camera/types.js";
import Controller from "../../lib/webgl/core/events/controller.js";
import { UniformKind } from "../../lib/webgl/core/uniform/types.js";
import Instance from "../../lib/webgl/rendering/instance.js";
import Scene from "../../lib/webgl/rendering/scene.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let N_PARTICLES = 1024;
let particleLifeSpan = 3;
let particleSize = 14;

const attributes = ["aPosition"] as const;
const uniforms = ["uParticleSize"] as const;

type Particle = {
  position: number[];
  velocity: number[];
  lifespan: number;
  remainingLife: number;
};

class Particles {
  private particles: Particle[];

  constructor(size: number) {
    this.particles = this.createParticles(size);
  }

  private createParticles(size: number) {
    return Array.from({ length: size }).map(() => this.createParticle());
  }

  private createParticle() {
    return {
      position: [0, 0, 0],
      velocity: [
        Math.random() * 20 - 10,
        Math.random() * 20,
        Math.random() * 20 - 10,
      ],
      lifespan: Math.random() * particleLifeSpan,
      remainingLife: Math.random() * particleLifeSpan,
    };
  }

  public getVertexPositions() {
    return this.particles.flatMap((particle) => [
      ...particle.position,
      particle.lifespan,
    ]);
  }
}

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  const camera = new Camera(
    CameraType.ORBITING,
    ProjectionType.PERSPECTIVE,
    gl,
    scene
  );
  new Controller({ camera, canvas });
  camera.setPosition(new Vector([0, 0, 40]));
  camera.setElevation(-40);
  camera.setAzimuth(-30);

  gl.enable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
};

const initData = () => {
  const particles = new Particles(N_PARTICLES);
  const particlesInstance = new Instance<typeof attributes, typeof uniforms>({
    id: "particles",
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    size: N_PARTICLES,
    attributes: {
      aPosition: {
        data: particles.getVertexPositions(),
        size: 4,
        type: gl.FLOAT,
      },
    },
    uniforms: {
      uParticleSize: {
        data: particleSize,
        type: UniformKind.SCALAR_FLOAT,
      },
    },
    configuration: {
      renderingMode: gl.POINTS,
    },
    textures: [
      {
        index: 0,
        source: "/data/images/spark.png",
        target: gl.TEXTURE_2D,
        uniform: "uSampler",
      },
    ],
  });
  scene.add(particlesInstance);
};

const render = () => {
  scene.render();
  requestAnimationFrame(render);
};

const initControls = () => {
  initController();

  const { container: particleSizeInput } = createNumericInput({
    label: "Particle Size",
    value: particleSize,
    min: 1,
    max: 50,
    step: 1,
    onChange: (v) => {
      scene.updateUniform("uParticleSize", v);
    },
  });
  const { container: particleLifeSpanInput } = createNumericInput({
    label: "Particle Life Span",
    value: particleLifeSpan,
    min: 1,
    max: 10,
    step: 1,
    onChange: (v) => {
      particleLifeSpan = v;
    },
  });

  addChildrenToController([particleSizeInput, particleLifeSpanInput]);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we will show how to render particle effects."
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initProgram();
  initData();
  render();
  initControls();
};

window.onload = init;
