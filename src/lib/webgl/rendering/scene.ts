import { computeNormalMatrix } from "../../math/3d.js";
import { Matrix4 } from "../../math/matrix.js";
import { uuidv4 } from "../../utils.js";
import { TextureDefinition, TextureParameters } from "../core/texture/types.js";
import { UniformConfig } from "../core/uniform/types.js";
import Instance from "./instance";
import { InstanceConfiguration } from "./types.js";

class Scene {
  private gl: WebGL2RenderingContext;
  private objects: Map<string, Instance<any, any>>;
  private renderOrder: string[];
  private modelViewMatrix: Matrix4;
  private normalMatrix: Matrix4;
  private projectionMatrix: Matrix4;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.modelViewMatrix = Matrix4.identity();
    this.normalMatrix = Matrix4.identity();
    this.projectionMatrix = Matrix4.identity();
    this.objects = new Map();
    this.renderOrder = [];
    this.setUp();
  }

  // Default setup, defining depth testing
  private setUp() {
    this.gl.clearColor(0.9, 0.9, 0.9, 1);
    this.gl.clearDepth(1);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
  }

  // Objects
  add<A extends readonly string[], U extends readonly string[]>(
    o: Instance<A, U>
  ) {
    const id = o.getId() ?? uuidv4();
    o.setId(id);
    this.objects.set(id, o);
    this.renderOrder.push(id);
  }

  removeObjects() {
    this.renderOrder = [];
    this.objects.clear();
  }

  // Renders an item first
  renderFirst(id: string) {
    const index = this.renderOrder.indexOf(id);
    if (index == -1) {
      console.error(`Object for id ${index} not found`);
      return;
    }
    if (index === 0) return;

    // Remove id from array
    this.renderOrder.splice(index, 1);
    // Append id to start of array
    this.renderOrder.unshift(id);
    this.printRenderOrder();
  }

  // Renders an item last
  renderLast(id: string) {
    const index = this.renderOrder.indexOf(id);
    if (index == -1) {
      console.error(`Object for id ${index} not found`);
      return;
    }
    if (index === this.renderOrder.length - 1) return;

    // Remove id from array
    this.renderOrder.splice(index, 1);
    // Append id to end of array
    this.renderOrder.push(id);
    this.printRenderOrder();
  }

  // Pushes an item up the render priority
  renderSooner(id: string) {
    const index = this.renderOrder.indexOf(id);
    if (index == -1) {
      console.error(`Object for id ${index} not found`);
      return;
    }
    if (index == 0) {
      console.warn(
        `Object ${index} cannot be rendered sooner, as it is the first object to be rendered.`
      );
    }
    // Remove id from array
    this.renderOrder.splice(index, 1);
    // Move one position up
    this.renderOrder.splice(index - 1, 0, id);
    this.printRenderOrder();
  }

  // Pushes an item down the render priority
  renderLater(id: string) {
    const index = this.renderOrder.indexOf(id);
    if (index == -1) {
      console.error(`Object for id ${index} not found`);
      return;
    }
    if (index >= this.renderOrder.length) {
      console.warn(
        `Object ${index} cannot be rendered later, as it is the last object to be rendered.`
      );
    }

    // Remove id from array
    this.renderOrder.splice(index, 1);
    // Move one position down
    this.renderOrder.splice(index + 1, 0, id);
    this.printRenderOrder();
  }

  // Prints the current render order by alias
  printRenderOrder() {
    console.log("Render Order:", this.renderOrder);
  }

  setConfigurationValue<T>(
    key: keyof InstanceConfiguration,
    value: T,
    id?: string
  ) {
    if (id) {
      this.objects.get(id)?.setConfigurationValue(key, value);
      return;
    }
    this.objects.forEach((o) => {
      o.setConfigurationValue(key, value);
    });
  }

  // Context
  setGLParameters(fn: (gl: WebGL2RenderingContext) => void) {
    fn(this.gl);
    this.objects.forEach((o) => {
      o.setGLParameters(fn);
    });
  }

  // Uniforms
  // TODO: Get data should know the type
  getUniform(id: string, uniformName: any) {
    return this.objects.get(id)?.getUniform(uniformName);
  }

  updateUniform(
    uniformName: string,
    // TODO: type
    value: any,
    id?: string,
    metadata?: UniformConfig
  ) {
    if (id) {
      this.objects.get(id)?.updateUniform(uniformName, value, metadata);
      return;
    }
    this.objects.forEach((o) => {
      o.updateUniform(uniformName, value, metadata);
    });
  }

  updateTexture({ id, texture }: { id?: string; texture: TextureParameters }) {
    if (id) {
      this.objects.get(id)?.updateTexture({ ...texture });
      return;
    }
    this.objects.forEach((o) => {
      o.updateTexture({ ...texture });
    });
  }

  updateModelViewMatrix(modelViewMatrix: Matrix4) {
    this.modelViewMatrix = modelViewMatrix.copy() as Matrix4;
    this.normalMatrix = computeNormalMatrix(this.modelViewMatrix);
  }

  updateProjectionMatrix(projectionMatrix: Matrix4) {
    this.projectionMatrix = projectionMatrix.copy() as Matrix4;
  }

  render(cb: (o: Instance<any, any>) => void = () => {}, clear = true) {
    clear && this.clear();
    this.renderOrder.forEach((id) => {
      const o = this.objects.get(id);
      if (!o) {
        console.warn(`Object ${id} was not found while rendering`);
        return;
      }
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
  clear(heightFactor = 1, widthFactor = 1) {
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
  }
}

export default Scene;
