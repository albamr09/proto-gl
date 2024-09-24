export const linearInterpolation = (
  points: [number, number, number][],
  nSteps: number
): [number, number, number][] => {
  if (points.length < 2) {
    console.error("At least two points are required for interpolation.");
    return [];
  }

  const nStepPerPoint = nSteps / (points.length - 1);
  return Array.from({ length: points.length - 1 }).flatMap((_, i) => {
    const [x1, y1, z1] = points[i];
    const [x2, y2, z2] = points[i + 1];

    const dx = (x2 - x1) / nStepPerPoint;
    const dy = (y2 - y1) / nStepPerPoint;
    const dz = (z2 - z1) / nStepPerPoint;

    return Array.from({ length: nStepPerPoint }).map((_, i) => {
      return [x1 + dx * i, y1 + dy * i, z1 + dz * i] as [
        number,
        number,
        number
      ];
    });
  });
};

// Reference: https://en.wikipedia.org/wiki/Lagrange_polynomial
export const lagrangeInterpolation = (
  points: [number, number, number][],
  nSteps: number
) => {
  const nPoints = points.length;
  if (nPoints < 2) {
    console.error("Cannot approximate polynomial for fewer than two points");
    return;
  }

  const xPoints = points.map((p) => p[0]);
  const yPoints = points.map((p) => p[1]);
  const zPoints = points.map((p) => p[2]);
  const stepSizeX = (xPoints[nPoints - 1] - xPoints[0]) / nSteps;
  const stepSizeY = (yPoints[nPoints - 1] - yPoints[0]) / nSteps;
  const stepSizeZ = (zPoints[nPoints - 1] - zPoints[0]) / nSteps;

  // Compute basis polynomials
  const L = (x: number, j: number, points: number[]) => {
    return Array.from({ length: j - 1 }).reduce((acc: number, _, m) => {
      if (m !== j) {
        return (acc * (x - points[m])) / (points[j] - points[m]);
      }
      return acc;
    }, 1);
  };

  // Function to interpolate a single coordinate
  const interpolateCoordinate = (x: number, points: number[]) => {
    return points.reduce((sum, _, j) => {
      return sum + points[j] * L(x, j, xPoints);
    }, 0);
  };

  return Array.from({ length: nSteps }).reduce(
    (acc: [number, number, number][], _, i) => {
      const x = xPoints[0] + stepSizeX * i;
      const y = yPoints[0] + stepSizeY * i;
      const z = zPoints[0] + stepSizeZ * i;

      const interpolatedX = interpolateCoordinate(x, xPoints);
      const interpolatedY = interpolateCoordinate(y, yPoints);
      const interpolatedZ = interpolateCoordinate(z, zPoints);

      //acc.push([interpolatedX, interpolatedY, interpolatedZ]);
      acc.push([x, y, z]);
      return acc;
    },
    []
  );
};
