import { TransformUniforms, transformUniforms } from "./uniforms.js";

export enum PROGRAM_TYPE {
  VERTEX,
  FRAGMENT,
}

type Uniforms<U extends readonly string[]> = {
  [P in TransformUniforms[number] | U[number]]: WebGLUniformLocation | null;
};

type Attributes<A extends readonly string[]> = {
  [P in A[number]]: number;
};

class Program<A extends readonly string[], U extends readonly string[]> {
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private _program: WebGLProgram | null;
  public attributes: Attributes<A>;
  public uniforms: Uniforms<U>;

  /**
   * Creates a program that is made up of a vertex shader and a fragment shader
   */

  constructor(
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string,
    attributes?: A,
    uniforms?: U
  ) {
    this.gl = gl;
    this._program = this._compileProgram(
      gl,
      vertexShaderSource,
      fragmentShaderSource
    );

    // Use this program instance
    gl.useProgram(this._program);

    this.attributes = this._loadAttributes(attributes);
    this.uniforms = this._loadUniforms(uniforms);
  }

  /**
   * Tells WebGL to use this program to render
   */
  use() {
    this.gl.useProgram(this._program);
  }

  /**
   * Returns the location of the attribute
   */
  getAttribute(attributeName: A[number]) {
    return this.attributes[attributeName];
  }

  /**
   * Returns the location of the attribute
   */
  getUniform(uniformName: TransformUniforms[number] & U[number]) {
    return this.uniforms[uniformName];
  }

  /**
   * Stores the location of each attribute for the program
   **/
  private _loadAttributes(attributeNames?: A) {
    const attributes = {} as typeof this.attributes;
    if (!this._program || !attributeNames) {
      return attributes;
    }
    for (const name of attributeNames) {
      const location = this.gl.getAttribLocation(this._program, name);
      if (location === -1) {
        throw new Error(`Attribute ${name} not found in the shader program`);
      }
      attributes[name as A[number]] = location;
    }
    return attributes;
  }

  /**
   * Stores the location of each uniform for the program
   **/
  private _loadUniforms(uniformNames?: U) {
    const uniforms = {} as typeof this.uniforms;
    if (!this._program) {
      return uniforms;
    }
    for (const name of [...(uniformNames ?? []), ...transformUniforms]) {
      const location = this.gl.getUniformLocation(this._program, name);
      if (location === -1) {
        throw new Error(`Uniform ${name} not found in the shader program`);
      }
      uniforms[name] = location;
    }
    return uniforms;
  }

  /**
   * Compiles the pogram
   */
  private _compileProgram(
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string
  ) {
    // Obtain the shaders
    const vertexShader = this._compileShader(
      gl,
      PROGRAM_TYPE.VERTEX,
      vertexShaderSource
    );
    const fragmentShader = this._compileShader(
      gl,
      PROGRAM_TYPE.FRAGMENT,
      fragmentShaderSource
    );

    // Create a program
    const program = gl.createProgram();
    if (!program || !vertexShader || !fragmentShader) {
      throw "Could no create program";
    }

    // Attach the shaders to this program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw "Could not initialize shaders";
    }

    return program;
  }

  /**
   * Compiles the vertex or fragment shader
   */
  private _compileShader(
    gl: WebGL2RenderingContext,
    type: PROGRAM_TYPE,
    source: string
  ) {
    let shader: WebGLShader | null;
    if (type === PROGRAM_TYPE.VERTEX) {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    }

    if (!shader) return;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }
}

export default Program;
