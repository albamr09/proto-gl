export const linearInterpolation = (
  p1: [number, number, number],
  p2: [number, number, number],
  nSteps: number
): [number, number, number][] => {
  const [x1, y1, z1] = p1;
  const [x2, y2, z2] = p2;
  const dx = (x2 - x1) / nSteps;
  const dy = (y2 - y1) / nSteps;
  const dz = (z2 - z1) / nSteps;

  return Array.from({ length: nSteps }).map((_, i) => {
    return [x1 + dx * i, y1 + dy * i, z1 + dz * i];
  });
};

// Reference: https://mathweb.ucsd.edu/~mlicht/wina2021/pdf/lecture13.pdf
export const lagrangeInterpolation = (
  points: [number, number, number][],
  nSteps: number
) => {
  const nPoints = points.length;
  if (nPoints == 1) {
    console.error("Cannot approximate polynomial for only one point");
    return;
  }

  const L = (x: number, points: number[], x_i: number) => {
    return points.reduce((acc, v) => {
      return (acc * (x - v)) / (x_i - v);
    }, 1);
  };

  const xPoints = points.map((p) => p[0]);
  const yPoints = points.map((p) => p[1]);
  const zPoints = points.map((p) => p[2]);
  return points.map((point, i) => {
    L(0, xPoints.slice(i, nPoints), point[0]);
    L(0, yPoints.slice(i, nPoints), point[1]);
    L(0, zPoints.slice(i, nPoints), point[2]);
  });
};
