import Program from "../../lib/webgl/program.js";
import Instance from "../../lib/webgl/instance.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";
import { Matrix4 } from "../../lib/math/matrix.js";
import { UniformType } from "../../lib/webgl/types.js";
import { Vector } from "../../lib/math/vector.js";

const attributes = ["aPos"] as const;
const uniforms = ["uRotation"] as const;
let rotation = 0;

interface CustomLayerInterface {
  id: string;
  type: string;
  program?: Program<typeof attributes, typeof uniforms>;
  instance?: Instance<typeof attributes, typeof uniforms>;
  onAdd: (map: any, gl: WebGL2RenderingContext) => void;
  render: (gl: WebGL2RenderingContext, matrix: Float32Array) => void;
}

let layer: CustomLayerInterface;

const transformVertices = (
  lnglats: number[][],
  mercatorMatrix: Float32Array
) => {
  const matrix = Matrix4.fromFloatArray(mercatorMatrix).transpose() as Matrix4;
  return lnglats.flatMap((coords) => {
    // @ts-ignore
    const mercatorCoords = maplibregl.MercatorCoordinate.fromLngLat({
      lng: coords[0],
      lat: coords[1],
    });
    return matrix.multiply(
      new Vector([mercatorCoords.x, mercatorCoords.y, 0, 1])
    ).elements;
  });
};

const initData = (
  gl: WebGL2RenderingContext,
  program: Program<typeof attributes, typeof uniforms>,
  map: any
) => {
  const vertices = transformVertices(
    [
      [25.004, 60.239],
      [13.403, 52.562],
      [30.498, 50.541],
    ],
    map.transform.mercatorMatrix
  );
  const instance = new Instance({
    id: "position",
    gl,
    program,
    attributes: {
      aPos: {
        data: vertices,
        size: 4,
        type: gl.FLOAT,
      },
    },
    uniforms: {
      uRotation: {
        data: Matrix4.identity().toFloatArray(),
        type: UniformType.MATRIX,
      },
    },
    size: 3,
  });

  return instance;
};

const initLayer = () => {
  layer = {
    id: "highlight",
    type: "custom",
    onAdd(map: any, gl: WebGL2RenderingContext) {
      try {
        this.program = new Program<typeof attributes, typeof uniforms>(
          gl,
          vertexShaderSource,
          fragmentShaderSource,
          attributes,
          uniforms
        );
        this.instance = initData(gl, this.program, map);
      } catch (e) {
        console.log(e);
      }
    },
    render(_gl: WebGL2RenderingContext, matrix: Float32Array) {
      const vertices = transformVertices(
        [
          [25.004, 60.239],
          [13.403, 52.562],
          [30.498, 50.541],
        ],
        matrix
      );
      this.instance?.setAttributeData(
        "aPos",
        {
          data: vertices,
          size: 4,
          type: _gl.FLOAT,
        },
        true
      );
      this.instance?.render({
        cb: (_, gl) => {
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        },
      });
    },
  };
};

const init = () => {
  // @ts-ignore
  const map = new maplibregl.Map({
    container: "map",
    zoom: 3,
    center: [7.5, 58],
    style: "https://demotiles.maplibre.org/style.json",
    // Create the gl context with MSAA antialiasing, so custom layers are antialiased
    antialias: true,
  });
  // Add the custom style layer to the map
  map.on("load", () => {
    initLayer();
    map.addLayer(layer);
  });
};

window.onload = init;
