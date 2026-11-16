import test from "node:test";
import assert from "node:assert/strict";

import {
  getResolvedTheme,
  getStoredThemePreference,
  normalizeThemePreference,
  resolveTheme,
  saveThemePreference,
  subscribeToThemeChanges,
  THEME_CHANGE_EVENT,
  THEME_PREFERENCE_KEY
} from "../src/features/shared/theme/themePreference.js";

function withMockedWindow(initialTheme, run) {
  const originalWindow = globalThis.window;
  const values = new Map();
  const windowListeners = new Map();
  const mediaListeners = new Set();
  const media = {
    matches: initialTheme === "dark",
    addEventListener(type, listener) {
      if (type === "change") mediaListeners.add(listener);
    },
    removeEventListener(type, listener) {
      if (type === "change") mediaListeners.delete(listener);
    }
  };
  globalThis.window = {
    localStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); },
      removeItem(key) { values.delete(key); }
    },
    matchMedia(query) {
      assert.equal(query, "(prefers-color-scheme: dark)");
      return media;
    },
    addEventListener(type, listener) {
      const listeners = windowListeners.get(type) || new Set();
      listeners.add(listener);
      windowListeners.set(type, listeners);
    },
    removeEventListener(type, listener) {
      windowListeners.get(type)?.delete(listener);
    },
    dispatchEvent(event) {
      for (const listener of windowListeners.get(event.type) || []) listener(event);
      return true;
    }
  };

  const setSystemTheme = (theme) => {
    media.matches = theme === "dark";
    for (const listener of mediaListeners) listener({ matches: media.matches });
  };

  return Promise.resolve()
    .then(() => run({ values, media, setSystemTheme, windowListeners, mediaListeners }))
    .finally(() => {
      if (originalWindow === undefined) delete globalThis.window;
      else globalThis.window = originalWindow;
    });
}

test("system preference determines the theme when no manual preference is saved", async () => {
  await withMockedWindow("dark", async () => {
    assert.equal(getStoredThemePreference(), null);
    assert.equal(getResolvedTheme(), "dark");
    saveThemePreference("light");
    assert.equal(getResolvedTheme(), "light");
  });

  await withMockedWindow("light", async () => {
    assert.equal(getResolvedTheme(), "light");
  });
});

test("a manually selected theme takes priority over the device setting", async () => {
  await withMockedWindow("dark", async ({ setSystemTheme }) => {
    saveThemePreference("light");
    assert.equal(getResolvedTheme(), "light");

    setSystemTheme("light");
    assert.equal(getResolvedTheme(), "light");

    setSystemTheme("dark");
    assert.equal(getResolvedTheme(), "light");
  });
});

test("automatic theme follows system changes until a manual choice is made", async () => {
  await withMockedWindow("light", async ({ setSystemTheme }) => {
    const observed = [];
    const unsubscribe = subscribeToThemeChanges((theme) => observed.push(theme));

    setSystemTheme("dark");
    setSystemTheme("light");

    assert.deepEqual(observed, ["light", "dark", "light"]);
    unsubscribe();
    setSystemTheme("dark");
    assert.deepEqual(observed, ["light", "dark", "light"]);
  });
});

test("manual theme toggle persists and synchronizes all portal theme providers", async () => {
  await withMockedWindow("light", async ({ values }) => {
    const firstProvider = [];
    const secondProvider = [];
    const stopFirst = subscribeToThemeChanges((theme) => firstProvider.push(theme));
    const stopSecond = subscribeToThemeChanges((theme) => secondProvider.push(theme));

    saveThemePreference("dark");

    assert.equal(values.get(THEME_PREFERENCE_KEY), "dark");
    assert.equal(firstProvider.at(-1), "dark");
    assert.equal(secondProvider.at(-1), "dark");

    stopFirst();
    stopSecond();
  });
});

test("unsupported preference values are ignored and cannot be saved", async () => {
  assert.equal(normalizeThemePreference("system"), null);
  assert.equal(normalizeThemePreference("sepia"), null);
  assert.equal(resolveTheme({ preference: "sepia", prefersDark: true }), "dark");

  await withMockedWindow("dark", async ({ values }) => {
    await assert.rejects(
      Promise.resolve().then(() => saveThemePreference("sepia")),
      (error) => error instanceof TypeError
    );
    assert.equal(values.has(THEME_PREFERENCE_KEY), false);
  });
});

test("the legacy automatically stored theme does not override device preference", async () => {
  await withMockedWindow("dark", async ({ values }) => {
    values.set("ltsu-theme", "light");
    assert.equal(getResolvedTheme(), "dark");
  });
});

test("theme change events use the expected shared event name", () => {
  assert.equal(THEME_CHANGE_EVENT, "ltsu-theme-change");
});
