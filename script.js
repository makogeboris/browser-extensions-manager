"use strict";

async function loadExtensions() {
  const container = document.querySelector(".extensions-container");
  const template = document.querySelector("#extension-card-template");

  container.innerHTML = `<div class="loader"></div>`;

  try {
    const response = await fetch("data.json");

    if (!response.ok) throw new Error("Failed to load JSON");

    const extensionData = await response.json();

    container.innerHTML = "";

    extensionData.forEach((item) => {
      const clone = template.content.cloneNode(true);

      clone.querySelector(".card-name").textContent = item.name;
      clone.querySelector(".card-description").textContent = item.description;

      const img = clone.querySelector(".ext-img");
      img.src = item.logo;
      img.alt = item.name;

      const checkbox = clone.querySelector(".switch-input");
      checkbox.id = `switch-${item.id}`;
      checkbox.checked = item.isActive;

      const label = clone.querySelector(".switch-label");
      label.setAttribute("for", `switch-${item.id}`);
      label.textContent = `Enable ${item.name}`;

      container.appendChild(clone);
    });
  } catch (error) {
    console.error("Error populating cards:", error);

    container.innerHTML = `
      <div class="error-message">
        <h3>Oops! Something went wrong.</h3>
        <p>We couldn't load the extensions. Please try refreshing the page.</p>
      </div>
    `;
  }
}

loadExtensions();
