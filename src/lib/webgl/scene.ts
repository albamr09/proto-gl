import { computeNormalMatrix } from "../math/3d.js";
import Camera from "./camera.js";
import Instance from "./instance.js";

class Scene {
  private gl: WebGL2RenderingContext;
  private camera?: Camera;
  private objects: Instance<any, any>[];

  constructor(gl: WebGL2RenderingContext, camera?: Camera) {
    this.gl = gl;
    this.camera = camera;
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

  updateUniform(uniformName: any[number], value: unknown) {
    this.objects.forEach((o) => {
      o.updateUniform(uniformName, value);
    });
  }

  add(o: Instance<any, any>) {
    this.objects.push(o);
  }

  render(cb: (o: Instance<any, any>) => void = () => {}, clear = true) {
    this.camera?.setTransposeProjection(true);
    const modelViewMatrix = this.camera?.getViewTransform();
    const normalMatrix = modelViewMatrix
      ? computeNormalMatrix(modelViewMatrix)
      : null;
    const projectionMatrix = this.camera?.getProjectionTransform();

    clear && this.clear();
    this.objects.forEach((o) => {
      modelViewMatrix &&
        o.updateUniform("uModelViewMatrix", modelViewMatrix.toFloatArray());
      normalMatrix &&
        o.updateUniform("uNormalMatrix", normalMatrix.toFloatArray());
      projectionMatrix &&
        o.updateUniform("uProjectionMatrix", projectionMatrix.toFloatArray());
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
