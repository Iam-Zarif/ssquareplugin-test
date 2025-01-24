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
    top: 10px;
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
    <button id="edit-button">Edit</button>
    <button id="publish-style">Publish</button>
    <div id="progress-bar-container" style="display:none; margin-top:10px;">
      <div id="progress-bar" style="width: 0%; height: 10px; background-color: green;"></div>
    </div>
    <div id="color-palette">
      <input type="color" id="color-picker" value="#ff0000">
    </div>
  `;

  document.body.appendChild(widget);
  console.log("Widget UI created.");

  let selectedElement = null;

  // Event listener for selecting an element
  document.body.addEventListener("click", (e) => {
    if (e.target.closest("#style-widget")) return; // Prevent widget selection itself
    e.preventDefault();
    e.stopPropagation();

    selectedElement = e.target;

    console.log("Element clicked:", selectedElement);

    // Check if the selected element has a parent block ID (Squarespace dynamic blocks)
    let selector = getSelector(selectedElement);
    if (selectedElement.closest('[id^="block-"]')) {
      // If the element is inside a block, use the block's ID
      const block = selectedElement.closest('[id^="block-"]');
      selector = `#${block.id}`;
    }

    document.getElementById("edit-button").disabled = false;
    document.getElementById("edit-button").addEventListener("click", () => {
      // Show element in full-screen editing mode
      widget.style.display = "block";
      selectedElement.style.display = "none"; // Hide original element in edit mode

      // Use editable container for the selected element
      const editableElement = document.createElement("div");
      editableElement.setAttribute("contenteditable", "true");
      editableElement.style.cssText = "width: 100%; padding: 10px; border: 1px solid #ddd; background-color: #f4f4f4;";
      editableElement.innerHTML = selectedElement.outerHTML;

      document.body.appendChild(editableElement);

      console.log("Element is now in edit mode.");
    });
  });

  // Function to get a unique selector for an element
  function getSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.className) return `.${el.className.split(" ").join(".")}`;
    return el.tagName.toLowerCase();
  }

  // Show progress bar while saving styles globally
  function showProgressBar() {
    const progressBarContainer = document.getElementById("progress-bar-container");
    const progressBar = document.getElementById("progress-bar");

    progressBarContainer.style.display = "block";
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      progressBar.style.width = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          progressBarContainer.style.display = "none";
        }, 500);
      }
    }, 200);
  }

  // Save styles globally (persisted across routes)
  const publishStyleButton = document.getElementById("publish-style");
  publishStyleButton.addEventListener("click", async () => {
    const property = document.getElementById("color-picker").value.trim();

    console.log("Publish style clicked. Color:", property);

    if (property) {
      showProgressBar(); // Show progress bar

      try {
        const response = await fetch("http://localhost:3000/save-style", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selector: selectedElement.id, property: "color", value: property }),
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
      alert("Please select a color.");
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
