import { type PropsWithChildren, useSyncExternalStore } from "react";

import { AppProvider } from "@channel.io/bezier-react";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function subscribeToSystemTheme(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSystemTheme() {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light";
}

export default function SystemThemeProvider({ children }: PropsWithChildren) {
  const themeName = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
  );

  return <AppProvider themeName={themeName}>{children}</AppProvider>;
}
