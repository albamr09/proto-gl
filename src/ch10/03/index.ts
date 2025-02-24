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
let particleLifeSpan = 10;
let particleSize = 20;
const MAX_VELOCITY = 2;
const MAX_FREQUENCY = 5;
const MAX_AMPLITUDE = 0.2;

const attributes = ["aPosition"] as const;
const uniforms = ["uParticleSize", "uMaterialDiffuse"] as const;
let particles: Particles;

type Particle = {
  position: number[];
  velocity: number;
  frequency: number[];
  amplitude: number[];
  lifespan: number;
  remainingLife: number;
};

class Particles {
  private particles: Particle[];
  private startTime: number;
  private lastUpdateTime!: number;

  constructor(size: number) {
    this.particles = this.createParticles(size);
    this.startTime = this.millisecondsToSeconds(Date.now());
    this.updateLastUpdateTime();
  }

  private millisecondsToSeconds(ms: number) {
    return ms / 1000;
  }

  private createParticles(size: number) {
    return Array.from({ length: size }).map(() => this.createParticle());
  }

  private createParticle() {
    const lifespan = Math.random() * particleLifeSpan;
    return {
      position: [
        Math.random() * MAX_AMPLITUDE - MAX_AMPLITUDE / 2,
        0,
        Math.random() * MAX_AMPLITUDE - MAX_AMPLITUDE / 2,
        0,
      ],
      velocity: Math.random() * MAX_VELOCITY,
      amplitude: [
        Math.random() * MAX_AMPLITUDE - MAX_AMPLITUDE / 2,
        Math.random() * MAX_AMPLITUDE - MAX_AMPLITUDE / 2,
      ],
      frequency: [Math.random() * MAX_FREQUENCY, Math.random() * MAX_FREQUENCY],
      lifespan,
      remainingLife: lifespan,
    };
  }

  public getVertexPositions() {
    return this.particles.flatMap((particle) => particle.position);
  }

  public update() {
    const elapsedTime = this.getElapsedTime();
    const absoluteTime = this.getAbsoluteTime();
    this.particles = this.particles.map((particle) => {
      particle.remainingLife -= elapsedTime;

      // Once the particle expires, reset it to the origin with a new velocity
      if (particle.remainingLife <= 0) {
        return this.createParticle();
      }

      return this.updateParticlePosition(particle, elapsedTime, absoluteTime);
    });
    this.updateLastUpdateTime();
  }

  private getElapsedTime() {
    return (Date.now() - this.lastUpdateTime) / 1000;
  }

  private getAbsoluteTime() {
    return this.millisecondsToSeconds(Date.now()) - this.startTime;
  }

  private updateParticlePosition = (
    particle: Particle,
    elapsedTime: number,
    absoluteTime: number
  ) => {
    // Sine functions for x and z positions
    particle.position[0] +=
      Math.sin(particle.frequency[0] * absoluteTime) * particle.amplitude[0];
    particle.position[2] +=
      Math.cos(particle.frequency[1] * absoluteTime) * particle.amplitude[1];
    particle.position[1] += particle.velocity * elapsedTime;

    // Apply gravity to the velocity
    particle.velocity += 0.4 * elapsedTime;
    particle.position[3] = particle.remainingLife / particle.lifespan;
    return particle;
  };

  private updateLastUpdateTime() {
    this.lastUpdateTime = Date.now();
  }
}

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  const camera = new Camera({ gl, scene });
  new Controller({ camera, canvas });
  camera.setPosition(new Vector([0, 0, 40]));
  camera.setElevation(-40);
  camera.setAzimuth(-30);

  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clearDepth(100);
  gl.enable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
};

const initData = () => {
  particles = new Particles(N_PARTICLES);
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
      uMaterialDiffuse: {
        data: [1.0, 0, 0, 1.0],
        type: UniformKind.VECTOR_FLOAT,
      },
    },
    configuration: {
      renderingMode: gl.POINTS,
    },
    textures: [
      {
        index: 0,
        source: "/data/images/bubble.png",
        target: gl.TEXTURE_2D,
        uniform: "uSampler",
        configuration: {
          magFilter: gl.LINEAR,
          minFilter: gl.LINEAR_MIPMAP_NEAREST,
          generateMipmap: true,
        },
      },
    ],
  });
  scene.add(particlesInstance);
};

const render = () => {
  particles.update();
  scene.setAttributeData({
    id: "particles",
    name: "aPosition",
    value: {
      data: particles.getVertexPositions(),
      size: 4,
      type: gl.FLOAT,
    },
    bind: true,
  });
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
    max: 20,
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
    "On this example we will show how to render particle effects for bubbles =)."
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
