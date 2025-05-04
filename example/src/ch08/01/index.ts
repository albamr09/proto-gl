import { loadData } from "@example/utilities/files";
import { createDescriptionPanel, initGUI } from "@example/utilities/gui/index";
import {
  calculateNormals,
  Matrix4,
  Vector,
  Camera,
  Controller,
  Program,
  UniformKind,
  Floor,
  Instance,
  PickingController,
  Scene,
} from "@proto-gl";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "@example/utilities/web-gl";
import fragmentShaderSource from "./fs.glsl";
import vertexShaderSource from "./vs.glsl";

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uMaterialDiffuse",
  "uTransform",
  "uLightPosition",
  "uLightAmbient",
  "uLightDiffuse",
  "uOffScreen",
  "uLabelColor",
  "uAlpha",
] as const;

type ObjectProperties = { translate: Vector; scale: Vector; color?: number[] };

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let camera: Camera;
let pickingController: PickingController;
let program: Program<typeof attributes, typeof uniforms>;

const initProgram = () => {
  scene = new Scene({
    gl,
    canvas,
    editorConfiguration: { allow: true, showGuides: true },
  });
  camera = new Camera({ gl, scene });
  pickingController = new PickingController(scene, canvas);
  new Controller({ camera, canvas, pickingController });
  camera.setPosition(new Vector([0, 0, 40]));
  camera.setElevation(-40);
  camera.setAzimuth(30);

  program = new Program<typeof attributes, typeof uniforms>(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    attributes,
    uniforms
  );

  // Alpha blending configuration
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Config culling
  gl.enable(gl.CULL_FACE);
};

const loadObject = (path: string, id: string, properties: ObjectProperties) => {
  const ligthUniforms = {
    uLightAmbient: {
      data: [0, 0, 0, 1],
      type: UniformKind.VECTOR_FLOAT,
    },
    uLightDiffuse: {
      data: [1, 1, 1, 1],
      type: UniformKind.VECTOR_FLOAT,
    },
    uLightPosition: {
      data: [0, 5, 20],
      type: UniformKind.VECTOR_FLOAT,
    },
  };
  loadData(path).then((data) => {
    const { vertices, indices, diffuse } = data;
    const instance = new Instance<typeof attributes, typeof uniforms>({
      id,
      gl,
      program,
      indices,
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
        uOffScreen: {
          data: false,
          type: UniformKind.SCALAR_INT,
        },
        uMaterialDiffuse: {
          data: properties.color ?? diffuse ?? [1, 1, 1, 1],
          type: UniformKind.VECTOR_FLOAT,
        },
        uTransform: {
          data: Matrix4.identity()
            .translate(properties.translate)
            .scale(properties.scale)
            .toFloatArray(),
          type: UniformKind.MATRIX,
        },
        uAlpha: {
          data: 1,
          type: UniformKind.SCALAR_FLOAT,
        },
        uLabelColor: {
          data: [0, 0, 0, 0],
          type: UniformKind.VECTOR_FLOAT,
        },
        ...ligthUniforms,
      },
      transformationProperties: {
        scaleVector: properties.scale,
        translationVector: properties.translate,
      },
    });
    scene.add(instance);
  });
};

const initData = () => {
  loadObject("/data/models/geometries/ball.json", "ball", {
    translate: new Vector([0, 0, -4]),
    scale: new Vector([3, 3, 3]),
    color: [1, 0, 0, 1],
  });
  loadObject("/data/models/geometries/ball.json", "disk", {
    translate: new Vector([-10, 0, -10]),
    scale: new Vector([3, 0.5, 3]),
    color: [0.3, 0.1, 0.9, 0.5],
  });
  loadObject("/data/models/geometries/flag.json", "flag", {
    translate: new Vector([-10, 0, 0]),
    scale: new Vector([1, 1, 1]),
  });
  loadObject("/data/models/geometries/cone3.json", "cone", {
    translate: new Vector([10, 0, 5]),
    scale: new Vector([1, 1, 1]),
  });
  loadObject("/data/models/geometries/cone3.json", "cone2", {
    translate: new Vector([-7, 0, 2]),
    scale: new Vector([0.5, 1, 0.5]),
    color: [0.3, 0.3, 0.6, 1],
  });
  loadObject("/data/models/geometries/cube-complex.json", "cube", {
    translate: new Vector([1, 2, 7]),
    scale: new Vector([4, 4, 4]),
    color: [0.1, 1, 0.2, 1],
  });
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
};

const render = () => {
  scene.render();
  requestAnimationFrame(render);
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "This is an example on how to implement picking based on the color of each object using an offscreen framebuffer. On this example you can click objects in order to edit them (translate, scale and rotate them). To change between each edition mode use the keys: M (translate the object), S (scale the object) and R (rotate the object). To exit the edition mode press the ESC key.",
    "ch08/01/"
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initProgram();
  initData();
  render();
};

window.onload = init;
