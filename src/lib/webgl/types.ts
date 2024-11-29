import { Matrix4 } from "../math/matrix.js";

// Attributes
export type AttributeDefinition = {
  data: number[];
  size: number;
  type: GLenum;
  stride?: number;
  offset?: number;
};

// Uniforms
export const TransformUniforms = [
  "uModelViewMatrix",
  "uNormalMatrix",
  "uProjectionMatrix",
] as const;
export type TransformUniformsType = typeof TransformUniforms;

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
}

export const transformUniformsDefinition: {
  [x in (typeof TransformUniforms)[number]]: {
    data: Float32Array;
    type: UniformType;
  };
} = {
  uModelViewMatrix: {
    data: Matrix4.identity().toFloatArray(),
    type: UniformType.MATRIX,
  },
  uNormalMatrix: {
    data: Matrix4.identity().toFloatArray(),
    type: UniformType.MATRIX,
  },
  uProjectionMatrix: {
    data: Matrix4.identity().toFloatArray(),
    type: UniformType.MATRIX,
  },
};

export type UniformDataMap = {
  [UniformType.INT]: number | number[] | boolean;
  [UniformType.FLOAT]: number | number[];
  [UniformType.VECTOR_FLOAT]: number[];
  [UniformType.VECTOR_INT]: number[];
  [UniformType.MATRIX]: Float32Array;
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

export type Uniforms<U extends readonly string[], T> = {
  [P in TransformUniformsType[number] | U[number]]: T | null;
};

export type Attributes<A extends readonly string[]> = {
  [P in A[number]]: number;
};

// Camera
export enum CAMERA_TYPE {
  TRACKING = "Tracking",
  ORBITING = "Orbiting",
}

export enum PROJECTION_TYPE {
  PERSPECTIVE = "Perspective",
  ORTHOGRAPHIC = "Orthographic",
}
