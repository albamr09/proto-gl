const cssCode = `
body {
  margin: 0;
}
#control-container {
  position: absolute;
  top: 20px;
  right: 10px;
  font-size: 14px;
  border: 1px dotted white;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  gap: 10px;
  background: black;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

.controller-element {
  width: 100%;
}

.form-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  color: white;
  padding: 0;
  margin: 0;
}

.numeric-input {
  width: 50px;
}

select {
  background: black;
  border: 1px solid white;
  color: white;
  font-family: inherit;
}

#collapsiblePanel {
  position: fixed;
  top: 10px;
  left: 10px;
  width: 300px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  z-index: 1000;
}

#collapsiblePanel .title {
  background-color: #f2f2f2;
  padding: 10px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#collapsiblePanel .content {
  padding: 10px;
  display: none; /* Hidden by default */
}

.caret {
  border: solid black;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
  transition: transform 0.3s;
}

.caret.open {
  transform: rotate(-135deg);
}
`;

export const setupStyles = () => {
  // Create a <style> element
  const styleElement = document.createElement("style");

  styleElement.appendChild(document.createTextNode(cssCode));

  // Append the <style> element to the <head>
  document.head.appendChild(styleElement);
};
