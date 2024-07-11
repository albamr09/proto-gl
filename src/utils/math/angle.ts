export class Angle {
  constructor() {}

  static toRadians(deg: number) {
    return deg * Math.PI / 180;
  }

  static toDegrees(rad: number) {
    return rad * 180 / Math.PI;
  }
}
