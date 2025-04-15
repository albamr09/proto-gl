import { Vector } from "../../math/vector.js";
import Program from "../core/program.js";
import { TextureDefinition } from "../core/texture/types.js";
import {
  UniformConfig,
  UniformDataMapping,
  UniformKind,
} from "../core/uniform/types.js";
import Instance from "./instance.js";

export type UniformDefinition<K extends UniformKind = UniformKind> =
  UniformConfig & {
    type: K;
    data: UniformDataMapping[K];
  };

export type AttributeConfig = {
  data: number[];
  size: number;
  type:
    | WebGL2RenderingContext["BYTE"]
    | WebGL2RenderingContext["SHORT"]
    | WebGL2RenderingContext["UNSIGNED_BYTE"]
    | WebGL2RenderingContext["UNSIGNED_SHORT"]
    | WebGL2RenderingContext["FLOAT"]
    // Only for WebGL2
    | WebGL2RenderingContext["HALF_FLOAT"]
    | WebGL2RenderingContext["INT"]
    | WebGL2RenderingContext["UNSIGNED_INT"]
    | WebGL2RenderingContext["INT_2_10_10_10_REV"]
    | WebGL2RenderingContext["UNSIGNED_INT_2_10_10_10_REV"];
  stride?: number; // Offset in bytes between consecutive attributes
  offset?: number; // Offset in bytes to the first element
};

export interface InstanceConfiguration {
  pickable?: boolean;
  visible?: boolean;
  renderingMode?:
    | WebGL2RenderingContext["POINTS"]
    | WebGL2RenderingContext["LINE_STRIP"]
    | WebGL2RenderingContext["LINE_LOOP"]
    | WebGL2RenderingContext["LINES"]
    | WebGL2RenderingContext["TRIANGLE_STRIP"]
    | WebGL2RenderingContext["TRIANGLE_FAN"]
    | WebGL2RenderingContext["TRIANGLES"];
}

export interface InstanceProps<
  A extends readonly string[],
  U extends readonly string[]
> {
  gl: WebGL2RenderingContext;
  program?: Program<A, U>;
  id?: string;
  vertexShaderSource?: string;
  fragmentShaderSource?: string;
  attributes?: {
    [P in A[number]]?: AttributeConfig;
  };
  indices?: number[];
  uniforms?: {
    [P in U[number]]?: UniformDefinition;
  };
  size?: number;
  configuration?: InstanceConfiguration;
  // TODO: textures should have uniforms attached to it, instead of having to redefine them
  textures?: TextureDefinition[];
  transformationProperties?: InstanceTransformationProperties;
  onClick?: (o: InstanceClickPayload<A, U>) => void;
  onDrag?: ({ instance, dx, dy }: InstanceDragPayload<A, U>) => void;
  onDragFinish?: (o: InstanceDragEndPayload<A, U>) => void;
}

export type InstanceDragPayload<
  A extends readonly string[],
  U extends readonly string[]
> = {
  instance: Instance<A, U>;
  dx: number;
  dy: number;
  cameraRotationVector: Vector;
  cameraDistance: number;
};

export type InstanceClickPayload<
  A extends readonly string[],
  U extends readonly string[]
> = Instance<A, U>;

export type InstanceDragEndPayload<
  A extends readonly string[],
  U extends readonly string[]
> = Instance<A, U>;

export type InstanceAddedPayload<
  A extends readonly string[],
  U extends readonly string[]
> = Instance<A, U>;

export type InstanceRemovedPayload<
  A extends readonly string[],
  U extends readonly string[]
> = Instance<A, U>;

export type SceneEventTypes = "render" | "instanceadded" | "instanceremoved";

export type InstanceEventTypes = "click" | "drag" | "dragend";

export type InstanceTransformationProperties = {
  scaleVector?: Vector;
  translationVector?: Vector;
  rotationVector?: Vector;
};

export type SceneRenderOptions = {
  cb?: (o: Instance<any, any>) => void;
  clear?: boolean;
  offscreen?: boolean;
};
