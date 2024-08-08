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

enum CAMERA_TYPES {
  TRACKING = "Tracking Camera",
  ORBITING = "Orbiting Camera",
}

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uWireFrame",
  "uMaterialDiffuse",
  "uMaterialAmbient",
  "uLightDiffuse",
  "uLightAmbient",
  "uLightPosition",
] as const;

let gl: WebGL2RenderingContext;
let program: Program<typeof attributes, typeof uniforms>;
let scene: Scene<typeof attributes, typeof uniforms>;
let modelViewMatrix = Matrix4.identity();
let modelTranslation = [0, -2, -50];
let modelRotation = [0, 0, 0];
let cameraType = CAMERA_TYPES.ORBITING;

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

const initData = () => {
  loadData("/data/models/geometries/cone3.json").then((data) => {
    scene.addObject({
      attributes: {
        aPosition: {
          data: data.vertices,
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
  });
  const floorModel = new Floor(82, 2);
  const axisModel = new Axis(82);
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

const draw = () => {
  scene.clear();
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
    gl.bindVertexArray(o.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.ibo);

    if (o.uniforms?.uWireFrame) {
      gl.uniform1i(program.uniforms.uWireFrame, 1);
      gl.drawElements(gl.LINES, o.len, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.uniform1i(program.uniforms.uWireFrame, 0);
      gl.drawElements(gl.TRIANGLES, o.len, gl.UNSIGNED_SHORT, 0);
    }

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  });
};

const updateTransforms = () => {
  modelViewMatrix = Matrix4.identity();
  modelViewMatrix = modelViewMatrix.translate(new Vector(modelTranslation));
  modelViewMatrix = modelViewMatrix.rotateVecDeg(new Vector(modelRotation));
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

const render = () => {
  requestAnimationFrame(render);
  updateTransforms();
  draw();
};

const initControls = () => {
  initController();
  createSelectorForm({
    label: "Camera Type",
    value: cameraType,
    options: Object.values(CAMERA_TYPES),
    onChange: (v) => {
      cameraType = v;
    },
  });
  createVector3dSliders({
    labels: ["Translate X", "Translate Y", "Translate Z"],
    value: modelTranslation,
    min: -500,
    max: 500,
    step: 1,
    onChange: (v) => {
      modelTranslation = v;
    },
  });
  createVector3dSliders({
    labels: ["Rotate X", "Rotate Y", "Rotate Z"],
    value: modelRotation,
    min: -180,
    max: 180,
    step: 1,
    onChange: (v) => {
      modelRotation = v;
    },
  });
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "Tinker with how the different camera types work. We differentiate between an orbiting camera type (the camera always points to the center and it moves 'around' the scene) and a tracking camera type (the camera is being moved, so you can 'look up', etc)"
  );

  const canvas = configureCanvas();
  autoResizeCanvas(canvas);

  gl = getGLContext();

  initProgram();
  initLightUniforms();
  initData();
  render();

  initControls();
};

window.onload = init;
