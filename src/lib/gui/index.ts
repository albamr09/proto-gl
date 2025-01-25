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

  const controllerCollapsible = createCollapsibleComponent({
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
  addToContainer = true,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onInit?: (v: number) => void;
  onChange: (v: number) => void;
  addToContainer?: boolean;
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

  if (addToContainer) {
    document.getElementById(CONTROL_CONTAINER_ID)?.appendChild(formContainer);
  } else {
    return formContainer;
  }
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

  // Add an event listener for the "change" event on the select element
  select.addEventListener("change", function () {
    // Call the onChange function with the selected value
    onChange(select.value as T);
  });

  // Append the label, select to the form
  form.appendChild(labelElement);
  form.appendChild(select);

  // Append the form to the container
  formContainer.appendChild(form);

  // Append the container to the control container (change CONTROL_CONTAINER_ID to the actual ID)
  document.getElementById(CONTROL_CONTAINER_ID)?.appendChild(formContainer);
  return select;
};

export const createButtonForm = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => {
  // Create a div container
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  // Create the form element
  const form = document.createElement("div");
  form.classList.add("form-container");

  // Create the button element
  const button = document.createElement("button");
  button.innerHTML = label;
  button.addEventListener("click", onClick);
  form.appendChild(button);

  // Append the form to the container
  formContainer.appendChild(form);

  // Append the container to the control container (change CONTROL_CONTAINER_ID to the actual ID)
  document.getElementById(CONTROL_CONTAINER_ID)?.appendChild(formContainer);
};

export const createColorInputForm = ({
  label,
  value,
  onInit = () => {},
  onChange,
  addToContainer = true,
}: {
  label: string;
  value: string;
  onInit?: (v: string) => void;
  onChange: (v: string) => void;
  addToContainer?: boolean;
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

  // Create an input element of type "color"
  const colorInput = document.createElement("input");
  colorInput.setAttribute("type", "color");
  colorInput.setAttribute("id", "userInput");
  colorInput.setAttribute("name", "userInput");

  // Set the initial value of the color input
  if (value) {
    colorInput.value = value;
    onInit(value);
  }

  // Add an event listener for the "input" event on the color input
  colorInput.addEventListener("input", function () {
    // Call the onChange function with the selected color value
    onChange(colorInput.value);
  });

  // Append the label, color input to the form
  form.appendChild(labelElement);
  form.appendChild(colorInput);

  // Append the form to the container
  formContainer.appendChild(form);

  if (addToContainer) {
    document.getElementById(CONTROL_CONTAINER_ID)?.appendChild(formContainer);
  } else {
    return formContainer;
  }
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
  // Create a div container
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  // Create the form element
  const form = document.createElement("div");
  form.classList.add("form-container");

  // Create a label for the input
  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", "imageInput");
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = label;
  labelElement.appendChild(labelSpan);

  // Create an input element of type "file"
  const imageInput = document.createElement("input");
  imageInput.setAttribute("type", "file");
  imageInput.setAttribute("id", "imageInput");
  imageInput.setAttribute("name", "imageInput");
  // Accept only image files
  imageInput.setAttribute("accept", "image/*");

  if (value) {
    loadImage(value).then((image) => {
      onInit(image);
    });
  }

  // Add an event listener for the "change" event on the file input
  imageInput.addEventListener("change", function () {
    // Get the selected file from the input
    const file = imageInput.files ? imageInput.files[0] : null;
    if (!file) return;

    // Create a FileReader to read the image file
    const reader = new FileReader();
    reader.onload = function (event) {
      const src = event.target?.result as string;
      loadImage(src).then((image) => {
        onChange(image);
      });
    };

    // Read the file as a data URL
    reader.readAsDataURL(file);
  });

  // Append the label and file input to the form
  form.appendChild(labelElement);
  form.appendChild(imageInput);

  // Append the form to the container
  formContainer.appendChild(form);

  // Append the container to the control container (change CONTROL_CONTAINER_ID to the actual ID)
  document.getElementById(CONTROL_CONTAINER_ID)?.appendChild(formContainer);
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

  // Create a text input element
  const textInput = document.createElement("input");
  textInput.setAttribute("type", "number");
  textInput.setAttribute("name", "userInputText");
  textInput.classList.add("numeric-input");

  // Set the initial value of the text input
  if (value !== undefined && value !== null) {
    onInit(value);
    textInput.value = value.toString();
  }

  // Add an event listener for the "input" event on the text input
  textInput.addEventListener("input", function () {
    const parsedValue = parseFloat(textInput.value);
    if (parsedValue < max && parsedValue > min) {
      onChange(parsedValue);
      sliderInput.value = textInput.value;
    } else {
      textInput.value = Math.min(Math.max(parsedValue, min), max).toString();
    }
  });

  // Create an input element of type "range"
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

  // Add an event listener for the "input" event on the slider input
  sliderInput.addEventListener("input", function () {
    // Call the onChange function with the selected value
    onChange(parseFloat(sliderInput.value)); // Convert the value to a float
    textInput.value = sliderInput.value;
  });

  // Append the label, slider input to the form
  form.appendChild(labelElement);
  form.appendChild(sliderInput);
  form.appendChild(textInput);

  // Append the form to the container
  formContainer.appendChild(form);

  // Append the container to the control container (change CONTROL_CONTAINER_ID to the actual ID)
  document.getElementById(CONTROL_CONTAINER_ID)?.appendChild(formContainer);
  return { labelElement, sliderInput, textInput };
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
  // Create a div container
  const formContainer = document.createElement("div");
  formContainer.classList.add("controller-element");

  // Create the form element
  const form = document.createElement("div");
  form.classList.add("form-container");

  // Create a label for the input
  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", label);
  const labelSpan = document.createElement("span");
  labelSpan.innerHTML = label;
  labelElement.appendChild(labelSpan);

  // Create an input element of type "checkbox"
  const checkboxInput = document.createElement("input");
  checkboxInput.setAttribute("type", "checkbox");
  checkboxInput.setAttribute("id", label);
  checkboxInput.setAttribute("name", label);

  // Set the initial value of the checkbox input
  checkboxInput.checked = value;
  onInit(value);

  // Add an event listener for the "change" event on the checkbox input
  checkboxInput.addEventListener("change", function () {
    // Call the onChange function with the checked value
    onChange(checkboxInput.checked);
  });

  // Append the label and checkbox input to the form
  form.appendChild(labelElement);
  form.appendChild(checkboxInput);

  // Append the form to the container
  formContainer.appendChild(form);

  // Append the container to the control container (change CONTROL_CONTAINER_ID to the actual ID)
  document.getElementById(CONTROL_CONTAINER_ID)?.appendChild(formContainer);
  return checkboxInput;
};

export const createDescriptionPanel = (description: string) => {
  const descriptionContent = document.createElement("div");
  descriptionContent.innerHTML = description;
  const collapsibleComponent = createCollapsibleComponent({
    label: "Description",
    children: descriptionContent,
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
  children: HTMLElement | HTMLElement[]; // Accept single or multiple children
  openByDefault?: boolean;
}) => {
  // Create a div for the collapsible container
  const collapsibleContainer = document.createElement("div");
  collapsibleContainer.classList.add("collapsible-container");

  // Create a button for toggling the collapse
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

  // Toggle button
  const caret = document.createElement("span");
  caret.className = "caret";
  toggleButton.appendChild(caret);

  // Create a div to hold the collapsible content (children)
  const collapsibleContent = document.createElement("div");
  collapsibleContent.classList.add("collapsible-content");

  // Append the children to the collapsible content
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

  // Append the button and collapsible content to the container
  collapsibleContainer.appendChild(toggleButton);
  collapsibleContainer.appendChild(collapsibleContent);

  return collapsibleContainer;
};

export const getControllerContainer = () => {
  return document.getElementById(CONTROL_CONTAINER_ID);
};
