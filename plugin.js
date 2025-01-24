(async function () {
  const isBaseDomain = window.location.pathname === "/";
  console.log("isBaseDomain:", isBaseDomain);
  console.log("Current pathname:", window.location.pathname);

  console.log("Plugin Loaded: Configuring the widget...");

  // Create the widget UI
  const widget = document.createElement("div");
  widget.id = "style-widget";
  widget.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: white;
    border: 1px solid #ddd;
    padding: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    display: none; /* Initially hidden */
    z-index: 9999;
    font-family: Arial, sans-serif;
  `;

  widget.innerHTML = `
    <h4>Style Editor</h4>
    <label>
      Element Selector:
      <input id="element-selector" type="text" placeholder=".className or #id" />
    </label>
    <br />
    <label>
      CSS Property:
      <input id="css-property" type="text" placeholder="e.g., color" />
    </label>
    <br />
    <label>
      Value:
      <input id="css-value" type="text" placeholder="e.g., red" />
    </label>
    <br />
    <button id="apply-style">Apply</button>
    <button id="publish-style">Publish</button>
  `;

  document.body.appendChild(widget);
  console.log("Widget UI created.");

  let selectedElement = null;

  // Event listener for selecting an element
  document.body.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent widget selection itself
    if (e.target.closest("#style-widget")) return;

    selectedElement = e.target;

    console.log("Element clicked:", selectedElement);

    document.getElementById("element-selector").value =
      getSelector(selectedElement);
    widget.style.display = "block";
    console.log("Widget is now visible.");
  });

  // Function to get a unique selector for an element
  function getSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.className) return `.${el.className.split(" ").join(".")}`;
    return el.tagName.toLowerCase();
  }

  // Apply styles to the selected element
  const applyStyleButton = document.getElementById("apply-style");
  applyStyleButton.addEventListener("click", () => {
    const selector = document.getElementById("element-selector").value.trim();
    const property = document.getElementById("css-property").value.trim();
    const value = document.getElementById("css-value").value.trim();

    console.log("Apply style clicked. Values:", { selector, property, value });

    if (selector && property && value) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        el.style[property] = value;
        console.log(
          `Applied style ${property}: ${value} to elements matching ${selector}`
        );
      });
      alert("Style applied locally.");
    } else {
      alert("Please fill in all fields.");
    }
  });

  // Save styles globally (persisted across routes)
  const publishStyleButton = document.getElementById("publish-style");
  publishStyleButton.addEventListener("click", async () => {
    const selector = document.getElementById("element-selector").value.trim();
    const property = document.getElementById("css-property").value.trim();
    const value = document.getElementById("css-value").value.trim();

    console.log("Publish style clicked. Values:", {
      selector,
      property,
      value,
    });

    if (selector && property && value) {
      try {
        const response = await fetch("http://localhost:3000/save-style", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selector, property, value }),
        });
        console.log("Saving style to server...", response);

        if (response.ok) {
          console.log("Style saved globally.");
          alert("Style saved globally!");
        } else {
          throw new Error("Failed to save style.");
        }
      } catch (error) {
        console.error("Error saving style:", error);
        alert("An error occurred while saving style.");
      }
    } else {
      alert("Please fill in all fields.");
    }
  });

  // Fetch and apply saved styles globally on all routes
  try {
    const response = await fetch("http://localhost:3000/get-styles");
    console.log("Fetching saved styles...", response);

    if (!response.ok) throw new Error("Failed to fetch saved styles.");

    const savedStyles = await response.json();
    console.log("Saved styles fetched:", savedStyles);

    savedStyles.forEach(({ selector, property, value }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        el.style[property] = value;
        console.log(`Applied saved style ${property}: ${value} to ${selector}`);
      });
    });

    console.log("Saved styles applied globally.");
  } catch (error) {
    console.error("Error fetching saved styles:", error);
  }
})();
