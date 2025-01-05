import { Vector } from "../../../../math/vector.js";

export type ArrowPorperties = {
  color?: number[];
  scaleVector?: Vector;
  translationVector?: Vector;
  rotationVector?: Vector;
};

export type ArrowHead = "cube" | "cone";
