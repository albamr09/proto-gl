import { REPO_URL } from "@example/constants.js";
import { loadImage } from "../files.js";
import { setupStyles } from "./styles.js";

const CONTROL_CONTAINER_ID = "control-container";

export const initGUI = () => {
  setupStyles();
};

export const initController = () => {
  const controlContainer = document.createElement("div");

  controlContainer.classList.add("right-panel");

  const controllerContent = document.createElement("form");
  controllerContent.setAttribute("id", CONTROL_CONTAINER_ID);
  // Avoid reload on submit
  controllerContent.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  const { container: controllerCollapsible } = createCollapsibleComponent({
    label: "Controls",
    children: controllerContent,
    openByDefault: true,
  });
  controlContainer.appendChild(controllerCollapsible);

  // Append the container to the body of the document
  document.body.appendChild(controlContainer);
};

export const createNumericInput = ({
  label,
  value,
  min,
  max,
  step,
  onInit = () => {},
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onInit?: (v: number) => void;
  onChange: (v: number) => void;
}) => {
  // Create a div container
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  // Create the form element
  const form = document.createElement("div");
  form.classList.add("form-container");

  // Create a label for the input
  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", "userInput");
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = label;
  labelElement.appendChild(labelSpan);

  // Create a select element
  const numericInput = document.createElement("input");
  numericInput.setAttribute("id", "userInput");
  numericInput.setAttribute("type", "number");
  numericInput.setAttribute("name", "userInput");
  numericInput.setAttribute("min", min.toString()); // Minimum value
  numericInput.setAttribute("max", max.toString()); // Maximum value
  numericInput.setAttribute("step", step.toString()); // Step value

  // Set the initial value of the select element
  if (value) {
    numericInput.value = value.toString();
    onInit(value);
  }

  // Add an event listener for the "change" event on the select element
  numericInput.addEventListener("change", function () {
    onChange(parseFloat(numericInput.value));
  });

  // Append the label, select to the form
  form.appendChild(labelElement);
  form.appendChild(numericInput);

  // Append the form to the container
  formContainer.appendChild(form);

  return { container: formContainer };
};

export const createSelectorForm = <T>({
  label,
  value,
  options,
  onInit = () => {},
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onInit?: (v: T) => void;
  onChange: (v: T) => void;
}) => {
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  const form = document.createElement("div");
  form.classList.add("form-container");

  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", "userInput");
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = label;
  labelElement.appendChild(labelSpan);

  const select = document.createElement("select");
  select.setAttribute("id", "userInput");
  select.setAttribute("name", "userInput");

  // Create and add options to the select element
  for (let i = 0; i < options.length; i++) {
    const option = document.createElement("option");
    option.value = `${options[i]}`;
    option.text = `${options[i]}`;
    select.appendChild(option);
  }

  // Set the initial value of the select element
  if (value) {
    select.value = `${value}`;
    onInit(value);
  }

  select.addEventListener("change", function () {
    onChange(select.value as T);
  });

  form.appendChild(labelElement);
  form.appendChild(select);

  formContainer.appendChild(form);

  return { selectInput: select, container: formContainer };
};

export const createButtonForm = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => {
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  const form = document.createElement("div");
  form.classList.add("form-container");

  const button = document.createElement("button");
  button.innerHTML = label;
  button.addEventListener("click", onClick);
  form.appendChild(button);

  formContainer.appendChild(form);

  return { container: formContainer };
};

export const createColorInputForm = ({
  label,
  value,
  onInit = () => {},
  onChange,
}: {
  label: string;
  value: string;
  onInit?: (v: string) => void;
  onChange: (v: string) => void;
}) => {
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  const form = document.createElement("div");
  form.classList.add("form-container");

  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", "userInput");
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = label;
  labelElement.appendChild(labelSpan);

  const colorInput = document.createElement("input");
  colorInput.setAttribute("type", "color");
  colorInput.setAttribute("id", "userInput");
  colorInput.setAttribute("name", "userInput");

  // Set the initial value of the color input
  if (value) {
    colorInput.value = value;
    onInit(value);
  }

  colorInput.addEventListener("input", function () {
    onChange(colorInput.value);
  });

  form.appendChild(labelElement);
  form.appendChild(colorInput);

  formContainer.appendChild(form);
  return { container: formContainer };
};

