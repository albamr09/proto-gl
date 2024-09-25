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

// Reference: https://pythonnumericalmethods.studentorg.berkeley.edu/notebooks/chapter17.04-Lagrange-Polynomial-Interpolation.html
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
  console.log(xPoints, zPoints);

  // Compute basis polynomials
  const P = (x: number, i: number, xPoints: number[]) => {
    return points.reduce((prod, _, j) => {
      if (i !== j) {
        return (prod * (x - xPoints[j])) / (xPoints[i] - xPoints[j]);
      }
      return prod;
    }, 1);
  };

  // Interpolation function as a linear combination of the basis polynomials
  const L = (x: number, yPoints: number[], xPoints: number[]) => {
    return points.reduce((sum, _, i) => {
      return sum + yPoints[i] * P(x, i, xPoints);
    }, 0);
  };

  const f = (x: number) => {
    return (
      2.96547e-4 * Math.pow(x, 4) +
      -1.4458e-2 * Math.pow(x, 3) +
      -2.0096e-1 * Math.pow(x, 2) +
      8.18548 * x +
      1.59507
    );
  };

  // We generate intermediate values using linear interpolation
  // this are then evaluated using our lagrange polynomial
  const generatedValues = linearInterpolation(points, nSteps);

  return Array.from({ length: nSteps }).reduce(
    (acc: [number, number, number][], _, i) => {
      const x = generatedValues[i][0];
      const y = generatedValues[i][1];
      const z = generatedValues[i][2];
      // Evaluate the lagrange polynomial for the generated value
      // for both y and z components
      //const interpolatedY = L(x, yPoints, xPoints);
      //const interpolatedZ = L(x, zPoints, xPoints);
      const interpolatedZ = f(x);
      acc.push([x, y, interpolatedZ]);
      return acc;
    },
    []
  );
};
