import { Matrix4 } from "../math/matrix.js";
import Program, { Uniforms } from "./program.js";
import {
  Uniform,
  UniformType,
  transformUniformsDefinition,
  TransformUniforms,
} from "./uniforms.js";

export type AttributeDefinition = {
  data: number[];
  size: number;
  type: GLenum;
  stride?: number;
  offset?: number;
};

export type UniformDefinition = {
  data: any;
  type: UniformType;
};

class Instance<A extends readonly string[], U extends readonly string[]> {
  private id?: string;
  private gl: WebGL2RenderingContext;
  private program: Program<A, U>;
  private uniforms?: Uniforms<U, Uniform>;
  private vao!: WebGLVertexArrayObject | null;
  private ibo!: WebGLBuffer | null;
  private len!: number;
  private renderingMode!: GLenum;
  private localTransform: Matrix4;

  /**
   * Creates an object with its own program
   */
  constructor({
    id,
    gl,
    program,
    vertexShaderSource,
    fragmentShaderSource,
    attributes,
    indices,
    uniforms,
    renderingMode,
  }: {
    gl: WebGL2RenderingContext;
    program?: Program<A, U>;
    id?: string;
    vertexShaderSource?: string;
    fragmentShaderSource?: string;
    attributes: {
      [P in A[number]]?: AttributeDefinition;
    };
    indices: number[];
    uniforms?: {
      [P in U[number]]?: UniformDefinition;
    };
    renderingMode?: GLenum;
  }) {
    this.id = id ?? Date.now().toString();
    this.gl = gl;

    // Create program
    if (program) {
      this.program = program;
    } else if (vertexShaderSource && fragmentShaderSource) {
      this.program = new Program(
        gl,
        vertexShaderSource,
        fragmentShaderSource,
        Object.keys(attributes ?? {}) as readonly string[] as A,
        Object.keys(uniforms ?? {}) as readonly string[] as U
      );
    } else {
      throw Error("Could not create the instance");
    }

    this.renderingMode = renderingMode ?? this.gl.TRIANGLES;
    this.localTransform = Matrix4.identity();

    this.setupAttributes({ attributes, indices });
    this.setupUniforms({ uniforms });
  }

  setupAttributes({
    attributes,
    indices,
  }: {
    attributes: {
      [P in A[number]]?: AttributeDefinition;
    };
    indices: number[];
  }) {
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    // Attributes
    for (const attribute of Object.keys(attributes)) {
      const attributeLocation = this.program.getAttribute(attribute);
      const attributeData = attributes[attribute as A[number]];
      if (!attributeData) return;
      const { data, size, type, stride, offset } = attributeData;
      // If attribute location does not exist
      if (attributeLocation < 0) continue;
      const buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(data),
        this.gl.STATIC_DRAW
      );
      this.gl.vertexAttribPointer(
        attributeLocation,
        size,
        type,
        false,
        stride ?? 0,
        offset ?? 0
      );
      this.gl.enableVertexAttribArray(attributeLocation);
    }

    // Indices
    this.ibo = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      this.gl.STATIC_DRAW
    );
    this.len = indices.length;

    // Clean
    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  setupUniforms({
    uniforms,
  }: {
    uniforms?: {
      [P in U[number]]?: UniformDefinition;
    };
  }) {
    // Uniforms
    const mergedUniforms = {
      ...uniforms,
      ...transformUniformsDefinition,
    } as Uniforms<U, UniformDefinition>;
    this.uniforms = (
      Object.keys(mergedUniforms) as (U[number] | TransformUniforms[number])[]
    ).reduce((dict, k) => {
      const uniform = mergedUniforms[k] as UniformDefinition;
      const location = this.program.uniforms[k];
      if (uniform == null || uniform == undefined || !location) return dict;
      dict[k] = new Uniform(k, uniform.type, uniform.data, location);
      return dict;
    }, {} as Uniforms<U, Uniform>);
  }

  updateUniform<T>(
    uniformName: U[number] | TransformUniforms[number],
    value: T
  ) {
    // It if exists update
    const uniform = this.uniforms?.[uniformName];
    if (uniform !== undefined && uniform !== null) {
      uniform.setData(value);
    }
  }

  getUniform(uniformName: U[number] | TransformUniforms[number]) {
    return this.uniforms?.[uniformName];
  }

  setId(id: string) {
    this.id = id;
  }

  getId() {
    return this.id;
  }

  setLocalTransform(localTransform: Matrix4) {
    this.localTransform = localTransform;
  }

  render({ cb = () => {} }: { cb?: (o: Instance<A, U>) => void }) {
    // Use this program instance
    this.program.use();
    // Bind vertices and indices
    this.gl.bindVertexArray(this.vao);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);

    // Callback
    cb(this);

    // Apply local transformation if it exists
    if (this.localTransform) {
      let modelViewMatrix = this.uniforms![
        "uModelViewMatrix"
      ]?.getData() as Matrix4;
      modelViewMatrix = Matrix4.fromFloatArray(
        modelViewMatrix as unknown as Float32Array
      );
      this.uniforms!["uModelViewMatrix"]?.setData(
        this.localTransform.multiply(modelViewMatrix).toFloatArray()
      );
    }

    // Populate uniforms
    for (const uniform of Object.values(this?.uniforms ?? {}) as Uniform[]) {
      if (uniform == null || uniform == undefined) continue;
      uniform.bindUniformForType(this.gl);
    }

    // Draw
    this.gl.drawElements(
      this.renderingMode ?? this.gl.TRIANGLES,
      this.len,
      this.gl.UNSIGNED_SHORT,
      0
    );

    // Unbind
    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }
}

export default Instance;
