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
  "uWireFrame",
] as const;

let gl: WebGL2RenderingContext;
let program: Program<typeof attributes, typeof uniforms>;
let scene: Scene<typeof attributes, typeof uniforms>;
let modelTranslation = [0, -2, -50];
let modelRotation = [0, 0, 0];
let coordinateSystem = COORDINATE_SYSTEM.WORLD_COORDINATES;

const initProgram = () => {
  // Background colors :)
  gl.clearColor(0.9, 0.9, 0.9, 1);
  // Depth testing
  gl.clearDepth(1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
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
  const { vertices, indices, diffuse } = await loadData(
    "/data/models/geometries/cone3.json"
  );
  const floorModel = new Floor(82, 2);
  const axisModel = new Axis(82);

  scene.addObject({
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
      uMaterialDiffuse: diffuse,
      uMaterialAmbient: [0.2, 0.2, 0.2, 1],
    },
    indices,
  });
  scene.addObject({
    attributes: {
      aPosition: {
        data: floorModel.vertices,
        size: 3,
        type: gl.FLOAT,
      },
    },
    uniforms: {
      uWireFrame: floorModel.wireframe,
      uMaterialDiffuse: floorModel.color,
    },
    indices: floorModel.indices,
  });
  scene.addObject({
    attributes: {
      aPosition: {
        data: axisModel.vertices,
        size: 3,
        type: gl.FLOAT,
      },
    },
    uniforms: {
      uWireFrame: axisModel.wireframe,
      uMaterialDiffuse: axisModel.color,
    },
    indices: axisModel.indices,
  });
};

const initLightUniforms = () => {
  gl.uniform3fv(program.uniforms.uLightPosition, [0, 120, 120]);
  gl.uniform4fv(program.uniforms.uLightAmbient, [1.0, 1.0, 1.0, 1.0]);
  gl.uniform4fv(program.uniforms.uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
};

const updateTransforms = () => {
  let modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector(modelTranslation));
  modelViewMatrix = modelViewMatrix.rotateDeg(
    modelRotation[0],
    new Vector([1, 0, 0])
  );
  modelViewMatrix = modelViewMatrix.rotateDeg(
    modelRotation[1],
    new Vector([0, 1, 0])
  );
  modelViewMatrix = modelViewMatrix.rotateDeg(
    modelRotation[2],
    new Vector([0, 0, 1])
  );
  const normalMatrix = computeNormalMatrix(modelViewMatrix);
  const projectionMatrix = Matrix4.perspective(
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
  scene.render((o) => {
    if (o.uniforms?.uMaterialDiffuse) {
      gl.uniform4fv(
        program.uniforms.uMaterialDiffuse,
        o.uniforms.uMaterialDiffuse
      );
    }

    if (o.uniforms?.uMaterialAmbient) {
      gl.uniform4fv(
        program.uniforms.uMaterialAmbient,
        o.uniforms.uMaterialAmbient
      );
    }

    gl.bindVertexArray(o.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.ibo);

    if (o.uniforms?.uWireFrame) {
      gl.uniform1i(program.uniforms.uWireFrame, o.uniforms.uWireFrame);
      gl.drawElements(gl.LINES, o.len, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.uniform1i(program.uniforms.uWireFrame, 0);
      gl.drawElements(gl.TRIANGLES, o.len, gl.UNSIGNED_SHORT, 0);
    }

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  });
};

const render = () => {
  requestAnimationFrame(render);
  updateTransforms();
  draw();
};

const initControls = () => {
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
    labels: ["Rotation X", "Rotation Y", "Rotation Z"],
    value: [0.0, 0.0, 0.0],
    min: 0,
    max: 720,
    step: 0.1,
    onChange: (v) => {
      modelRotation = v;
    },
  });
};

const init = async () => {
  initGUI();
  createDescriptionPanel("See how camera rotation works.");

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  gl = getGLContext();
  initProgram();
  await initData();
  initLightUniforms();
  render();

  initControls();
};

window.onload = init;
