import { UniformDataMap, UniformType, UniformTypes } from "../types.js";
import {
  FloatUniform,
  IntUniform,
  MatrixUniform,
  VectorFloatUniform,
  VectorIntUniform,
} from "./uniforms.js";

export class UniformFactory {
  static createUniform(
    name: string,
    type: UniformType,
    data: UniformDataMap[UniformType],
    location?: WebGLUniformLocation,
    size?: number,
    transpose?: boolean
  ): UniformTypes {
    switch (type) {
      case UniformType.INT:
        return new IntUniform(
          name,
          data as UniformDataMap[UniformType.INT],
          location,
          size
        );
      case UniformType.FLOAT:
        return new FloatUniform(
          name,
          data as UniformDataMap[UniformType.FLOAT],
          location,
          size
        );
      case UniformType.VECTOR_INT:
        return new VectorIntUniform(
          name,
          data as UniformDataMap[UniformType.VECTOR_INT],
          location,
          size
        );
      case UniformType.VECTOR_FLOAT:
        return new VectorFloatUniform(
          name,
          data as UniformDataMap[UniformType.VECTOR_FLOAT],
          location,
          size
        );
      case UniformType.MATRIX:
        return new MatrixUniform(
          name,
          data as UniformDataMap[UniformType.MATRIX],
          location,
          size,
          transpose ?? false
        );
      default:
        throw new Error(`Unsupported UniformType: ${type}`);
    }
  }
}
