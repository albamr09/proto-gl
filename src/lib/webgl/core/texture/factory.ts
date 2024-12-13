import Texture, { CubeMapTexture, Texture2D } from "./texture.js";
import {
  CubeMapTargets,
  TextureConfiguration,
  TextureTargets,
} from "./types.js";

class TextureFactory {
  static create({
    gl,
    index,
    target,
    source,
    data,
    faces,
    configuration,
  }: {
    gl: WebGL2RenderingContext;
    index: number;
    target: TextureTargets;
    source?: string;
    faces?: Record<CubeMapTargets, string>;
    data?: HTMLImageElement;
    configuration?: TextureConfiguration;
  }): Texture {
    switch (target) {
      case WebGL2RenderingContext.TEXTURE_2D:
        return new Texture2D({ gl, index, source, data, configuration });
      case WebGL2RenderingContext.TEXTURE_CUBE_MAP:
        return new CubeMapTexture({ gl, index, faces, configuration });
      default:
        throw new Error(`Unsupported texture: ${target}`);
    }
  }
}

export default TextureFactory;
