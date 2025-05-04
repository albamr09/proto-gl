export interface TextureParameters {
  index: number;
  source?: string;
  texture?: WebGLTexture;
  data?: HTMLImageElement;
  faces?: { [Key in CubeMapTargets]: string };
  configuration?: TextureConfiguration;
}

export interface TextureDefinition extends TextureParameters {
  target: TextureTargets;
  uniform?: string;
}

export interface TextureConfiguration {
  generateMipmap?: boolean;
  magFilter?:
    | WebGL2RenderingContext["LINEAR"]
    | WebGL2RenderingContext["NEAREST"];
  minFilter?:
    | WebGL2RenderingContext["LINEAR"]
    | WebGL2RenderingContext["NEAREST"]
    | WebGL2RenderingContext["NEAREST_MIPMAP_NEAREST"]
    | WebGL2RenderingContext["LINEAR_MIPMAP_NEAREST"]
    | WebGL2RenderingContext["NEAREST_MIPMAP_LINEAR"]
    | WebGL2RenderingContext["LINEAR_MIPMAP_LINEAR"];
  wrapS?:
    | WebGL2RenderingContext["REPEAT"]
    | WebGL2RenderingContext["CLAMP_TO_EDGE"]
    | WebGL2RenderingContext["MIRRORED_REPEAT"];
  wrapT?:
    | WebGL2RenderingContext["REPEAT"]
    | WebGL2RenderingContext["CLAMP_TO_EDGE"]
    | WebGL2RenderingContext["MIRRORED_REPEAT"];
  width?: number;
  height?: number;
}

export type TextureTargets =
  | typeof WebGL2RenderingContext.TEXTURE_2D
  | typeof WebGL2RenderingContext.TEXTURE_CUBE_MAP;

export type CubeMapTargets =
  | typeof WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X
  | typeof WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y
  | typeof WebGL2RenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z
  | typeof WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X
  | typeof WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y
  | typeof WebGL2RenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z;
