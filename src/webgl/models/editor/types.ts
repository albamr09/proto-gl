import { Vector } from "@proto-gl/math/vector";
import Arrow from "@proto-gl/webgl/models/editor/arrow/index";
import Circle from "@proto-gl/webgl/models/editor/circle/index";

export type GuideProperties = {
  color?: number[];
  scaleVector?: Vector;
  translationVector?: Vector;
  rotationVector?: Vector;
};

export type ArrowHead = "cube" | "cone";

export type GuideIntances = Arrow | Circle;
