import { Vector } from "../../../math/vector.js";
import Arrow from "./arrow/index.js";
import Circle from "./circle/index.js";

export type GuideProperties = {
  color?: number[];
  scaleVector?: Vector;
  translationVector?: Vector;
  rotationVector?: Vector;
};

export type ArrowHead = "cube" | "cone";

export type GuideIntances = Arrow | Circle;
