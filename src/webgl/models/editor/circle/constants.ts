import { Vector } from "../../../../math/vector";
import { GuideProperties } from "../types";

export const DefaultProperties: GuideProperties = {
  color: [0.9, 0.0, 0.0, 1.0],
  scaleVector: new Vector([1, 1, 1]),
  translationVector: new Vector([0, 0, 0]),
  rotationVector: new Vector([0, 0, 0]),
};
