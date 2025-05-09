import {
  addChildrenToController,
  createCollapsibleComponent,
  createColorInputForm,
  createDescriptionPanel,
  createNumericInput,
  createSelectorForm,
  initController,
  initGUI,
} from "@example/utilities/gui/index";
import {
  autoResizeCanvas,
  configureCanvas,
  getGLContext,
} from "@example/utilities/web-gl";
import {
  Camera,
  Controller,
  Floor,
  Scene,
  Instance,
  Vector,
  UniformKind,
  calculateNormals,
} from "@proto-gl";
import { loadData } from "@example/utilities/files";
import vertexShaderSource from "./vs.gsls";
import fragmentShaderSource from "./fs.gsls";
import {
  denormalizeColor,
  hexToRgb,
  normalizeColor,
  rgbToHex,
} from "@example/utilities/colors";

let gl: WebGL2RenderingContext;
let canvas: HTMLCanvasElement;
let scene: Scene;
let shininessValue = 0.5;

const carModels = [
  {
    paintAlias: "BMW",
    name: "BMW-i8",
    path: "/data/models/bmw-i8/",
    size: 25,
  },
  {
    paintAlias: "Lack",
    name: "Audi-r8",
    path: "/data/models/audi-r8",
    size: 150,
  },
  {
    paintAlias: "pintura_carro",
    name: "Ford Mustang",
    path: "/data/models/ford-mustang",
    size: 103,
  },
  {
    paintAlias: "Yellow",
    name: "Lamborghini Gallardo",
    path: "/data/models/lamborghini-gallardo",
    size: 66,
  },
];
let paintAlias: string;

const attributes = ["aPosition", "aNormal"] as const;
const uniforms = [
  "uLightPositions",
  "uLightAmbient",
  "uLightDiffuseColors",
  "uLightSpecularColors",
  "uMaterialDiffuse",
  "uMaterialAmbient",
  "uMaterialSpecular",
  "uShininess",
  "uIlluminationType",
  "uAlpha",
] as const;

const initProgram = () => {
  scene = new Scene({ gl, canvas });
  const camera = new Camera({ gl, scene });
  new Controller({ camera, canvas });
  camera.setPosition(new Vector([0, 0.5, 5]));
  camera.setAzimuth(-25);
  camera.setElevation(-10);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};

const generateLightColors = () => {
  return Array.from({ length: 16 }).map(() => Math.random());
};

const diffuseLightColors = generateLightColors();
const specularLightColors = generateLightColors();

const loadModel = (modelPath: string, size: number, painAlias: string) => {
  paintAlias = painAlias;
  const lightPositions = {
    farLeft: [-1000, 1000, -1000],
    farRight: [1000, 1000, -1000],
    nearLeft: [-1000, 1000, 1000],
    nearRight: [1000, 1000, 1000],
  };

  for (let i = 1; i < size; i++) {
    loadData(`${modelPath}/part${i}.json`).then((data) => {
      const {
        alias: id,
        vertices,
        indices,
        Ka: ambient,
        Kd: diffuse,
        Ks: specular,
        illum,
        d: alpha,
        Ns: shininess,
      } = data;

      const instance = new Instance<typeof attributes, typeof uniforms>({
        id,
        gl,
        vertexShaderSource,
        fragmentShaderSource,
        indices,
        attributes: {
          aPosition: {
            data: vertices,
            size: 3,
            type: gl.FLOAT,
          },
          aNormal: {
            data: calculateNormals(vertices, indices, 3),
            size: 3,
            type: gl.FLOAT,
          },
        },
        uniforms: {
          uLightPositions: {
            data: [
              lightPositions.farLeft,
              lightPositions.farRight,
              lightPositions.nearLeft,
              lightPositions.nearRight,
            ].flat(),
            size: 3,
            type: UniformKind.VECTOR_FLOAT,
          },
          uLightAmbient: {
            data: [0, 0, 0, 1],
            type: UniformKind.VECTOR_FLOAT,
          },
          uLightDiffuseColors: {
            data: diffuseLightColors,
            type: UniformKind.VECTOR_FLOAT,
            size: 4,
          },
          uLightSpecularColors: {
            data: specularLightColors,
            type: UniformKind.VECTOR_FLOAT,
            size: 4,
          },
          uMaterialDiffuse: {
            data: [...diffuse, 1.0],
            type: UniformKind.VECTOR_FLOAT,
          },
          uMaterialAmbient: {
            data: [...ambient, 1.0],
            type: UniformKind.VECTOR_FLOAT,
          },
          uMaterialSpecular: {
            data: [...specular, 1.0],
            type: UniformKind.VECTOR_FLOAT,
          },
          uShininess: {
            data: shininess,
            type: UniformKind.SCALAR_FLOAT,
          },
          uIlluminationType: {
            data: illum,
            type: UniformKind.SCALAR_INT,
          },
          uAlpha: {
            data: alpha,
            type: UniformKind.SCALAR_FLOAT,
          },
        },
      });
      scene.add(instance);
    });
  }
};

