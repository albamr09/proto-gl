import { TransformUniformKeys } from "./uniform/types.js";

export enum ProgramType {
  VERTEX_SHADER,
  FRAGMENT_SHADER,
}

export type Uniforms<U extends readonly string[], T> = {
  [Key in TransformUniformKeys | U[number]]: T | null;
};

export type Attributes<A extends readonly string[]> = {
  [Key in A[number]]: number;
};
