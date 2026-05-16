const storageKey = "analyst-cheatsheet-theme";
const root = document.documentElement;
const savedTheme = localStorage.getItem(storageKey);
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

root.dataset.theme = savedTheme || preferredTheme;

function updateThemeButton() {
  const button = document.querySelector("[data-theme-toggle]");

  if (button) {
    button.textContent = root.dataset.theme === "dark" ? "Light" : "Dark";
  }
}

updateThemeButton();

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-theme-toggle]");

  if (!button) {
    return;
  }

  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(storageKey, root.dataset.theme);
  updateThemeButton();
});
