export type Theme = "light" | "dark";

export const THEME_KEY = "fadarhy-theme";

/**
 * Runs inline in <head> before first paint, so a saved choice applies
 * without a flash of the wrong theme. Without a saved choice the CSS
 * follows the system setting.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode or blocked storage: the choice lasts for this page only.
  }
}
