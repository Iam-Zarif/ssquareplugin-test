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
    <div id="progress-bar-container" style="display:none; margin-top:10px;">
      <div id="progress-bar" style="width: 0%; height: 10px; background-color: green;"></div>
    </div>
  `;

  document.body.appendChild(widget);
  console.log("Widget UI created.");

  let selectedElement = null;
  document.body.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent widget selection itself
    if (e.target.closest("#style-widget")) return;

    selectedElement = e.target;

    console.log("Element clicked:", selectedElement);

    // Check if the selected element has a parent block ID (Squarespace dynamic blocks)
    let selector = getSelector(selectedElement);
    if (selectedElement.closest('[id^="block-"]')) {
      // If the element is inside a block, use the block's ID
      const block = selectedElement.closest('[id^="block-"]');
      selector = `#${block.id}`;
    }

    document.getElementById("element-selector").value = selector;
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

  // Show progress bar while saving styles globally
  function showProgressBar() {
    const progressBarContainer = document.getElementById(
      "progress-bar-container"
    );
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
    const selector = document.getElementById("element-selector").value.trim();
    const property = document.getElementById("css-property").value.trim();
    const value = document.getElementById("css-value").value.trim();

    console.log("Publish style clicked. Values:", {
      selector,
      property,
      value,
    });

    if (selector && property && value) {
      showProgressBar(); // Show progress bar

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

  // Edit and save widget content
  const handleWidgetEdit = () => {
    const widgetContainer = document.getElementById(
      "block-5d6a7742ce845c4802c8"
    );
    const editButton = document.getElementById("edit-button");
    const widgetText = widgetContainer.querySelector(".widget-text");

    let isEditing = false;

    // Make the content editable
    const makeEditable = () => {
      isEditing = true;

      // Create a contenteditable div that keeps the same style and text as the widget
      const editableDiv = document.createElement("div");
      editableDiv.setAttribute("contenteditable", "true");
      editableDiv.setAttribute("style", widgetText.getAttribute("style")); // Preserve styles
      editableDiv.innerHTML = widgetText.innerHTML; // Copy the current content

      // Replace the widget text with the editable div
      widgetText.replaceWith(editableDiv);

      // Change the button to save
      editButton.innerText = "Save";
      editButton.removeEventListener("click", handleWidgetEdit);
      editButton.addEventListener("click", handleSaveClick);
    };

    // Handle saving the edited content
    const handleSaveClick = () => {
      const editedContent = document.querySelector(
        '[contenteditable="true"]'
      ).innerHTML;

      // Replace the editable div with a new h1 element
      const newWidgetText = document.createElement("h1");
      newWidgetText.classList.add("widget-text"); // Keep the same class for styling
      newWidgetText.innerHTML = editedContent;

      // Replace the editable div with the new h1 element
      widgetContainer.replaceChild(
        newWidgetText,
        document.querySelector('[contenteditable="true"]')
      );

      // Change the button back to "Edit"
      editButton.innerText = "Edit";
      editButton.removeEventListener("click", handleSaveClick);
      editButton.addEventListener("click", handleWidgetEdit);
    };

    // Initial click handler for the edit button
    editButton.addEventListener("click", function () {
      if (!isEditing) {
        makeEditable(); // Switch to edit mode
      }
    });
  };

  // Ensure the DOM is fully loaded before initializing the widget
  document.addEventListener("DOMContentLoaded", function () {
    handleWidgetEdit();
  });
})();
