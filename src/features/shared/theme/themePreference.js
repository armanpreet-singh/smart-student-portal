export const THEME_PREFERENCE_KEY = "ltsu-theme-preference";
export const THEME_CHANGE_EVENT = "ltsu-theme-change";

const VALID_THEMES = new Set(["light", "dark"]);

export function normalizeThemePreference(value) {
  return VALID_THEMES.has(value) ? value : null;
}

export function resolveTheme({ preference, prefersDark = false } = {}) {
  const savedPreference = normalizeThemePreference(preference);
  if (savedPreference) return savedPreference;
  return prefersDark ? "dark" : "light";
}

function getBrowserStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function getStoredThemePreference() {
  const storage = getBrowserStorage();
  if (!storage) return null;
  try {
    return normalizeThemePreference(storage.getItem(THEME_PREFERENCE_KEY));
  } catch {
    return null;
  }
}

export function getResolvedTheme() {
  const prefersDark = typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return resolveTheme({
    preference: getStoredThemePreference(),
    prefersDark
  });
}

export function saveThemePreference(theme) {
  const preference = normalizeThemePreference(theme);
  if (!preference) {
    throw new TypeError("Theme preference must be light or dark.");
  }
  const storage = getBrowserStorage();
  try {
    storage?.setItem(THEME_PREFERENCE_KEY, preference);
  } catch {
    // The in-memory theme still changes when browser storage is unavailable.
  }
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }
  return preference;
}

export function subscribeToThemeChanges(onChange) {
  if (typeof window === "undefined" || typeof onChange !== "function") {
    return () => {};
  }

  const media = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  const update = () => {
    onChange(resolveTheme({
      preference: getStoredThemePreference(),
      prefersDark: Boolean(media?.matches)
    }));
  };

  window.addEventListener(THEME_CHANGE_EVENT, update);
  media?.addEventListener?.("change", update);
  media?.addListener?.(update);
  update();

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, update);
    media?.removeEventListener?.("change", update);
    media?.removeListener?.(update);
  };
}