export const createImageInputForm = ({
  label,
  value,
  onInit = () => {},
  onChange,
}: {
  label: string;
  value?: string;
  onInit?: (file: HTMLImageElement) => void;
  onChange: (file: HTMLImageElement) => void;
}) => {
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  const form = document.createElement("div");
  form.classList.add("form-container");

  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", "imageInput");
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = label;
  labelElement.appendChild(labelSpan);

  const imageInput = document.createElement("input");
  imageInput.setAttribute("type", "file");
  imageInput.setAttribute("id", "imageInput");
  imageInput.setAttribute("name", "imageInput");
  imageInput.setAttribute("accept", "image/*");

  if (value) {
    loadImage(value).then((image) => {
      onInit(image);
    });
  }

  imageInput.addEventListener("change", function () {
    const file = imageInput.files ? imageInput.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const src = event.target?.result as string;
      loadImage(src).then((image) => {
        onChange(image);
      });
    };

    reader.readAsDataURL(file);
  });

  form.appendChild(labelElement);
  form.appendChild(imageInput);

  formContainer.appendChild(form);

  return { container: formContainer };
};

export const createSliderInputForm = ({
  label,
  value,
  min,
  max,
  step,
  onInit = () => {},
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onInit?: (v: number) => void;
  onChange: (v: number) => void;
}) => {
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  const form = document.createElement("div");
  form.classList.add("form-container");

  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", "userInput");
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = label;
  labelElement.appendChild(labelSpan);

  const textInput = document.createElement("input");
  textInput.setAttribute("type", "number");
  textInput.setAttribute("name", "userInputText");
  textInput.classList.add("numeric-input");

  if (value !== undefined && value !== null) {
    onInit(value);
    textInput.value = value.toString();
  }

  textInput.addEventListener("input", function () {
    const parsedValue = parseFloat(textInput.value);
    if (parsedValue < max && parsedValue > min) {
      onChange(parsedValue);
      sliderInput.value = textInput.value;
    } else {
      textInput.value = Math.min(Math.max(parsedValue, min), max).toString();
    }
  });

  const sliderInput = document.createElement("input");
  sliderInput.setAttribute("type", "range");
  sliderInput.setAttribute("name", "userInput");
  sliderInput.setAttribute("min", min.toString()); // Minimum value
  sliderInput.setAttribute("max", max.toString()); // Maximum value
  sliderInput.setAttribute("step", `${step}`); // Step value

  // Set the initial value of the slider input
  if (value) {
    sliderInput.value = value.toString();
  }

  sliderInput.addEventListener("input", function () {
    onChange(parseFloat(sliderInput.value)); // Convert the value to a float
    textInput.value = sliderInput.value;
  });

  form.appendChild(labelElement);
  form.appendChild(sliderInput);
  form.appendChild(textInput);

  // Append the form to the container
  formContainer.appendChild(form);

  return { labelElement, sliderInput, textInput, container: formContainer };
};

/**
 * Creates one slider per element on the 3d vector
 */
export const createVector3dSliders = ({
  labels,
  value,
  min,
  max,
  step,
  onInit = () => {},
  onChange,
}: {
  labels: string[];
  value: number[];
  min: number;
  max: number;
  step: number;
  onInit?: (v: number[]) => void;
  onChange: (v: number[]) => void;
}) => {
  let _value = value;
  return value.map((v, idx) => {
    return createSliderInputForm({
      label: labels[idx],
      value: v,
      min,
      max,
      step,
      onInit: (v) => {
        _value[idx] = v;
        onInit(_value);
      },
      onChange: (v) => {
        _value[idx] = v;
        onChange(_value);
      },
    });
  });
};

export const createCheckboxInputForm = ({
  label,
  value,
  onInit = () => {},
  onChange,
}: {
  label: string;
  value: boolean;
  onInit?: (v: boolean) => void;
  onChange: (v: boolean) => void;
}) => {
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  const form = document.createElement("div");
  form.classList.add("form-container");

  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", label);
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = label;
  labelElement.appendChild(labelSpan);

  const checkboxInput = document.createElement("input");
  checkboxInput.setAttribute("type", "checkbox");
  checkboxInput.setAttribute("id", label);
  checkboxInput.setAttribute("name", label);

  checkboxInput.checked = value;
  onInit(value);

  checkboxInput.addEventListener("change", function () {
    onChange(checkboxInput.checked);
  });

  form.appendChild(labelElement);
  form.appendChild(checkboxInput);

  formContainer.appendChild(form);

  return { checkboxInput, container: formContainer };
};

