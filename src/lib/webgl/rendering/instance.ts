import { Matrix4 } from "../../math/matrix.js";
import { Vector } from "../../math/vector.js";
import { uuidv4 } from "../../utils.js";
import Program from "../core/program.js";
import TextureFactory from "../core/texture/factory.js";
import Texture from "../core/texture/texture.js";
import { TextureDefinition, TextureParameters } from "../core/texture/types.js";
import { Uniforms } from "../core/types.js";
import { UniformFactory } from "../core/uniform/factory.js";
import {
  ConcreteUniforms,
  TRANSFORM_UNIFORM_CONFIG_MAP,
  TransformUniformKeys,
  UniformConfig,
  UniformDataMapping,
  UniformKind,
} from "../core/uniform/types.js";
import {
  AttributeConfig,
  InstanceClickPayload,
  InstanceConfiguration,
  InstanceDragEndPayload,
  InstanceDragPayload,
  InstanceEventTypes,
  InstanceProps,
  InstanceTransformationProperties,
  UniformDefinition,
} from "./types.js";

const defaultConfiguration: InstanceConfiguration = {
  pickable: true,
  visible: true,
  // TODO: this kinda sucks, we are setting a
  // random number instead of the actual default
  renderingMode: 0,
};

class Instance<
  A extends readonly string[],
  U extends readonly string[] = []
