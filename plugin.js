(function () {
  function loadPluginApp() {
    // Check if the script is already loaded
    if (document.getElementById("plugin-widget")) return;

    // Inject the main script and styles
    const style = document.createElement("style");
    style.textContent = `
      #plugin-widget {
        position: fixed;
        top: 10px;
        right: 10px;
        width: 200px;
        background: #ffffff;
        border: 2px solid #000;
        z-index: 9999;
        padding: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        cursor: move;
      }
      #plugin-widget h4 {
        margin: 0 0 10px;
        font-size: 16px;
      }
      #plugin-widget button {
        margin: 5px 0;
        padding: 8px;
        width: 100%;
        border: none;
        background-color: #007bff;
        color: white;
        cursor: pointer;
        font-size: 14px;
      }
      #plugin-widget button:hover {
        background-color: #0056b3;
      }
      .highlighted {
        border: 2px dashed orange !important;
      }
    `;
    document.head.appendChild(style);

    const widget = document.createElement("div");
    widget.id = "plugin-widget";
    widget.innerHTML = `
      <h4>Style Editor</h4>
      <button id="change-bg">Change BG Color</button>
      <button id="change-size">Change Size</button>
      <button id="reset-style">Reset</button>
    `;
    document.body.appendChild(widget);

    // Drag functionality for the widget
    widget.addEventListener("mousedown", (e) => {
      let shiftX = e.clientX - widget.getBoundingClientRect().left;
      let shiftY = e.clientY - widget.getBoundingClientRect().top;

      function moveAt(pageX, pageY) {
        widget.style.left = pageX - shiftX + "px";
        widget.style.top = pageY - shiftY + "px";
      }

      function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
      }

      document.addEventListener("mousemove", onMouseMove);
      widget.onmouseup = function () {
        document.removeEventListener("mousemove", onMouseMove);
        widget.onmouseup = null;
      };
    });

    widget.ondragstart = function () {
      return false;
    };

    // Style change logic
    let selectedElement = null;

    document.body.addEventListener("click", (e) => {
      if (e.target.id === "plugin-widget" || widget.contains(e.target)) return;

      if (selectedElement) {
        selectedElement.classList.remove("highlighted");
      }
      selectedElement = e.target;
      selectedElement.classList.add("highlighted");
    });

    document.getElementById("change-bg").addEventListener("click", () => {
      if (selectedElement) {
        selectedElement.style.backgroundColor = "yellow";
      }
    });

    document.getElementById("change-size").addEventListener("click", () => {
      if (selectedElement) {
        selectedElement.style.width = "200px";
        selectedElement.style.height = "200px";
      }
    });

    document.getElementById("reset-style").addEventListener("click", () => {
      if (selectedElement) {
        selectedElement.removeAttribute("style");
        selectedElement.classList.remove("highlighted");
        selectedElement = null;
      }
    });
  }

  // Load the plugin when the DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadPluginApp);
  } else {
    loadPluginApp();
  }
})();
