import { uuidv4 } from "../utils.js";
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

export interface Configuration {
  pickable?: boolean;
  visible?: boolean;
  renderingMode?: GLenum;
}

const defaultConfiguration: Configuration = {
  pickable: true,
  visible: true,
  // TODO: this kinda sucks, we are setting a
  // random number instead of the actual default
  renderingMode: 0,
};

class Instance<A extends readonly string[], U extends readonly string[] = []> {
  private id?: string;
  private gl: WebGL2RenderingContext;
  private program: Program<A, U>;
  private uniforms?: Uniforms<U, Uniform>;
  private vao!: WebGLVertexArrayObject | null;
  private ibo!: WebGLBuffer | null;
  private size!: number;
  private configuration!: Configuration;

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
    size,
    configuration,
  }: {
    gl: WebGL2RenderingContext;
    program?: Program<A, U>;
    id?: string;
    vertexShaderSource?: string;
    fragmentShaderSource?: string;
    attributes: {
      [P in A[number]]?: AttributeDefinition;
    };
    indices?: number[];
    uniforms?: {
      [P in U[number]]?: UniformDefinition;
    };
    size?: number;
    configuration?: Configuration;
  }) {
    this.id = id ?? uuidv4();
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

    this.configuration = {
      ...defaultConfiguration,
      renderingMode: this.gl.TRIANGLES,
      ...configuration,
    };

    this.setupAttributes({ attributes, indices, size });
    this.setupUniforms({ uniforms });
  }

  setId(id: string) {
    this.id = id;
  }

  getId() {
    return this.id;
  }

  /**
   * Set the data for a given attribute and associates the attribute
   * with the instances VAO
   */
  setAttributeData(
    attributeName: A[number],
    attribute: AttributeDefinition,
    bind = false
  ) {
    const { data, size, type, offset, stride } = attribute;
    const attributeLocation = this.program.getAttribute(attributeName);
    if (attributeLocation < 0) {
      console.error(`Attribute "${attributeName}" does not exist`);
      return;
    }

    // Bind the VAO
    if (bind) {
      this.gl.bindVertexArray(this.vao);
    }

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

    // Clean up
    if (bind) {
      this.gl.bindVertexArray(null);
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  /**
   * Initializes all attributes and indices. It also enables the attributes.
   */
  setupAttributes({
    attributes,
    indices,
    size,
  }: {
    attributes: {
      [P in A[number]]?: AttributeDefinition;
    };
    indices?: number[];
    size?: number;
  }) {
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    // Attributes
    for (const attribute of Object.keys(attributes)) {
      this.setAttributeData(attribute, attributes[attribute as A[number]]!);
    }

    // Indices
    if (indices) {
      this.ibo = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
      this.gl.bufferData(
        this.gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        this.gl.STATIC_DRAW
      );
      this.size = indices.length;
    } else {
      // If we do not have indices, then we use the size supplied by the user
      if (!size) {
        throw Error("No indices or size for the data were provided");
      }
      this.size = size;
    }

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

  setGLParameters(fn: (gl: WebGL2RenderingContext) => void) {
    fn(this.gl);
    this.program.setGLParameters(fn);
  }

  // TODO: type this?
  setConfigurationValue(key: keyof Configuration, value: any) {
    this.configuration[key] = value;
  }

  render({
    cb = () => {},
  }: {
    cb?: (o: Instance<A, U>, gl: WebGL2RenderingContext) => void;
  }) {
    if (!this.configuration.visible) return;
    // Use this program instance
    this.program.use();
    // Bind vertices and indices
    this.gl.bindVertexArray(this.vao);
    if (this.ibo) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    }

    // Callback
    cb(this, this.gl);

    // Populate uniforms
    for (const uniform of Object.values(this?.uniforms ?? {}) as Uniform[]) {
      if (uniform == null || uniform == undefined) continue;
      uniform.bindUniformForType(this.gl);
    }

    // If we have IBO defined draw using index information
    if (this.ibo) {
      this.gl.drawElements(
        this.configuration.renderingMode!,
        this.size,
        this.gl.UNSIGNED_SHORT,
        0
      );
    } else {
      // Else draw using vertex order directly
      this.gl.drawArrays(this.configuration.renderingMode!, 0, this.size);
    }

    // Unbind
    this.gl.bindVertexArray(null);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }
}

export default Instance;
