import { UniformConfig, UniformDataMapping, UniformKind } from "./types.js";

abstract class Uniform<T extends UniformKind> {
  protected name: string;
  protected data: UniformDataMapping[T];
  protected location?: WebGLUniformLocation;
  protected size?: number;

  constructor(
    name: string,
    data: UniformDataMapping[T],
    location?: WebGLUniformLocation,
    size?: number
  ) {
    this.name = name;
    this.data = data;
    this.location = location;
    this.size =
      size ??
      (((Array.isArray(data) || data instanceof Float32Array) && data.length) ||
        1);
  }

  getLocation() {
    return this.location;
  }

  // TODO: Get data should know the type
  getData() {
    return this.data;
  }

  setLocation(location: WebGLUniformLocation) {
    this.location = location;
  }

  // TODO: type
  setData(data: any) {
    this.data = data;
  }

  setMetadata(metadata: UniformConfig) {
    if (metadata?.size) {
      this.size = metadata.size;
    }
  }

  abstract bind(gl: WebGL2RenderingContext): void;
}

export class IntUniform extends Uniform<UniformKind.SCALAR_INT> {
  bind(gl: WebGL2RenderingContext) {
    if (!this.location) {
      throw new Error(`Uniform ${this.name} does not have a location assigned`);
    }
    if (this.size == 1) {
      gl.uniform1i(this.location!, this.data as number);
    } else {
      this.data = this.data as number[];
      if (this.size == 2) {
        gl.uniform2i(this.location!, this.data[0], this.data[1]);
      } else if (this.size == 3) {
        gl.uniform3i(this.location!, this.data[0], this.data[1], this.data[2]);
      } else if (this.size == 4) {
        gl.uniform4i(
          this.location!,
          this.data[0],
          this.data[1],
          this.data[2],
          this.data[3]
        );
      }
    }
  }
}

export class FloatUniform extends Uniform<UniformKind.SCALAR_FLOAT> {
  bind(gl: WebGL2RenderingContext) {
    if (!this.location) {
      throw new Error(`Uniform ${this.name} does not have a location assigned`);
    }
    if (this.size == 1) {
      gl.uniform1f(this.location!, this.data as number);
    } else {
      this.data = this.data as number[];
      if (this.size == 2) {
        gl.uniform2f(this.location!, this.data[0], this.data[1]);
      } else if (this.size == 3) {
        gl.uniform3f(this.location!, this.data[0], this.data[1], this.data[2]);
      } else if (this.size == 4) {
        gl.uniform4f(
          this.location!,
          this.data[0],
          this.data[1],
          this.data[2],
          this.data[3]
        );
      }
    }
  }
}

export class VectorIntUniform extends Uniform<UniformKind.VECTOR_INT> {
  bind(gl: WebGL2RenderingContext) {
    if (!this.location) {
      throw new Error(`Uniform ${this.name} does not have a location assigned`);
    }
    if (this.size == 1) {
      gl.uniform1iv(this.location!, this.data);
    } else if (this.size == 2) {
      gl.uniform2iv(this.location!, this.data);
    } else if (this.size == 3) {
      gl.uniform3iv(this.location!, this.data);
    } else if (this.size == 4) {
      gl.uniform4iv(this.location!, this.data);
    }
  }
}

export class VectorFloatUniform extends Uniform<UniformKind.VECTOR_FLOAT> {
  bind(gl: WebGL2RenderingContext) {
    if (!this.location) {
      throw new Error(`Uniform ${this.name} does not have a location assigned`);
    }
    if (this.size == 1) {
      gl.uniform1fv(this.location!, this.data);
    } else if (this.size == 2) {
      gl.uniform2fv(this.location!, this.data);
    } else if (this.size == 3) {
      gl.uniform3fv(this.location!, this.data);
    } else if (this.size == 4) {
      gl.uniform4fv(this.location!, this.data);
    }
  }
}

export class MatrixUniform extends Uniform<UniformKind.MATRIX> {
  private transpose: boolean;

  constructor(
    name: string,
    data: Float32Array,
    location?: WebGLUniformLocation,
    size?: number,
    transpose = false
  ) {
    super(name, data, location, size);
    this.transpose = transpose;
  }

  setMetadata(metadata: UniformConfig) {
    if (metadata?.size) {
      this.size = metadata.size;
    }
    if (metadata?.transpose) {
      this.transpose = metadata.transpose;
    }
  }

  bind(gl: WebGL2RenderingContext) {
    if (!this.location) {
      throw new Error(`Uniform ${this.name} does not have a location assigned`);
    }
    if (this.size === 4) {
      gl.uniformMatrix2fv(this.location, this.transpose, this.data);
    } else if (this.size === 9) {
      gl.uniformMatrix3fv(this.location, this.transpose, this.data);
    } else if (this.size === 16) {
      gl.uniformMatrix4fv(this.location, this.transpose, this.data);
    } else {
      throw new Error(`Unsupported matrix size for ${this.name}: ${this.size}`);
    }
  }
}
