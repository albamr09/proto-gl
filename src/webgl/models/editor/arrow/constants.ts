import { Vector } from "../../../../math/vector";
import { GuideProperties } from "../types";

export const DefaultProperties: GuideProperties = {
  color: [0.9, 0.0, 0.0, 1.0],
  scaleVector: new Vector([1, 1, 1]),
  translationVector: new Vector([0, 0, 0]),
  rotationVector: new Vector([0, 0, 0]),
};

export const DEFAULT_HEIGHT = 4;
export const DEFAULT_RADIOUS = 0.5;
export const DEFAULT_N_SEGMENTS = 12;
