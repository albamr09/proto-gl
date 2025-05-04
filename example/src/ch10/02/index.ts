import {
  addChildrenToController,
  createDescriptionPanel,
  createNumericInput,
  initController,
  initGUI,
} from "@example/utilities/gui/index";
import {
  Vector,
  Camera,
  Controller,
  Instance,
  Scene,
  UniformKind,
} from "@proto-gl";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "@example/utilities/web-gl";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let N_PARTICLES = 1024;
let particleLifeSpan = 3;
let particleSize = 14;

const attributes = ["aPosition"] as const;
const uniforms = ["uParticleSize"] as const;
let particles: Particles;

type Particle = {
  position: number[];
  velocity: number[];
  lifespan: number;
  remainingLife: number;
};

class Particles {
  private particles: Particle[];
  private lastUpdateTime!: number;

  constructor(size: number) {
    this.particles = this.createParticles(size);
    this.updateLastUpdateTime();
  }

  private createParticles(size: number) {
    return Array.from({ length: size }).map(() => this.createParticle());
  }

  private createParticle() {
    const lifespan = Math.random() * particleLifeSpan;
    return {
      position: [0, 0, 0, 0],
      velocity: [
        Math.random() * 20 - 10,
        Math.random() * 20,
        Math.random() * 20 - 10,
      ],
      lifespan,
      remainingLife: lifespan,
    };
  }

  public getVertexPositions() {
    return this.particles.flatMap((particle) => particle.position);
  }

  public update() {
    const elapsedTime = this.getElapsedTime();
    this.particles = this.particles.map((particle) => {
      particle.remainingLife -= elapsedTime;

      // Once the particle expires, reset it to the origin with a new velocity
      if (particle.remainingLife <= 0) {
        return this.createParticle();
      }

      return this.updateParticlePosition(particle, elapsedTime);
    });
    this.updateLastUpdateTime();
  }

  private getElapsedTime() {
    return (Date.now() - this.lastUpdateTime) / 1000;
  }

  private updateParticlePosition = (
    particle: Particle,
    elapsedTime: number
  ) => {
    particle.position[0] += particle.velocity[0] * elapsedTime;
    particle.position[1] += particle.velocity[1] * elapsedTime;
    particle.position[2] += particle.velocity[2] * elapsedTime;
    // Apply gravity to the velocity
    particle.velocity[1] -= 9.8 * elapsedTime;
    if (particle.position[1] < 0) {
      // Allow particles to bounce off the floor
      particle.velocity[1] *= -0.75;
      particle.position[1] = 0;
    }
    particle.position[3] = particle.remainingLife / particle.lifespan;
    return particle;
  };

  private updateLastUpdateTime() {
    this.lastUpdateTime = Date.now();
  }
}

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  const camera = new Camera({
    gl,
    scene,
  });
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
    "On this example we will show how to render particle effects.",
    "ch10/02/"
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
