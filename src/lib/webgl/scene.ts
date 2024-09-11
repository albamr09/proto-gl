import { computeNormalMatrix } from "../math/3d.js";
import { Matrix4 } from "../math/matrix.js";
import Instance from "./instance.js";

class Scene {
  private gl: WebGL2RenderingContext;
  private objects: Instance<any, any>[];
  private modelViewMatrix: Matrix4;
  private normalMatrix: Matrix4;
  private projectionMatrix: Matrix4;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.modelViewMatrix = Matrix4.identity();
    this.normalMatrix = Matrix4.identity();
    this.projectionMatrix = Matrix4.identity();
    this.objects = [];
    this.setUp();
  }

  setUp() {
    // Background colors :)
    this.gl.clearColor(0.9, 0.9, 0.9, 1);
    // Depth testing
    this.gl.clearDepth(1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
  }

  updateUniform(uniformName: any, value: unknown) {
    this.objects.forEach((o) => {
      o.updateUniform(uniformName, value);
    });
  }

  updateModelViewMatrix(modelViewMatrix: Matrix4) {
    this.modelViewMatrix = modelViewMatrix.copy() as Matrix4;
    this.normalMatrix = computeNormalMatrix(this.modelViewMatrix);
  }

  updateProjectionMatrix(projectionMatrix: Matrix4) {
    this.projectionMatrix = projectionMatrix.copy() as Matrix4;
  }

  add(o: Instance<any, any>) {
    this.objects.push(o);
  }

  render(cb: (o: Instance<any, any>) => void = () => {}, clear = true) {
    clear && this.clear();
    this.objects.forEach((o) => {
      o.updateUniform("uModelViewMatrix", this.modelViewMatrix.toFloatArray());
      o.updateUniform("uNormalMatrix", this.normalMatrix.toFloatArray());
      o.updateUniform(
        "uProjectionMatrix",
        this.projectionMatrix.toFloatArray()
      );
      o.render({
        cb: (o) => {
          cb(o);
        },
      });
    });
  }

  /**
   * Setups scene to render
   */
  clear = (heightFactor = 1, widthFactor = 1) => {
    // Define the viewport geometry, this is used internally to map NDC coordinates
    // to the final drawing space
    this.gl.viewport(
      0,
      0,
      this.gl.canvas.width * widthFactor,
      this.gl.canvas.height * heightFactor
    );
    // Clear the scene
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  };
}

export default Scene;
