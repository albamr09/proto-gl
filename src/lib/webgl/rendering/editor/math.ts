import { Vector } from "../../../math/vector.js";

export const computeObjectDragTranslation = (
  dx: number,
  dy: number,
  cameraRotationVector: Vector,
  motionFactor: number
) => {
  const upVector = new Vector([0, dy, 0]);
  const rightVector = new Vector([dx, 0, 0]);
  const { rotatedUpVector, rotatedRightVector } = rotateUpRightVectors(
    upVector,
    rightVector,
    cameraRotationVector
  );
  const newTranslationValues = rotatedUpVector.elements.map((_, i) => {
    return (rotatedUpVector.at(i) + rotatedRightVector.at(i)) * motionFactor;
  });
  return new Vector(newTranslationValues);
};

export const rotateUpRightVectors = (
  upVector: Vector,
  rightVector: Vector,
  rotationVector: Vector
) => {
  const rotatedUpVector = upVector.rotateVecDeg(rotationVector);
  const rotatedRightVector = rightVector.rotateVecDeg(rotationVector);

  return { rotatedUpVector, rotatedRightVector };
};

export const computeDragFctor = (x: number) => {
  return 0.00122419 * Math.pow(x, 2) - 0.00447683 * x + 0.015259;
};
