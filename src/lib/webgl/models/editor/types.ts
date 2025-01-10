import { Vector } from "../../../math/vector.js";

export type GuideProperties = {
  color?: number[];
  scaleVector?: Vector;
  translationVector?: Vector;
  rotationVector?: Vector;
};

export type ArrowHead = "cube" | "cone";
