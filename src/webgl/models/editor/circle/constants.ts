import { Vector } from "@proto-gl/math/vector";
import { GuideProperties } from "@proto-gl/webgl/models/editor/types";

export const DefaultProperties: GuideProperties = {
  color: [0.9, 0.0, 0.0, 1.0],
  scaleVector: new Vector([1, 1, 1]),
  translationVector: new Vector([0, 0, 0]),
  rotationVector: new Vector([0, 0, 0]),
};
