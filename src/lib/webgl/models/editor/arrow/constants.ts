import { Vector } from "../../../../math/vector.js";
import { ArrowPorperties } from "./types";

export const DefaultProperties: ArrowPorperties = {
  color: [0.9, 0.0, 0.0, 1.0],
  scaleVector: new Vector([1, 1, 1]),
  translationVector: new Vector([0, 0, 0]),
  rotationVector: new Vector([0, 0, 0]),
};