> extends EventTarget {
  private id?: string;
  private gl: WebGL2RenderingContext;
  private program: Program<A, U>;
  private uniforms?: Uniforms<U, ConcreteUniforms>;
  private attributes?: {
    [P in A[number]]?: AttributeConfig;
  };
  private vao!: WebGLVertexArrayObject | null;
  private ibo!: WebGLBuffer | null;
  private size!: number;
  private configuration!: InstanceConfiguration;
  private textures?: Map<Number, Texture>;
  private transformationProperties?: InstanceTransformationProperties;
  public onClick?: (o: InstanceClickPayload<A, U>) => void;
  public onDrag?: ({ instance, dx, dy }: InstanceDragPayload<A, U>) => void;
  public onDragFinish?: (o: InstanceDragEndPayload<A, U>) => void;

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
    textures,
    transformationProperties,
    onClick,
    onDrag,
    onDragFinish,
  }: InstanceProps<A, U>) {
    super();
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
        this.getAttributeNames({ attributes }),
        this.getUniformNames({ uniforms, textures })
      );
    } else {
      throw Error("Could not create the instance");
    }

    this.configuration = {
      ...defaultConfiguration,
      renderingMode: this.gl.TRIANGLES,
      ...configuration,
    };

    this.loadAttributes({ attributes: attributes ?? {}, indices, size });
    this.loadUniforms({ uniforms, textures });

    if (textures) {
      this.textures = new Map();
      textures.forEach((texture) => this.loadTexture(texture));
    }

    this.transformationProperties = transformationProperties;
    this.onClick = onClick;
    this.onDrag = onDrag;
    this.onDragFinish = onDragFinish;
  }

  private getAttributeNames = ({
    attributes,
  }: {
    attributes?: InstanceProps<A, U>["attributes"];
  }) => {
    return Object.keys(attributes ?? {}) as readonly string[] as A;
  };

  private getUniformNames = ({
    uniforms,
    textures,
  }: {
    uniforms?: InstanceProps<A, U>["uniforms"];
    textures?: InstanceProps<A, U>["textures"];
  }) => {
    return [
      ...Object.keys(uniforms ?? {}),
      ...(textures?.map((texture) => texture?.uniform).filter(Boolean) ?? []),
    ] as readonly string[] as U;
  };

  public setId(id: string) {
    this.id = id;
  }

  public getId() {
    return this.id;
  }

  private loadTexture(texture: TextureDefinition) {
    const newTexture = TextureFactory.create({
      gl: this.gl,
      ...texture,
    });
    this.textures?.set(texture.index, newTexture);
  }

  /**
   * Set the data for a given attribute and associates the attribute
   * with the instances VAO
   */
  public setAttributeData(
    attributeName: A[number],
    attribute: AttributeConfig,
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
  private loadAttributes({
    attributes,
    indices,
    size,
  }: {
    attributes: {
      [P in A[number]]?: AttributeConfig;
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

    this.attributes = { ...attributes };
  }

  private loadUniforms({
    uniforms,
    textures,
  }: {
    uniforms?: InstanceProps<A, U>["uniforms"];
    textures?: InstanceProps<A, U>["textures"];
  }) {
    // Uniforms
    const mergedUniforms = {
      ...uniforms,
      ...TRANSFORM_UNIFORM_CONFIG_MAP,
    } as Uniforms<U, UniformDefinition>;
    this.uniforms = (
      Object.keys(mergedUniforms) as (
        | U[number]
        | TransformUniformKeys[number]
      )[]
    ).reduce((dict, uniformName) => {
      const uniform = mergedUniforms[uniformName] as UniformDefinition;
      const location = this.program.getUniformLocation(uniformName);
      if (uniform == null || uniform == undefined || !location) return dict;
      dict[uniformName] = UniformFactory.createUniform(
        uniformName,
        uniform.type,
        uniform.data,
        location,
        uniform?.size,
        uniform?.transpose
      );
      return dict;
    }, {} as Uniforms<U, ConcreteUniforms>);

    this.uniforms = {
      ...this.uniforms,
      ...this.generateTextureUniforms(textures),
    };
  }

  private generateTextureUniforms(textures: InstanceProps<A, U>["textures"]) {
    return textures?.reduce((dict, texture) => {
      if (!texture?.uniform) return dict;
      const uniformName = texture?.uniform as U[number];
      const location = this.program.getUniformLocation(uniformName);
      if (!location) return dict;
      dict[uniformName] = UniformFactory.createUniform(
        texture.uniform,
        UniformKind.SCALAR_INT,
        texture.index,
        location
      );
      return dict;
    }, {} as Uniforms<U, ConcreteUniforms>);
  }

  public updateUniform(
    uniformName: U[number] | TransformUniformKeys[number],
    value: UniformDataMapping[UniformKind],
    metadata?: UniformConfig
  ) {
    // It if exists update
    const uniform = this.uniforms?.[uniformName];
    if (uniform !== undefined && uniform !== null) {
      // Update data
      uniform.setData(value);
      // Update metadata
      metadata && uniform.setMetadata(metadata);
    }
  }

  public getUniform(uniformName: U[number] | TransformUniformKeys[number]) {
    return this.uniforms?.[uniformName];
  }

  public setGLParameters(fn: (gl: WebGL2RenderingContext) => void) {
    fn(this.gl);
    this.program.setGLParameters(fn);
  }

  // TODO: type this?
  public setConfigurationValue(key: keyof InstanceConfiguration, value: any) {
    this.configuration[key] = value;
  }

  public updateTexture({
    index,
    source,
    data,
    faces,
    configuration,
  }: TextureParameters) {
    const textureToUpdate = this.textures?.get(index);
    if (!textureToUpdate) {
      console.warn("No texture is attached to the instance");
      return;
    }
    textureToUpdate.updateImage({ source, data, faces });

    if (configuration) {
      textureToUpdate.updateConfiguration(configuration);
    }

    this.textures?.set(index, textureToUpdate);
  }

  public render({
    cb = () => {},
    depthTest = true,
  }: {
    cb?: (o: Instance<A, U>, gl: WebGL2RenderingContext) => void;
    depthTest?: boolean;
  }) {
    if (!this.configuration.visible) return;
    const hadDepthTest = this.gl.getParameter(this.gl.DEPTH_TEST);
    const shouldChangeDepthTest = depthTest !== hadDepthTest;
    if (shouldChangeDepthTest) {
      this.gl[depthTest ? "enable" : "disable"](this.gl.DEPTH_TEST);
    }
    // Use this program instance
    this.program.use();
    // Bind vertices and indices
    this.gl.bindVertexArray(this.vao);
    if (this.ibo) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    }

    // Textures
    this.textures?.forEach((texture) => {
      texture.activate();
    });

    // Callback
    cb(this, this.gl);

    // Populate uniforms
    for (const uniform of Object.values(
      this?.uniforms ?? {}
    ) as ConcreteUniforms[]) {
      if (uniform == null || uniform == undefined) continue;
      uniform.bind(this.gl);
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

    if (shouldChangeDepthTest) {
      this.gl[hadDepthTest ? "enable" : "disable"](this.gl.DEPTH_TEST);
    }
  }

  public triggerOnClick() {
    const payload = this;
    this.onClick && this.onClick(payload);
    this.dispatchEvent(new CustomEvent("click", { detail: payload }));
  }

  public triggerOnDrag(
    dx: number,
    dy: number,
    cameraRotationVector: Vector,
    cameraDistance: number
  ) {
    const payload = {
      instance: this,
      dx,
      dy,
      cameraRotationVector,
      cameraDistance,
    };
    this.onDrag && this.onDrag(payload);
    this.dispatchEvent(new CustomEvent("drag", { detail: payload }));
  }

  public triggerOnDragFinish() {
    const payload = this;
    this.onDragFinish && this.onDragFinish(payload);
    this.dispatchEvent(new CustomEvent("dragend", { detail: payload }));
  }

  public override addEventListener(
    type: InstanceEventTypes,
    callback: EventListenerOrEventListenerObject | null
  ): void {
    super.addEventListener(type, callback);
  }

  public override removeEventListener(
    type: InstanceEventTypes,
    callback: EventListenerOrEventListenerObject | null
  ): void {
    super.removeEventListener(type, callback);
  }

  public getTransformationProperties() {
    return this.transformationProperties;
  }

  public getAttribute(name: A[number]) {
    return this.attributes?.[name]?.data;
  }

  public updateTransformationMatrices({
    modelViewMatrix,
    normalMatrix,
    projectionMatrix,
  }: {
    modelViewMatrix: Matrix4;
    normalMatrix: Matrix4;
    projectionMatrix: Matrix4;
  }) {
    this.updateUniform("uModelViewMatrix", modelViewMatrix.toFloatArray());
    this.updateUniform("uNormalMatrix", normalMatrix.toFloatArray());
    this.updateUniform("uProjectionMatrix", projectionMatrix.toFloatArray());
  }
}

export default Instance;
