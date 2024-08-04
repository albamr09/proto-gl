// Visualize a floor on the screen
class Floor {
  private alias: string;
  private dimension: number;
  private lines: number;
  public vertices: number[];
  public indices: number[];
  public wireframe: boolean;
  public visible: boolean;
  public color: number[];

  constructor(dimension = 50, lines = 5) {
    this.alias = "floor";
    this.dimension = dimension;
    this.lines = lines;
    this.vertices = [];
    this.indices = [];

    this.wireframe = true;
    this.visible = true;
    this.color = [1.0, 1.0, 1.0, 1.0];

    this.build(this.dimension, this.lines);
  }

  build(dimension: number, lines: number) {
    if (dimension) {
      this.dimension = dimension;
    }

    if (lines) {
      this.lines = (2 * this.dimension) / lines;
    }

    const inc = (2 * this.dimension) / this.lines;
    const v = [];
    const i = [];

    for (let l = 0; l <= this.lines; l++) {
      v[6 * l] = -this.dimension;
      v[6 * l + 1] = 0;
      v[6 * l + 2] = -this.dimension + l * inc;

      v[6 * l + 3] = this.dimension;
      v[6 * l + 4] = 0;
      v[6 * l + 5] = -this.dimension + l * inc;

      v[6 * (this.lines + 1) + 6 * l] = -this.dimension + l * inc;
      v[6 * (this.lines + 1) + 6 * l + 1] = 0;
      v[6 * (this.lines + 1) + 6 * l + 2] = -this.dimension;

      v[6 * (this.lines + 1) + 6 * l + 3] = -this.dimension + l * inc;
      v[6 * (this.lines + 1) + 6 * l + 4] = 0;
      v[6 * (this.lines + 1) + 6 * l + 5] = this.dimension;

      i[2 * l] = 2 * l;
      i[2 * l + 1] = 2 * l + 1;
      i[2 * (this.lines + 1) + 2 * l] = 2 * (this.lines + 1) + 2 * l;
      i[2 * (this.lines + 1) + 2 * l + 1] = 2 * (this.lines + 1) + 2 * l + 1;
    }

    this.vertices = v;
    this.indices = i;
  }
}

export default Floor;
