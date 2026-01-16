"use strict";

async function loadExtensions() {
  const container = document.querySelector(".extensions-container");
  const template = document.querySelector("#extension-card-template");

  container.innerHTML = `<div class="loader"></div>`;

  try {
    const response = await fetch("data.json");

    if (!response.ok) throw new Error("Failed to load JSON");

    const data = await response.json();

    container.innerHTML = "";

    data.forEach((item) => {
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

const themeBtn = document.querySelector(".btn-theme");
const themeIcon = themeBtn.querySelector(".theme-icon");
const logo = document.querySelector(".logo-img");

function getCurrentTheme() {
  const savedTheme = localStorage.getItem("ext");
  if (savedTheme) return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function loadTheme(theme) {
  const root = document.documentElement;

  themeBtn.setAttribute("aria-checked", theme === "dark" ? "true" : "false");

  if (theme === "light") {
    themeIcon.src = "assets/images/icon-moon.svg";
    logo.src = "assets/images/logo-light.svg";
  } else {
    themeIcon.src = "assets/images/icon-sun.svg";
    logo.src = "assets/images/logo-dark.svg";
  }

  root.setAttribute("color-scheme", theme);
}

themeBtn.addEventListener("click", () => {
  const current = getCurrentTheme();
  const nextTheme = current === "dark" ? "light" : "dark";

  localStorage.setItem("ext", nextTheme);

  loadTheme(nextTheme);
});

window.addEventListener("DOMContentLoaded", () => {
  loadTheme(getCurrentTheme());
});

const filterButtons = document.querySelectorAll(".btn-container .btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.setAttribute("aria-pressed", "false"));

    button.setAttribute("aria-pressed", "true");
  });
});

const container = document.querySelector(".extensions-container");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const btnCancel = document.querySelector(".btn-cancel");

container.addEventListener("click", function (e) {
  const btnRemove = e.target.closest(".btn-remove");

  if (btnRemove) {
    openModal();
  }
});

function openModal() {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
}

btnCancel.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});
