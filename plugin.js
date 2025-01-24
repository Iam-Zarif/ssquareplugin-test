(async function () {
  const isBaseDomain = window.location.pathname === "/";
  console.log("plugin Loaded from Zarif")
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
    display: ${isBaseDomain ? "none" : "block"}; /* Hide in base domain */
    z-index: 9999;
    font-family: Arial, sans-serif;
  `;

  widget.innerHTML = `
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
  `;

  document.body.appendChild(widget);

  const applyStyleButton = document.getElementById("apply-style");
  applyStyleButton.addEventListener("click", async () => {
    console.log("CLicked from Zarif")
    const selector = document.getElementById("element-selector").value.trim();
    const property = document.getElementById("css-property").value.trim();
    const value = document.getElementById("css-value").value.trim();

    if (selector && property && value) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => (el.style[property] = value));

      try {
        const response = await fetch("http://localhost:3000/save-style", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selector, property, value }),
        });
        console.log("Response",response)

        if (response.ok) {
          alert("Style saved successfully!");
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
  try {
    const response = await fetch("http://localhost:3000/get-styles");
    console.log("Response",response)
    if (!response.ok) {
      throw new Error("Failed to fetch saved styles.");
    }

    const savedStyles = await response.json();
    savedStyles.forEach(({ selector, property, value }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => (el.style[property] = value));
    });
  } catch (error) {
    console.error("Error fetching saved styles:", error);
    alert("An error occurred while fetching saved styles.");
  }
})();
