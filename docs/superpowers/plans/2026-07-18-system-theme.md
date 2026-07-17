# System Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Bezier application follow the operating system light/dark preference on load and while the preference changes.

**Architecture:** A focused `SystemThemeProvider` owns the `matchMedia` subscription and passes a derived `light | dark` value to Bezier's `AppProvider`. The application and token-driven stylesheet remain unaware of theme detection.

**Tech Stack:** React 19, TypeScript, Bezier React 4 next.12, Vitest, Testing Library, Vite

## Global Constraints

- Use `(prefers-color-scheme: dark)` as the only theme source.
- Reflect system changes immediately without reload.
- Do not add a manual toggle, local storage, external request, or formatter-state change.
- Keep `@channel.io/bezier-react@4.0.0-next.12` and all existing behavior unchanged.

---

### Task 1: Add the system-aware Bezier provider

**Files:**
- Create: `src/SystemThemeProvider.test.tsx`
- Create: `src/SystemThemeProvider.tsx`
- Modify: `src/main.tsx`
- Modify: `tests/project-structure.test.mjs`

**Interfaces:**
- Produces: `SystemThemeProvider({ children }: PropsWithChildren): ReactElement`
- Consumes: `window.matchMedia` and Bezier `AppProvider`.

- [ ] **Step 1: Write failing tests**

Create a controllable `matchMedia` stub that records the `change` listener. Test initial light, initial dark, live transition, and cleanup by rendering `SystemThemeProvider` around a stable child and asserting `document.documentElement.dataset.bezierTheme`.

- [ ] **Step 2: Verify RED**

Run `npx vitest run src/SystemThemeProvider.test.tsx` and expect module-not-found failure because the provider does not exist.

- [ ] **Step 3: Implement the provider**

Use `useSyncExternalStore` with:

```tsx
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light";
}
```

Render `<AppProvider themeName={themeName}>{children}</AppProvider>` and update `src/main.tsx` to use this component.

- [ ] **Step 4: Add the source contract**

Update the project structure test to require `src/SystemThemeProvider.tsx`, the exact media query, and `<SystemThemeProvider>` in `src/main.tsx` while rejecting a fixed `AppProvider themeName` there.

- [ ] **Step 5: Verify GREEN**

Run the focused provider tests, full tests, typecheck, and production build. Expect all commands to exit 0.

### Task 2: Verify and publish

**Files:**
- Sync the provider, tests, main entry, source contract, spec, and plan to `/tmp/local-json-beautifier-publish-20260718`.

**Interfaces:**
- Consumes: the verified system-aware provider.
- Produces: commit on `origin/main` and a deployed Pages build.

- [ ] **Step 1: Browser validation**

At `http://127.0.0.1:12626/`, emulate light and dark `prefers-color-scheme`, verify `data-bezier-theme`, representative surface colors, unchanged input content, and zero console errors.

- [ ] **Step 2: Validate the publish checkout**

Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run build` in the temporary checkout.

- [ ] **Step 3: Commit and push**

Commit with `feat: follow system color scheme`, push `main`, monitor GitHub Pages, and verify the public URL returns the system-aware app.
