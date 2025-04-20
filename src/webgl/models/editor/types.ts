import { Vector } from "../../../math/vector";
import Arrow from "./arrow/index";
import Circle from "./circle/index";

export type GuideProperties = {
  color?: number[];
  scaleVector?: Vector;
  translationVector?: Vector;
  rotationVector?: Vector;
};

export type ArrowHead = "cube" | "cone";

export type GuideIntances = Arrow | Circle;
