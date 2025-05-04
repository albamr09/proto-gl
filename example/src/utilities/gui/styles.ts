const cssCode = `
html, body {
  height: 100vh;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  color: #37352f;
  overflow: hidden;
  background-color: #f7f7f7;
}

.right-panel {
  position: fixed;
  top: 16px;
  right: 16px;
  width: fit-content;
  max-width: 500px;
  min-width: 300px;
  border-radius: 8px;
  border: 1px solid rgba(55, 53, 47, 0.09);
  box-shadow: rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.01) 0px 9px 24px;
  background-color: white;
  z-index: 1000;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

#control-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  gap: 8px;
  margin: 0;
  padding: 8px;
}

.title {
  background-color: white;
  padding: 12px 14px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(55, 53, 47, 0.09);
  font-size: 14px;
}

.controller-element {
  width: 100%;
  padding: 4px 0;
}

.form-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: #37352f;
  padding: 0;
  margin: 0;
}

.numeric-input {
  width: 60px;
  padding: 5px 8px;
  border-radius: 4px;
  border: 1px solid rgba(55, 53, 47, 0.2);
  background-color: white;
  transition: border 0.2s ease;
}

.numeric-input:focus {
  outline: none;
  border: 1px solid rgba(55, 53, 47, 0.5);
}

.left-panel {
  position: fixed;
  top: 16px;
  left: 16px;
  width: 300px;
  border-radius: 8px;
  border: 1px solid rgba(55, 53, 47, 0.09);
  box-shadow: rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.01) 0px 9px 24px;
  background-color: white;
  z-index: 1000;
  font-size: 14px;
  overflow: hidden;
}

.caret {
  border: solid #37352f;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
  transition: transform 0.2s ease;
}

.caret.open {
  transform: rotate(-135deg);
}

#lower-left-panel {
  position: fixed;
  bottom: 16px;
  right: 16px;
  border-radius: 8px;
  border: 1px solid rgba(55, 53, 47, 0.09);
  box-shadow: rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.01) 0px 9px 24px;
  background-color: white;
  z-index: 1000;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

table {
  font-size: 14px;
  border-collapse: collapse;
  width: calc(100% - 16px);
  margin: 8px;
  border: none;
}

tr {
  color: #37352f;
  border-bottom: 1px solid rgba(55, 53, 47, 0.09);
}

tr:last-child {
  border-bottom: none;
}

td {
  padding: 8px 12px;
}

button {
  background: white;
  width: 100%;
  border: 1px solid rgba(55, 53, 47, 0.16);
  border-radius: 2px;
  padding: 6px 10px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #37352f;
}

button:hover {
  background: rgba(55, 53, 47, 0.08);
}

.collapsible-container {
  width: 100%;
}

.collapsible-content {
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.collapsible-toggle {
  background: rgba(55, 53, 47, 0.08);
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border: unset;
  font-weight: bold;
  font-size: 16px;
}

.description-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: end;
  gap: 10px;
}

.description-content {
  flex: 1;
  color: gray;
}

.description-link-source {
  width: 25px;
  height: 25px;
}
`;

export const createFavIcon = () => {
  // Create a <link> element to fav icon
  const favIcon = document.createElement("link");
  favIcon.setAttribute("rel", "icon");
  favIcon.setAttribute("type", "image/x-icon");
  favIcon.setAttribute("href", "/public/favicon.ico");
  // Append the <link> element to the <head>
  document.head.appendChild(favIcon);
};

export const setupStyles = () => {
  // Create a <style> element
  const styleElement = document.createElement("style");
  styleElement.appendChild(document.createTextNode(cssCode));

  // Create a <link> element to fav icon
  createFavIcon();

  // Append the <style> element to the <head>
  document.head.appendChild(styleElement);
};
