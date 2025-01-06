export class Angle {
  constructor() {}

  static toRadians(deg: number) {
    return (deg * Math.PI) / 180;
  }

  static toDegrees(rad: number) {
    return (rad * 180) / Math.PI;
  }

  static safeDegAngle(deg: number) {
    if (deg >= 360) {
      return deg % 360;
    } else if (deg < 0) {
      return 360 - (-deg % 360);
    } else return deg;
  }
}
