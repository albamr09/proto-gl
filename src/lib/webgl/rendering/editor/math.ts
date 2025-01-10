import { Vector } from "../../../math/vector.js";

export const computeDragVector = (
  dx: number,
  dy: number,
  cameraRotationVector: Vector,
  motionFactor: number
) => {
  const upVector = new Vector([0, dy, 0]);
  const rightVector = new Vector([dx, 0, 0]);

  const rotatedUpVector = upVector.rotateVecDeg(cameraRotationVector);
  const rotatedRightVector = rightVector.rotateVecDeg(cameraRotationVector);

  const combinedVector = rotatedUpVector.elements.map((_, i) => {
    return (rotatedUpVector.at(i) + rotatedRightVector.at(i)) * motionFactor;
  });
  return new Vector(combinedVector);
};

// TODO: fix this
export const computeMotionFactorForZoom = (distance: number) => {
  return 0.00447683 * distance + 0.015259;
};
