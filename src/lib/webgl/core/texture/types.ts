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
}

export interface TextureConfiguration {
  generateMipmap?: boolean;
  magFilter?: GLint;
  minFilter?: GLint;
  wrapS?: GLint;
  wrapT?: GLint;
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
