import CubeMapTexture from "@proto-gl/webgl/core/texture/cubemap-texture";
import Texture2D from "@proto-gl/webgl/core/texture/texture-2d";
import Texture from "@proto-gl/webgl/core/texture/texture";
import { TextureDefinition } from "@proto-gl/webgl/core/texture/types";

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
