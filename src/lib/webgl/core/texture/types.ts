export interface TextureDefinition {
  index: number;
  target?: TextureTargets;
  source?: string;
  data?: HTMLImageElement;
  faces?: Record<CubeMapTargets, string>;
  configuration?: TextureConfiguration;
}

export interface TextureConfiguration {
  generateMipmap?: boolean;
  magFilter?: GLint;
  minFilter?: GLint;
  wrapS?: GLint;
  wrapT?: GLint;
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
