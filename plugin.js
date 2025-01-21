(function () {
  const widgetStyles = `
    /* Widget styles */
    #custom-widget {
      position: absolute;
      top: 50px;
      left: 50px;
      z-index: 9999;
      background: #ffffff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      border: 1px solid #ccc;
      padding: 10px;
      width: 200px;
      display: none;
      cursor: grab;
    }
    #custom-widget header {
      background: #007bff;
      color: white;
      padding: 5px;
      font-size: 14px;
      cursor: move;
      text-align: center;
    }
    #custom-widget label {
      display: block;
      margin: 10px 0 5px;
      font-size: 12px;
    }
    #custom-widget input {
      width: 100%;
      padding: 5px;
      margin-bottom: 10px;
      box-sizing: border-box;
    }
    .highlighted-element {
      outline: 2px solid orange !important;
    }
  `;

  const widgetHTML = `
    <header>Widget Controls</header>
    <label for="bg-color">Background Color:</label>
    <input type="color" id="bg-color" />
    <label for="height">Height (px):</label>
    <input type="number" id="height" />
    <label for="width">Width (px):</label>
    <input type="number" id="width" />
  `;

  const createWidget = () => {
    // Inject styles
    const styleTag = document.createElement("style");
    styleTag.innerHTML = widgetStyles;
    document.head.appendChild(styleTag);

    // Create widget container
    const widget = document.createElement("div");
    widget.id = "custom-widget";
    widget.innerHTML = widgetHTML;
    document.body.appendChild(widget);

    let isDragging = false;
    let offsetX, offsetY;

    // Draggable logic
    const header = widget.querySelector("header");
    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - widget.offsetLeft;
      offsetY = e.clientY - widget.offsetTop;
      widget.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        widget.style.left = `${e.clientX - offsetX}px`;
        widget.style.top = `${e.clientY - offsetY}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      widget.style.cursor = "grab";
    });

    // Widget logic
    let selectedElement = null;
    document.addEventListener("click", (e) => {
      const target = e.target;

      if (target.id !== "custom-widget" && !widget.contains(target)) {
        if (selectedElement)
          selectedElement.classList.remove("highlighted-element");
        selectedElement = target;
        selectedElement.classList.add("highlighted-element");
        widget.style.display = "block";
        widget.style.left = `${e.clientX + 10}px`;
        widget.style.top = `${e.clientY + 10}px`;

        // Populate widget inputs with current styles
        const computedStyles = getComputedStyle(selectedElement);
        widget.querySelector("#bg-color").value = rgbToHex(
          computedStyles.backgroundColor
        );
        widget.querySelector("#height").value =
          parseInt(computedStyles.height, 10) || "";
        widget.querySelector("#width").value =
          parseInt(computedStyles.width, 10) || "";
      }
    });

    // Update styles on input change
    widget.querySelector("#bg-color").addEventListener("input", (e) => {
      if (selectedElement)
        selectedElement.style.backgroundColor = e.target.value;
    });

    widget.querySelector("#height").addEventListener("input", (e) => {
      if (selectedElement) selectedElement.style.height = `${e.target.value}px`;
    });

    widget.querySelector("#width").addEventListener("input", (e) => {
      if (selectedElement) selectedElement.style.width = `${e.target.value}px`;
    });
  };

  const rgbToHex = (rgb) => {
    const result = rgb
      .match(/\d+/g)
      .slice(0, 3)
      .map((x) => parseInt(x).toString(16).padStart(2, "0"))
      .join("");
    return `#${result}`;
  };

  // Initialize the widget on DOMContentLoaded
  if (document.readyState !== "loading") {
    createWidget();
  } else {
    document.addEventListener("DOMContentLoaded", createWidget);
  }
})();
