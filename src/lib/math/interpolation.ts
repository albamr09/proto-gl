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
// Also very simple introduction: https://rohangautam.github.io/blog/b_spline_intro
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

  const totalDist = xPoints.reduce((acc, p, i) => {
    return acc + Math.abs(xPoints[(i + 1) % xPoints.length] - p);
  }, 0);

  // Compute a different step size depending on the distance
  // between the points, this allows the speed of the animation
  // to be constante in between checkpoints
  const relativeStepSize = xPoints.map((p, i) => {
    const d = Math.abs(xPoints[(i + 1) % xPoints.length] - p);
    return (d / totalDist) * nSteps;
  });

  return relativeStepSize.flatMap((size, stepIdx) => {
    return Array.from({ length: size }).reduce(
      (acc: [number, number, number][], _, i) => {
        const currentX = xPoints[stepIdx];
        const nextX = xPoints[(stepIdx + 1) % nPoints];
        const progress = i / size;
        const x = currentX + (nextX - currentX) * progress;
        // Evaluate the lagrange polynomial for the generated value
        // for both y and z components
        const interpolatedY = L(x, yPoints, xPoints);
        const interpolatedZ = L(x, zPoints, xPoints);
        acc.push([x, interpolatedY, interpolatedZ]);
        return acc;
      },
      []
    );
  });
};

// Reference: https://rohangautam.github.io/blog/b_spline_intro
export const bSplineInterpolation = (
  points: [number, number, number][],
  nSteps: number,
  degree = 3
) => {
  const coxDeBoor = (u: number, i: number, k: number, knots: number[]) => {
    /**
     * u : x value of the point to be evaluated in the input domain
     * i : index of the basis function to compute
     * k : degree of the spline
     * knots : values in the parameter domain that divide the spline into pieces
     *
     * returns -> a scalar value that calculates the influence of the i'th basis function on the point u in the input domain.
     */
    if (k === 0) {
      return knots[i] <= u && u < knots[i + 1] ? 1.0 : 0.0;
    }

    let leftTerm = 0.0;
    let rightTerm = 0.0;

    if (knots[i + k] !== knots[i]) {
      leftTerm =
        ((u - knots[i]) / (knots[i + k] - knots[i])) *
        coxDeBoor(u, i, k - 1, knots);
    }

    if (knots[i + k + 1] !== knots[i + 1]) {
      rightTerm =
        ((knots[i + k + 1] - u) / (knots[i + k + 1] - knots[i + 1])) *
        coxDeBoor(u, i + 1, k - 1, knots);
    }

    return leftTerm + rightTerm;
  };

  // Initialize basis functions
  const numBasisFunctions = points.length;
  // Generate uniform knot vector (from 0 to n + degree + 1)
  const knots = Array.from(
    { length: numBasisFunctions + degree + 2 },
    (_, i) => i
  );

  // Generate uniform u values in the range [knots[degree], knots[-degree - 1]]
  const uValues = Array.from(
    { length: 100 },
    (_, i) =>
      knots[degree] +
      (i * (knots[numBasisFunctions] - knots[degree])) / (100 - 1)
  );
  const basisFunctions = Array(uValues.length)
    .fill(0)
    .map(() => Array(numBasisFunctions).fill(0));

  // Calculate the basis functions
  for (let i = 0; i < numBasisFunctions; i++) {
    for (let j = 0; j < uValues.length; j++) {
      basisFunctions[j][i] = coxDeBoor(uValues[j], i, degree, knots);
    }
  }

  // Construct the B-spline curve
  const curve = Array(uValues.length)
    .fill(0)
    .map(() => [0, 0, 0]);

  for (let i = 0; i < numBasisFunctions; i++) {
    for (let j = 0; j < uValues.length; j++) {
      curve[j][0] += basisFunctions[j][i] * points[i][0]; // x-coordinate
      curve[j][1] += basisFunctions[j][i] * points[i][1]; // y-coordinate
      curve[j][2] += basisFunctions[j][i] * points[i][2]; // z-coordinate
    }
  }

  console.log(points);

  return curve as [number, number, number][];
};
