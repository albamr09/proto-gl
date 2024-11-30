import {
  UniformConfig,
  UniformDataMapping,
  UniformKind,
} from "../core/uniform/types.js";

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
