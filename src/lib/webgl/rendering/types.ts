import { Vector } from "../../math/vector.js";
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
  type: GLenum; // Data type of each element (e.g., gl.FLOAT, gl.INT)
  stride?: number; // Offset in bytes between consecutive attributes
  offset?: number; // Offset in bytes to the first element
};

export interface InstanceConfiguration {
  pickable?: boolean;
  visible?: boolean;
  renderingMode?: GLenum;
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
