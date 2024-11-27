import { transformUniforms } from "./uniforms";

// Attributes
export type AttributeDefinition = {
  data: number[];
  size: number;
  type: GLenum;
  stride?: number;
  offset?: number;
};

// Uniforms
export type TransformUniforms = typeof transformUniforms;

export type UniformMetadata = {
  size?: number;
  transpose?: boolean;
};

export enum UniformType {
  INT,
  FLOAT,
  VECTOR_FLOAT,
  VECTOR_INT,
  MATRIX,
  TEXTURE,
}

export type UniformDataMap = {
  [UniformType.INT]: number | boolean;
  [UniformType.FLOAT]: number;
  [UniformType.VECTOR_FLOAT]: number[];
  [UniformType.VECTOR_INT]: number[];
  [UniformType.MATRIX]: Float32Array;
  // TODO ALBA: this should be a texture
  [UniformType.TEXTURE]: any;
};

export type UniformDefinition<T extends UniformType = UniformType> =
  UniformMetadata & {
    type: T;
    data: UniformDataMap[T];
  };

export interface InstanceConfiguration {
  pickable?: boolean;
  visible?: boolean;
  renderingMode?: GLenum;
}

// Program
export enum PROGRAM_TYPE {
  VERTEX,
  FRAGMENT,
}

// Camera
export enum CAMERA_TYPE {
  TRACKING = "Tracking",
  ORBITING = "Orbiting",
}

export enum PROJECTION_TYPE {
  PERSPECTIVE = "Perspective",
  ORTHOGRAPHIC = "Orthographic",
}
