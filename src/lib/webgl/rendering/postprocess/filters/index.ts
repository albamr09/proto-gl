import Texture2D from "../../../core/texture/texture-2d";
import { UniformKind } from "../../../core/uniform/types.js";
import Instance from "../../instance.js";
import { InstanceProps } from "../../types";
import { FilterTypes } from "../types";

const attributes = ["aPosition", "aTextureCoords"] as const;
const uniforms = ["uSampler"] as const;

abstract class Filter<
  A extends readonly string[] = [],
  U extends readonly string[] = []
> {
  private id: string;
  private type?: FilterTypes;
  protected vertexShaderSource: string;
  protected fragmentShaderSource: string;
  protected instance?: Instance<
    [...A, ...typeof attributes],
    [...U, ...typeof uniforms]
  >;

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

  private getVertices() {
    return [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
  }

  private getTextureCoords() {
    return [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];
  }

  protected createInstance(
    props: InstanceProps<
      [...A, ...typeof attributes],
      [...U, ...typeof uniforms]
    >
  ) {
    this.instance = new Instance<
      [...A, ...typeof attributes],
      [...U, ...typeof uniforms]
    >({
      ...props,
    });
  }

  public build(gl: WebGL2RenderingContext, texture: Texture2D) {
    this.createInstance({
      id: this.id,
      gl,
      vertexShaderSource: this.vertexShaderSource,
      fragmentShaderSource: this.fragmentShaderSource,
      attributes: this.getCommonAttributes(gl),
      textures: this.getCommonTextures(gl, texture),
      ...this.getCommonProperties(),
    });
    return this;
  }

  protected getCommonAttributes = (gl: WebGL2RenderingContext) => {
    return {
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
    };
  };

  protected getCommonTextures = (
    gl: WebGL2RenderingContext,
    texture: Texture2D
  ) => {
    return [
      {
        target: gl.TEXTURE_2D,
        index: 0,
        texture: texture.getTexture()!,
        configuration: texture.getConfiguration(),
      },
    ];
  };

  protected getCommonProperties = () => {
    return {
      size: 6,
    };
  };

  protected updateUniforms() {}

  public render() {
    this.updateUniforms();
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