const initData = () => {
  scene.add(new Floor({ gl, dimension: 82, lines: 2 }));
};

const updateInstancesWithPaintAttribute = (
  cb: (instance: Instance<any, any>) => void
) => {
  scene.getInstances().forEach((instance) => {
    if (instance.getId()?.includes(paintAlias)) {
      cb(instance);
    }
  });
};

const getSubArray = (originalArray: number[], start: number, size = 4) => {
  return originalArray.slice(start, start + size);
};

const initControls = () => {
  initController();
  const { container: carColorInput } = createColorInputForm({
    label: "Car color",
    value: "#ffffff",
    onChange: (v) => {
      updateInstancesWithPaintAttribute((instance) => {
        const newColor = normalizeColor(hexToRgb(v));
        instance.updateUniform("uMaterialDiffuse", [...newColor, 1]);
      });
    },
  });
  const { container: shininessInput } = createNumericInput({
    label: "Specular Color",
    value: shininessValue,
    min: 0,
    max: 50,
    step: 0.01,
    onChange: (v) => {
      updateInstancesWithPaintAttribute((instance) => {
        instance.updateUniform("uMaterialSpecular", [v, v, v, 1]);
      });
    },
  });
  const { container: carSelector } = createSelectorForm({
    label: "Car Model",
    value: carModels[0].name,
    options: carModels.map((car) => car.name),
    onChange: (selectedCarModel) => {
      loadCarModel(selectedCarModel);
    },
    onInit: (selectedCarModel) => {
      loadCarModel(selectedCarModel);
    },
  });
  const { container: carCollapsible } = createCollapsibleComponent({
    label: "Car",
    children: [carSelector, carColorInput, shininessInput],
    openByDefault: true,
  });

  const lightCollapsibles = [
    "Far Left",
    "Far Right",
    "Near Left",
    "Near Right",
  ].map((label, index) => {
    return createLightColorController(label, index);
  });

  const { container: lightCollapsible } = createCollapsibleComponent({
    label: "Lights",
    children: lightCollapsibles,
    openByDefault: true,
  });

  addChildrenToController([carCollapsible, lightCollapsible]);
};

const loadCarModel = (carModelName: string) => {
  const selectedModelProperties = carModels.find(
    (carModel) => carModel.name == carModelName
  );
  if (!selectedModelProperties) return;
  scene.getInstances().forEach((instance) => {
    const id = instance.getId();
    if (!id || id.includes("Floor")) return;
    scene.remove(id);
  });
  const { path, size, paintAlias } = selectedModelProperties;
  loadModel(path, size, paintAlias);
};

const createLightColorController = (label: string, index: number) => {
  const { container: diffuseInputForm } = createColorInputForm({
    label: `${label} Diffuse Color`,
    value: rgbToHex(
      denormalizeColor(getSubArray(diffuseLightColors, index * 4))
    ),
    onChange: (v) => {
      updateLightColor(v, index, "uLightDiffuseColors");
    },
  });
  const { container: specularInputForm } = createColorInputForm({
    label: `${label} Specular Color`,
    value: rgbToHex(
      denormalizeColor(getSubArray(specularLightColors, index * 4))
    ),
    onChange: (v) => {
      updateLightColor(v, index, "uLightSpecularColors");
    },
  });

  const { container: collapsibleComponent } = createCollapsibleComponent({
    label: label,
    children: [diffuseInputForm, specularInputForm],
  });
  return collapsibleComponent;
};

const updateLightColor = (
  value: string,
  index: number,
  lightUniformName: "uLightDiffuseColors" | "uLightSpecularColors"
) => {
  scene.getInstances().forEach((instance) => {
    const ligthDiffuseColors = instance
      .getUniform("uLightDiffuseColors")
      ?.getData() as number[];
    if (!ligthDiffuseColors) return;
    const newColor = normalizeColor(hexToRgb(value));
    const newArrayColors = replaceArrayValues(
      ligthDiffuseColors,
      [...newColor, 1],
      index * 4
    );
    instance.updateUniform(lightUniformName, newArrayColors);
  });
};

const replaceArrayValues = (
  array: number[],
  newValues: number[],
  start: number
) => {
  const arrayCopy = [...array];
  arrayCopy.splice(start, start + newValues.length, ...newValues);
  return arrayCopy;
};

const render = () => {
  requestAnimationFrame(render);
  scene.render();
};

const init = () => {
  initGUI();
  createDescriptionPanel(
    "On this example we will create a demo application using our WebGL library.",
    "ch09/01/"
  );

  gl = getGLContext();
  canvas = configureCanvas();
  autoResizeCanvas(canvas);

  initProgram();
  initData();
  render();
  initControls();
};

window.onload = init;
