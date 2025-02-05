import CubeMapTexture from "./cubemap-texture.js";
import Texture2D from "./texture-2d.js";
import Texture from "./texture.js";
import { TextureDefinition } from "./types.js";

class TextureFactory {
  static create({
    gl,
    index,
    target,
    source,
    texture,
    data,
    faces,
    configuration,
  }: {
    gl: WebGL2RenderingContext;
  } & TextureDefinition): Texture {
    switch (target) {
      case WebGL2RenderingContext.TEXTURE_2D:
        return new Texture2D({
          gl,
          index,
          source,
          data,
          texture,
          configuration,
        });
      case WebGL2RenderingContext.TEXTURE_CUBE_MAP:
        return new CubeMapTexture({ gl, index, faces, configuration });
      default:
        throw new Error(`Unsupported texture: ${target}`);
    }
  }
}

export default TextureFactory;
