import "./style.css";

interface Extension {
  id: number;
  name: string;
  description: string;
  logo: string;
  isActive: boolean;
}

type FilterType = "all" | "active" | "inactive";

let allExtensions: Extension[] = [];
let currentFilter: FilterType = "all";
let extensionIdToRemove: number | null = null;

const container = document.querySelector<HTMLUListElement>(
  ".extensions-container",
)!;
const modal = document.querySelector<HTMLDivElement>(".modal")!;
const overlay = document.querySelector<HTMLDivElement>(".overlay")!;
const btnCancel = document.querySelector<HTMLButtonElement>(".btn-cancel")!;
const btnConfirmDelete =
  document.querySelector<HTMLButtonElement>(".btn-danger")!;
const allBtn = document.querySelector<HTMLButtonElement>(".btn-all")!;
const activeBtn = document.querySelector<HTMLButtonElement>(".btn-active")!;
const inActiveBtn = document.querySelector<HTMLButtonElement>(".btn-inactive")!;
const themeBtn = document.querySelector<HTMLButtonElement>(".btn-theme")!;
const themeIcon = themeBtn.querySelector<HTMLImageElement>(".theme-icon")!;
const logoImg = document.querySelector<HTMLImageElement>(".logo-img")!;
const template = document.querySelector<HTMLTemplateElement>(
  "#extension-card-template",
)!;

async function loadExtensions(): Promise<void> {
  container.innerHTML = `<div class="loader"></div>`;

  try {
    const response = await fetch("./data/data.json");
    if (!response.ok) throw new Error("Failed to load JSON");

    allExtensions = (await response.json()) as Extension[];
    applyFilter();
  } catch (error) {
    console.error("Error populating cards:", error);
    container.innerHTML = `<div class="error-message"><h3>Oops!</h3><p>Could not load extensions.</p></div>`;
  }
}

function applyFilter(): void {
  let filtered: Extension[];

  if (currentFilter === "active") {
    filtered = allExtensions.filter((item) => item.isActive);
  } else if (currentFilter === "inactive") {
    filtered = allExtensions.filter((item) => !item.isActive);
  } else {
    filtered = allExtensions;
  }

  renderExtensions(filtered);
}

function renderExtensions(list: Extension[]): void {
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p class="empty-msg">No extensions found in this category.</p>`;
    return;
  }

  list.forEach((item) => {
    const clone = template.content.cloneNode(true) as DocumentFragment;

    (clone.querySelector(".card-name") as HTMLElement).textContent = item.name;
    (clone.querySelector(".card-description") as HTMLElement).textContent =
      item.description;

    const img = clone.querySelector<HTMLImageElement>(".ext-img")!;
    img.src = item.logo;
    img.alt = item.name;

    const checkbox = clone.querySelector<HTMLInputElement>(".switch-input")!;
    checkbox.id = `switch-${item.id}`;
    checkbox.checked = item.isActive;
    checkbox.addEventListener("change", (e) => {
      item.isActive = (e.target as HTMLInputElement).checked;
      applyFilter();
    });

    const label = clone.querySelector<HTMLLabelElement>(".switch-label")!;
    label.setAttribute("for", `switch-${item.id}`);
    label.textContent = `Enable ${item.name}`;

    container.appendChild(clone);
  });
}

const filterButtons = document.querySelectorAll<HTMLButtonElement>(
  ".btn-container .btn",
);

function setActiveFilter(btn: HTMLButtonElement): void {
  filterButtons.forEach((b) => b.setAttribute("aria-pressed", "false"));
  btn.setAttribute("aria-pressed", "true");
}

allBtn.addEventListener("click", () => {
  currentFilter = "all";
  setActiveFilter(allBtn);
  applyFilter();
});

activeBtn.addEventListener("click", () => {
  currentFilter = "active";
  setActiveFilter(activeBtn);
  applyFilter();
});

inActiveBtn.addEventListener("click", () => {
  currentFilter = "inactive";
  setActiveFilter(inActiveBtn);
  applyFilter();
});

// Modal
function openModal(): void {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function closeModal(): void {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
  extensionIdToRemove = null;
}

container.addEventListener("click", (e) => {
  const btnRemove = (e.target as Element).closest<HTMLButtonElement>(
    ".btn-remove",
  );
  if (!btnRemove) return;

  const card = btnRemove.closest<HTMLElement>(".card")!;
  const checkbox = card.querySelector<HTMLInputElement>(".switch-input")!;
  extensionIdToRemove = Number(checkbox.id.replace("switch-", ""));
  openModal();
});

btnConfirmDelete.addEventListener("click", () => {
  if (extensionIdToRemove === null) return;

  allExtensions = allExtensions.filter((ext) => ext.id !== extensionIdToRemove);
  extensionIdToRemove = null;
  closeModal();
  applyFilter();
});

btnCancel.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

// Theme
function getCurrentTheme(): "dark" | "light" {
  const saved = localStorage.getItem("ext");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function loadTheme(theme: "dark" | "light"): void {
  themeBtn.setAttribute("aria-checked", String(theme === "dark"));

  if (theme === "light") {
    themeIcon.src = "/images/icon-moon.svg";
    logoImg.src = "/images/logo-light.svg";
  } else {
    themeIcon.src = "/images/icon-sun.svg";
    logoImg.src = "/images/logo-dark.svg";
  }

  document.documentElement.setAttribute("color-scheme", theme);
}

themeBtn.addEventListener("click", () => {
  const next = getCurrentTheme() === "dark" ? "light" : "dark";
  localStorage.setItem("ext", next);
  loadTheme(next);
});

window.addEventListener("DOMContentLoaded", () => {
  loadTheme(getCurrentTheme());
  loadExtensions();
});
