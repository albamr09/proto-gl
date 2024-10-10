import Program from "../../lib/webgl/program.js";
import Instance from "../../lib/webgl/instance.js";
import fragmentShaderSource from "./fs.glsl.js";
import vertexShaderSource from "./vs.glsl.js";
import { Matrix4 } from "../../lib/math/matrix.js";
import { UniformType } from "../../lib/webgl/uniforms.js";

const attributes = ["a_pos"] as const;
const uniforms = ["u_matrix"] as const;

interface CustomLayerInterface {
  id: string;
  type: string;
  program?: Program<typeof attributes, typeof uniforms>;
  instance?: Instance<typeof attributes, typeof uniforms>;
  onAdd: (map: any, gl: WebGL2RenderingContext) => void;
  render: (gl: WebGL2RenderingContext, matrix: Float32Array) => void;
}

let layer: CustomLayerInterface;

const initData = (
  gl: WebGL2RenderingContext,
  program: Program<typeof attributes, typeof uniforms>
) => {
  // define vertices of the triangle to be rendered in the custom style layer
  // @ts-ignore
  const helsinki = maplibregl.MercatorCoordinate.fromLngLat({
    lng: 25.004,
    lat: 60.239,
  });
  // @ts-ignore
  const berlin = maplibregl.MercatorCoordinate.fromLngLat({
    lng: 13.403,
    lat: 52.562,
  });
  // @ts-ignore
  const kyiv = maplibregl.MercatorCoordinate.fromLngLat({
    lng: 30.498,
    lat: 50.541,
  });
  const instance = new Instance({
    id: "position",
    gl,
    program,
    attributes: {
      a_pos: {
        data: [helsinki.x, helsinki.y, berlin.x, berlin.y, kyiv.x, kyiv.y],
        size: 2,
        type: gl.FLOAT,
      },
    },
    uniforms: {
      u_matrix: {
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
    onAdd(_map: any, gl: WebGL2RenderingContext) {
      this.program = new Program<typeof attributes, typeof uniforms>(
        gl,
        vertexShaderSource,
        fragmentShaderSource,
        attributes,
        uniforms
      );
      this.instance = initData(gl, this.program);
    },
    render(_gl: WebGL2RenderingContext, matrix: Float32Array) {
      this.instance?.setGLParameters((gl: WebGL2RenderingContext) => {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      });
      this.instance?.updateUniform("u_matrix", matrix);
      this.instance?.render({});
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
