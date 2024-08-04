import { loadData } from "../../lib/files.js";
import {
  createDescriptionPanel,
  createSelectorForm,
  createVector3dSliders,
  initController,
  initGUI,
} from "../../lib/gui/index.js";
import { calculateNormals, computeNormalMatrix } from "../../lib/math/3d.js";
import { Matrix4 } from "../../lib/math/matrix.js";
import { Vector } from "../../lib/math/vector.js";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "../../lib/web-gl.js";
import Axis from "../../lib/webgl/models/axis.js";
import Floor from "../../lib/webgl/models/floor.js";
import Program from "../../lib/webgl/program.js";
import Scene from "../../lib/webgl/scene.js";
import fragmentShaderSource from "./fs.gl.js";
import vertexShaderSource from "./vs.gl.js";

enum COORDINATE_SYSTEM {
  WORLD_COORDINATES = "World Coordinates",
  CAMERA_COORDINATES = "Camera Coordinates",
}

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uLightPosition",
  "uLightDiffuse",
  "uLightAmbient",
  "uMaterialDiffuse",
  "uMaterialAmbient",
  "uMaterialSpecular",
  "uWireFrame",
] as const;

let gl: WebGL2RenderingContext;
let program: Program<typeof attributes, typeof uniforms>;
let scene: Scene<typeof attributes, typeof uniforms>;
let modelViewMatrix: Matrix4,
  normalMatrix: Matrix4,
  cameraMatrix: Matrix4,
  projectionMatrix: Matrix4;

let modelTranslation = [0, -2, -50];
let coordinateSystem = COORDINATE_SYSTEM.WORLD_COORDINATES;

const initProgram = () => {
  // Background colors :)
  gl.clearColor(0.9, 0.9, 0.9, 1);
  // Depth testing
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  // Create program object: compiles program and "creates"
  // attributes and uniforms
  program = new Program(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    attributes,
    uniforms
  );
  scene = new Scene(gl, program);
};

const initData = async () => {
  const data = await loadData("/data/models/geometries/cone3.json");
  const floorModel = new Floor(80, 2);
  const axisModel = new Axis(82);
  scene.addObject({
    attributes: {
      aPosition: {
        data: data.vertices as number[],
        size: 3,
        type: gl.FLOAT,
      },
      aNormal: {
        data: calculateNormals(data.vertices, data.indices, 3),
        size: 3,
        type: gl.FLOAT,
      },
    },
    uniforms: {
      uMaterialDiffuse: data.diffuse,
      uMaterialAmbient: [0.2, 0.2, 0.2, 1],
    },
    indices: data.indices,
  });
  scene.addObject({
    attributes: {
      aPosition: {
        data: floorModel.vertices,
        size: 3,
        type: gl.FLOAT,
      },
      aNormal: {
        data: calculateNormals(floorModel.vertices, floorModel.indices, 3),
        size: 3,
        type: gl.FLOAT,
      },
    },
    indices: floorModel.indices,
    uniforms: {
      uWireFrame: floorModel.wireframe,
      uMaterialDiffuse: floorModel.color,
    },
  });
  scene.addObject({
    attributes: {
      aPosition: {
        data: axisModel.vertices,
        size: 3,
        type: gl.FLOAT,
      },
      aNormal: {
        data: calculateNormals(axisModel.vertices, axisModel.indices, 3),
        size: 3,
        type: gl.FLOAT,
      },
    },
    indices: axisModel.indices,
    uniforms: {
      uWireFrame: axisModel.wireframe,
      uMaterialDiffuse: axisModel.color,
    },
  });
};

const initLightUniforms = () => {
  gl.uniform3fv(program.uniforms.uLightPosition, [0, 120, 120]);
  gl.uniform4fv(program.uniforms.uLightAmbient, [0.2, 0.2, 0.2, 1]);
  gl.uniform4fv(program.uniforms.uLightDiffuse, [1, 1, 1, 1]);
};

const setTransformUniforms = () => {
  modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector(modelTranslation));
  cameraMatrix = modelViewMatrix.inverse() as Matrix4;
  normalMatrix = computeNormalMatrix(modelViewMatrix);
  projectionMatrix = Matrix4.perspective(
    45,
    gl.canvas.width / gl.canvas.height,
    0.1,
    1000
  );
  gl.uniformMatrix4fv(
    program.uniforms.uModelViewMatrix,
    false,
    modelViewMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(
    program.uniforms.uNormalMatrix,
    false,
    normalMatrix.toFloatArray()
  );
  gl.uniformMatrix4fv(
    program.uniforms.uProjectionMatrix,
    false,
    projectionMatrix.toFloatArray()
  );
};

const draw = () => {
  scene.clear();
  try {
    setTransformUniforms();
    scene.render((o) => {
      if (o.uniforms?.uMaterialAmbient) {
        gl.uniform4fv(
          program.uniforms.uMaterialAmbient,
          o.uniforms.uMaterialAmbient
        );
      }
      if (o.uniforms?.uMaterialDiffuse) {
        gl.uniform4fv(
          program.uniforms.uMaterialDiffuse,
          o.uniforms.uMaterialDiffuse
        );
      }
      if (o.uniforms?.uWireFrame) {
        gl.uniform1i(program.uniforms.uWireFrame, o.uniforms?.uWireFrame);
      }
      gl.bindVertexArray(o.vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.ibo);

      if (o.uniforms?.uWireFrame) {
        gl.drawElements(gl.LINES, o.len, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.drawElements(gl.TRIANGLES, o.len, gl.UNSIGNED_SHORT, 0);
      }

      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    });
  } catch (error) {
    console.error(`Could not render scene ${error}`);
  }
};

const render = () => {
  requestAnimationFrame(render);
  draw();
};

const init = async () => {
  initGUI();
  createDescriptionPanel("See the Camera Translation in action");

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  gl = getGLContext();

  initProgram();
  await initData();
  initLightUniforms();
  // Lights
  render();

  initController();
  createSelectorForm({
    label: "Coordinate System",
    value: coordinateSystem,
    options: Object.values(COORDINATE_SYSTEM),
    onChange(v) {
      coordinateSystem = v;
    },
  });
  createVector3dSliders({
    labels: ["Translate X", "Translate Y", "Translate Z"],
    value: modelTranslation,
    min: -500,
    max: 500,
    step: 1,
    onInit: (v) => {
      modelTranslation = v;
    },
    onChange(v) {
      modelTranslation = v;
    },
  });
};

window.onload = init;
