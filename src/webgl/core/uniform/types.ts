import { Matrix4 } from "../../../math/matrix";
import {
  FloatUniform,
  IntUniform,
  MatrixUniform,
  VectorFloatUniform,
  VectorIntUniform,
} from "./uniforms";

export const TRANSFORM_UNIFORM_NAMES = [
  "uModelViewMatrix",
  "uNormalMatrix",
  "uProjectionMatrix",
] as const;

export type TransformUniformKeys = (typeof TRANSFORM_UNIFORM_NAMES)[number];

export type UniformConfig = {
  size?: number; // Vector size (e.g., 1, 2, 3, or 4)
  transpose?: boolean; // Only applicable to matrix uniforms
};

export enum UniformKind {
  SCALAR_INT,
  SCALAR_FLOAT,
  VECTOR_FLOAT,
  VECTOR_INT,
  MATRIX,
}

export type UniformDataMapping = {
  [UniformKind.SCALAR_INT]: number | number[] | boolean;
  [UniformKind.SCALAR_FLOAT]: number | number[];
  [UniformKind.VECTOR_FLOAT]: number[];
  [UniformKind.VECTOR_INT]: number[];
  [UniformKind.MATRIX]: Float32Array;
};

export type ConcreteUniforms =
  | IntUniform
  | FloatUniform
  | VectorIntUniform
  | VectorFloatUniform
  | MatrixUniform;

export const TRANSFORM_UNIFORM_CONFIG_MAP: {
  [Key in TransformUniformKeys]: {
    data: Float32Array;
    type: UniformKind;
  };
} = {
  uModelViewMatrix: {
    data: Matrix4.identity().toFloatArray(),
    type: UniformKind.MATRIX,
  },
  uNormalMatrix: {
    data: Matrix4.identity().toFloatArray(),
    type: UniformKind.MATRIX,
  },
  uProjectionMatrix: {
    data: Matrix4.identity().toFloatArray(),
    type: UniformKind.MATRIX,
  },
};
