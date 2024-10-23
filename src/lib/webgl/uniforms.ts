import { Matrix4 } from "../math/matrix.js";
import { UniformMetadata } from "./instance.js";

export const transformUniforms = [
  "uModelViewMatrix",
  "uNormalMatrix",
  "uProjectionMatrix",
] as const;

export type TransformUniforms = typeof transformUniforms;

export enum UniformType {
  INT,
  FLOAT,
  VECTOR_FLOAT,
  VECTOR_INT,
  MATRIX,
}

export const transformUniformsDefinition: {
  [x in (typeof transformUniforms)[number]]: {
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

export class Uniform {
  private name: string;
  private type: UniformType;
  // TODO: type this
  private data: any;
  private location?: WebGLUniformLocation;
  private size?: number;
  private transpose?: boolean;

  constructor(
    name: string,
    type: UniformType,
    data: any,
    location?: WebGLUniformLocation,
    size?: number,
    transpose?: boolean
  ) {
    this.name = name;
    this.type = type;
    this.data = data;
    this.location = location;
    this.size = size;
    this.transpose = transpose ?? false;
  }

  setLocation(location: WebGLUniformLocation) {
    this.location = location;
  }

  setData(data: any) {
    this.data = data;
  }

  getData() {
    return this.data;
  }

  setMetadata(metadata: UniformMetadata) {
    if (metadata?.size) {
      this.size = metadata.size;
    }
    if (metadata?.transpose) {
      this.transpose = metadata.transpose;
    }
  }

  private bindInt(gl: WebGL2RenderingContext, size: number) {
    if (size == 1) {
      gl.uniform1i(this.location!, this.data);
    } else if (size == 2) {
      gl.uniform2i(this.location!, this.data[0], this.data[1]);
    } else if (size == 3) {
      gl.uniform3i(this.location!, this.data[0], this.data[1], this.data[2]);
    } else if (size == 4) {
      gl.uniform4i(
        this.location!,
        this.data[0],
        this.data[1],
        this.data[2],
        this.data[3]
      );
    }
  }

  private bindFloat(gl: WebGL2RenderingContext, size: number) {
    if (size == 1) {
      gl.uniform1f(this.location!, this.data);
    } else if (size == 2) {
      gl.uniform2f(this.location!, this.data[0], this.data[1]);
    } else if (size == 3) {
      gl.uniform3f(this.location!, this.data[0], this.data[1], this.data[2]);
    } else if (size == 4) {
      gl.uniform4f(
        this.location!,
        this.data[0],
        this.data[1],
        this.data[2],
        this.data[3]
      );
    }
  }

  private bindVectorInt(gl: WebGL2RenderingContext, size: number) {
    if (size == 1) {
      gl.uniform1iv(this.location!, this.data);
    } else if (size == 2) {
      gl.uniform2iv(this.location!, this.data);
    } else if (size == 3) {
      gl.uniform3iv(this.location!, this.data);
    } else if (size == 4) {
      gl.uniform4iv(this.location!, this.data);
    }
  }

  private bindVectorFloat(gl: WebGL2RenderingContext, size: number) {
    if (size == 1) {
      gl.uniform1fv(this.location!, this.data);
    } else if (size == 2) {
      gl.uniform2fv(this.location!, this.data);
    } else if (size == 3) {
      gl.uniform3fv(this.location!, this.data);
    } else if (size == 4) {
      gl.uniform4fv(this.location!, this.data);
    }
  }

  private bindMatrix(gl: WebGL2RenderingContext, size: number) {
    if (size == 4) {
      gl.uniformMatrix2fv(this.location!, this.transpose!, this.data);
    } else if (size == 9) {
      gl.uniformMatrix3fv(this.location!, this.transpose!, this.data);
    } else if (size == 16) {
      gl.uniformMatrix4fv(this.location!, this.transpose!, this.data);
    }
  }

  bindUniformForType(gl: WebGL2RenderingContext) {
    if (!this.location) {
      throw Error(`Uniform ${this.name} does not have a location assigned`);
    }

    switch (this.type) {
      case UniformType.INT:
        this.bindInt(
          gl,
          this.size ?? ((!Array.isArray(this.data) && 1) || this.data.length)
        );
        break;
      case UniformType.FLOAT:
        this.bindFloat(
          gl,
          this.size ?? ((!Array.isArray(this.data) && 1) || this.data.length)
        );
        break;
      case UniformType.VECTOR_INT:
        this.bindVectorInt(gl, this.size ?? this.data.length);
        break;
      case UniformType.VECTOR_FLOAT:
        this.bindVectorFloat(gl, this.size ?? this.data.length);
        break;
      // TODO: add transposition option
      case UniformType.MATRIX:
        this.bindMatrix(gl, this.size ?? this.data.length);
        break;
    }
  }
}