export const createDescriptionPanel = (
  description: string,
  source_url: string
) => {
  const descriptionContainer = document.createElement("div");
  descriptionContainer.className = "description-container";

  const descriptionContent = document.createElement("div");
  descriptionContent.className = "description-content";
  descriptionContent.innerHTML = description;

  const linkSource = document.createElement("a");
  linkSource.className = "description-link-source";
  linkSource.href = `${REPO_URL}/tree/main/example/src/${source_url}/index.ts`;
  linkSource.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 7.82959L18.6965 9.35641C20.239 10.7447 21.0103 11.4389 21.0103 12.3296C21.0103 13.2203 20.239 13.9145 18.6965 15.3028L17 16.8296" stroke="#8e9095" stroke-width="1.5" stroke-linecap="round"></path> <path opacity="0.5" d="M13.9868 5L10.0132 19.8297" stroke="#8e9095" stroke-width="1.5" stroke-linecap="round"></path> <path d="M7.00005 7.82959L5.30358 9.35641C3.76102 10.7447 2.98975 11.4389 2.98975 12.3296C2.98975 13.2203 3.76102 13.9145 5.30358 15.3028L7.00005 16.8296" stroke="#8e9095" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>`;
  linkSource.target = "_blank";
  linkSource.rel = "noopener noreferrer";
  linkSource.title = "View source code on GitHub";

  descriptionContainer.appendChild(descriptionContent);
  descriptionContainer.appendChild(linkSource);
  const { container: collapsibleComponent } = createCollapsibleComponent({
    label: "Description",
    children: descriptionContainer,
    openByDefault: true,
  });

  // Create panel container
  const panel = document.createElement("div");
  panel.classList.add("left-panel");
  panel.appendChild(collapsibleComponent);

  // Append panel to body
  document.body.appendChild(panel);
};

export const createMatrixElement = (containerId: string, dimension: number) => {
  const containerElement = document.getElementById(containerId);
  if (!containerElement) return;

  const matrixElement = document.createElement("table");

  for (let i = 0; i < dimension; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < dimension; j++) {
      const cell = document.createElement("td");
      const cellId = `m${j * dimension + i}`;
      cell.id = cellId;
      row.appendChild(cell);
    }

    matrixElement.appendChild(row);
  }
  containerElement.appendChild(matrixElement);
};

export const updateMatrixElement = (m: number[] | Float32Array) => {
  m.forEach((data, i) => {
    const matrixElement = document.getElementById(`m${i}`);
    if (matrixElement) {
      matrixElement.innerText = data.toFixed(1);
    }
  });
};

export const createLowerLeftPanel = (title: string) => {
  const panel = document.createElement("div");
  const id = "lower-left-panel";
  panel.id = id;

  // Create title bar
  const titleBar = document.createElement("div");
  titleBar.className = "title";
  titleBar.innerHTML = title;
  panel.appendChild(titleBar);

  // Append panel to body
  document.body.appendChild(panel);
  return id;
};

export const updatePanelTitle = (id: string, title: string) => {
  const panelElement = document.getElementById(id);
  if (!panelElement) return;

  const titleElement = panelElement.getElementsByClassName("title")[0];
  if (!titleElement) return;
  titleElement.innerHTML = title;
};

export const createCollapsibleComponent = ({
  label,
  children,
  openByDefault = false,
}: {
  label: string;
  children: HTMLElement | HTMLElement[];
  openByDefault?: boolean;
}) => {
  const collapsibleContainer = document.createElement("div");
  collapsibleContainer.classList.add("collapsible-container");

  const toggleButton = document.createElement("button");
  toggleButton.classList.add("collapsible-toggle");
  toggleButton.textContent = label;

  const openCollapsible = () => {
    collapsibleContent.style.display = "flex";
    caret.classList.add("open");
  };

  const closeCollapsible = () => {
    collapsibleContent.style.display = "none";
    caret.classList.remove("open");
  };

  const caret = document.createElement("span");
  caret.className = "caret";
  toggleButton.appendChild(caret);

  const collapsibleContent = document.createElement("div");
  collapsibleContent.classList.add("collapsible-content");

  if (Array.isArray(children)) {
    children.forEach((child) => collapsibleContent.appendChild(child));
  } else {
    collapsibleContent.appendChild(children);
  }

  if (openByDefault) {
    openCollapsible();
  } else {
    closeCollapsible();
  }

  // Toggle function to show/hide the content
  toggleButton.addEventListener("click", () => {
    const isCollapsed = collapsibleContent.style.display === "none";
    if (isCollapsed) {
      openCollapsible();
    } else {
      closeCollapsible();
    }
  });

  collapsibleContainer.appendChild(toggleButton);
  collapsibleContainer.appendChild(collapsibleContent);

  return { container: collapsibleContainer };
};

export const addChildrenToController = (
  children: HTMLElement | HTMLElement[]
) => {
  const controller = document.getElementById(CONTROL_CONTAINER_ID);
  if (!controller) return;
  // Append the children to the collapsible content
  if (Array.isArray(children)) {
    children.forEach((child) => controller.appendChild(child));
  } else {
    controller.appendChild(children);
  }
};
