import Texture2D from "../../../core/texture/texture-2d";
import { UniformKind } from "../../../core/uniform/types.js";
import Instance from "../../instance.js";
import { FilterTypes } from "../types";

abstract class Filter {
  private id: string;
  private type?: FilterTypes;
  private vertexShaderSource: string;
  private fragmentShaderSource: string;
  protected instance?: Instance<any, any>;

  constructor({
    id,
    type,
    vertexShaderSource,
    fragmentShaderSource,
  }: {
    id: string;
    type?: FilterTypes;
    vertexShaderSource: string;
    fragmentShaderSource: string;
  }) {
    this.id = id;
    this.type = type;
    this.vertexShaderSource = vertexShaderSource;
    this.fragmentShaderSource = fragmentShaderSource;
  }

  protected getVertices() {
    return [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
  }

  protected getTextureCoords() {
    return [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];
  }

  public build(gl: WebGL2RenderingContext, texture: Texture2D) {
    this.instance = new Instance({
      id: this.id,
      gl,
      vertexShaderSource: this.vertexShaderSource,
      fragmentShaderSource: this.fragmentShaderSource,
      ...this.getCommonProperties(gl, texture),
    });
    return this;
  }

  protected getCommonProperties = (
    gl: WebGL2RenderingContext,
    texture: Texture2D
  ) => {
    return {
      attributes: {
        aPosition: {
          data: this.getVertices(),
          size: 2,
          type: gl.FLOAT,
        },
        aTextureCoords: {
          data: this.getTextureCoords(),
          size: 2,
          type: gl.FLOAT,
        },
      },
      uniforms: {
        uSampler: {
          data: 0,
          type: UniformKind.SCALAR_INT,
        },
      },
      textures: [
        {
          target: gl.TEXTURE_2D,
          index: 0,
          texture: texture.getTexture()!,
          configuration: texture.getConfiguration(),
        },
      ],
      size: 6,
    };
  };

  public render() {
    return this.instance?.render({});
  }

  public getType() {
    return this.type;
  }

  public getId() {
    return this.id;
  }
}

export default Filter;
