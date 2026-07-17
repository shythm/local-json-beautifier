# Bezier-first UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the JSON beautifier's product chrome with `@channel.io/bezier-react@4.0.0-next.12` while preserving its native code editor, formatter behavior, accessibility, privacy, and GitHub Pages delivery.

**Architecture:** `src/main.tsx` supplies Bezier's dark `AppProvider`; `src/App.tsx` uses beta Bezier controls and typography while retaining the explicit formatter state machine; `src/styles.css` owns only responsive layout, native editor styling, and syntax colors expressed on top of Bezier semantic tokens. Pure formatting remains isolated in `src/json-utils.ts`.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, `@channel.io/bezier-react@4.0.0-next.12`, `@channel.io/bezier-icons@0.60.0`, Vitest, Testing Library, Node test runner, GitHub Pages

## Global Constraints

- Pin `@channel.io/bezier-react` to exactly `4.0.0-next.12` and `@channel.io/bezier-icons` to exactly `0.60.0`.
- Import `@channel.io/bezier-react/styles.css` before `src/styles.css` and use `AppProvider themeName="dark"`.
- Use beta Bezier exports for Button, Select, SelectOption, Text, and Badge; do not introduce deprecated legacy controls.
- Keep the native `textarea` source editor and native `pre` highlighted output.
- Preserve the 250 ms debounce, indentation storage, stale last-valid result, copy/sample/clear behavior, live status, error alert, and all current accessible names.
- Do not add APIs, telemetry, JSON persistence, runtime CDN assets, or external fonts.
- Keep the Vite production base `/local-json-beautifier/` and local port `12626`.

---

### Task 1: Pin Bezier and establish the dark provider

**Files:**
- Modify: `tests/project-structure.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: Vite's existing `#root` mount and `App` default export.
- Produces: a Bezier theme context around every production render and exact package versions available to later tasks.

- [ ] **Step 1: Write the failing dependency and provider contract test**

Update the dependency assertion in `tests/project-structure.test.mjs` to require the four runtime packages and add source-level provider checks:

```js
assert.deepEqual(Object.keys(packageJson.dependencies).sort(), [
  "@channel.io/bezier-icons",
  "@channel.io/bezier-react",
  "react",
  "react-dom",
]);
assert.equal(packageJson.dependencies["@channel.io/bezier-react"], "4.0.0-next.12");
assert.equal(packageJson.dependencies["@channel.io/bezier-icons"], "0.60.0");

const mainSource = readRequired("src/main.tsx");
assert.match(mainSource, /@channel\.io\/bezier-react\/styles\.css/);
assert.match(mainSource, /<AppProvider themeName="dark">/);
```

- [ ] **Step 2: Run the contract test and verify RED**

Run:

```bash
node --test tests/project-structure.test.mjs
```

Expected: FAIL because the Bezier dependencies and provider import do not exist.

- [ ] **Step 3: Install the exact dependencies**

Run:

```bash
npm install --save-exact @channel.io/bezier-react@4.0.0-next.12 @channel.io/bezier-icons@0.60.0 --cache /tmp/npm-cache-codex
```

Expected: `package.json` and `package-lock.json` record both exact versions without changing the pinned React versions.

- [ ] **Step 4: Add the production provider and stylesheet order**

Change `src/main.tsx` imports and render tree to:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProvider } from "@channel.io/bezier-react";
import "@channel.io/bezier-react/styles.css";

import App from "./App";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Application root element is missing");
}

createRoot(root).render(
  <StrictMode>
    <AppProvider themeName="dark">
      <App />
    </AppProvider>
  </StrictMode>,
);
```

- [ ] **Step 5: Run the contract test and type checker and verify GREEN**

Run:

```bash
node --test tests/project-structure.test.mjs
npm run typecheck
```

Expected: both commands pass with no warnings or type errors.

### Task 2: Migrate the toolbar and status surfaces to Bezier controls

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `AppProvider` from Task 1 and existing `JsonIndent`/formatter functions.
- Produces: Bezier beta buttons, Select, Text, and Badge without changing formatter state transitions or accessible names.

- [ ] **Step 1: Make the application tests render in the Bezier context**

Add the provider import and a local render helper in `src/App.test.tsx`, then replace each `render(<App />)` call with `renderApp()`:

```tsx
import { AppProvider } from "@channel.io/bezier-react";

function renderApp() {
  return render(
    <AppProvider themeName="dark">
      <App />
    </AppProvider>,
  );
}
```

This is test scaffolding for the required provider, not a new behavior assertion.

- [ ] **Step 2: Write a failing Bezier Select interaction test**

Replace the native `fireEvent.change` portion of the indentation test with the intended accessible interaction:

```tsx
fireEvent.click(screen.getByRole("button", { name: "Indentation" }));
fireEvent.click(await screen.findByRole("option", { name: "4 spaces" }));

expect(screen.getByLabelText("Formatted JSON").textContent).toContain(
  '\n    "ok": true',
);
expect(localStorage.getItem("json-beautifier-indent")).toBe("4");
```

Also add a focused control contract test:

```tsx
it("exposes the Bezier toolbar actions with their existing accessible names", () => {
  renderApp();

  expect(screen.getByRole("button", { name: "Indentation" })).toHaveTextContent(
    "2 spaces",
  );
  expect(screen.getByRole("button", { name: "Load sample" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "Clear input" })).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Copy formatted JSON" }),
  ).toBeDisabled();
});
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
npx vitest run src/App.test.tsx -t "reformats immediately|exposes the Bezier toolbar"
```

Expected: FAIL because indentation is still a native combobox rather than a Bezier button-based Select.

- [ ] **Step 4: Replace controls and typography with beta components**

Import the Bezier beta components:

```tsx
import {
  Badge,
  Button,
  Select,
  SelectOption,
  Text,
} from "@channel.io/bezier-react/beta";
```

Replace the native indentation select with a controlled Bezier Select that keeps its accessible name:

```tsx
<label className="select-label">
  <Text as="span" typo="12" color="text-neutral-lighter">
    Indentation
  </Text>
  <Select
    aria-label="Indentation"
    value={indent === "\t" ? "tab" : String(indent)}
    onValueChange={handleIndentChange}
    triggerSize="m"
    dropdownWidth={160}
  >
    <SelectOption value="2" label="2 spaces" />
    <SelectOption value="4" label="4 spaces" />
    <SelectOption value="tab" label="Tab" />
  </Select>
</label>
```

Replace each native toolbar button with a beta `Button`, preserving labels, handlers, disabled state, type, and copy aria-label. Use `variant="filled" semantic="secondary"` for sample and clear and `variant="filled" semantic="primary"` for copy. For copy, set `label` to `Copied` only after success and keep `aria-label="Copy formatted JSON"`.

Use beta `Text` for headings and supporting copy where its `as` prop preserves the existing semantic element. Use beta `Badge size="s" variant="green"` for `Local-only processing` and `Badge size="s" variant="red"` for `Last valid result`. Preserve the `role="status"`, `role="alert"`, semantic sections/articles, editor label, output aria-label, and all formatter handlers exactly.

- [ ] **Step 5: Run all component tests and verify GREEN**

Run:

```bash
npx vitest run src/App.test.tsx
```

Expected: all application interaction tests pass without React warnings.

- [ ] **Step 6: Run type checking before styling**

Run:

```bash
npm run typecheck
```

Expected: PASS, confirming all beta component prop names match `next.12`.

### Task 3: Replace the custom theme with Bezier semantic tokens

**Files:**
- Modify: `tests/project-structure.test.mjs`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: class names and Bezier component markup from Task 2.
- Produces: responsive Bezier-first surfaces plus native editor and syntax-highlight styling.

- [ ] **Step 1: Write the failing stylesheet contract**

Add these checks to `tests/project-structure.test.mjs`:

```js
const styles = readRequired("src/styles.css");
assert.match(styles, /var\(--color-surface\)/);
assert.match(styles, /var\(--color-surface-high\)/);
assert.match(styles, /var\(--color-border-neutral\)/);
assert.match(styles, /var\(--color-text-neutral\)/);
assert.match(styles, /var\(--color-state-focus\)/);
assert.doesNotMatch(styles, /--bg:/);
assert.doesNotMatch(styles, /--surface:/);
assert.doesNotMatch(styles, /font-family:\s*Inter/);
assert.doesNotMatch(styles, /https?:\/\//);
```

- [ ] **Step 2: Run the contract test and verify RED**

Run:

```bash
node --test tests/project-structure.test.mjs
```

Expected: FAIL because `src/styles.css` still defines the old custom theme variables.

- [ ] **Step 3: Rewrite the stylesheet around Bezier tokens**

Keep the existing responsive class structure, but make these concrete changes:

```css
:root {
  --editor-font: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  --syntax-key: #78a9ff;
  --syntax-string: #8bdc65;
  --syntax-number: #f0b96a;
  --syntax-boolean: #c79bf2;
  --syntax-null: #f28eae;
  --syntax-punctuation: #8996a3;
}

html {
  background: var(--color-surface);
  color-scheme: dark;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background: var(--color-surface);
  color: var(--color-text-neutral);
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.panel {
  border: 1px solid var(--color-border-neutral);
  border-radius: var(--radius-16);
  background: var(--color-surface-low);
  box-shadow: var(--elevation-2);
}

.panel-header {
  border-bottom: 1px solid var(--color-border-neutral);
  background: var(--color-surface-high);
}

textarea:focus-visible {
  outline: 2px solid var(--color-state-focus);
  outline-offset: -2px;
}
```

Use Bezier semantic variables for every non-syntax background, text, border, focus, error, and status color. Preserve the two-column workspace, `min-height: 520px`, editor scrolling, stale opacity, mobile breakpoints at 900px and 760px, and reduced-motion rule. Remove styling that duplicates Bezier Button, Select, Text, and Badge internals.

- [ ] **Step 4: Run structural, component, and type validation and verify GREEN**

Run:

```bash
node --test tests/project-structure.test.mjs
npx vitest run src/App.test.tsx
npm run typecheck
```

Expected: all commands pass with no warnings.

### Task 4: Verify the production experience and publish

**Files:**
- Modify if required by evidence: `src/App.tsx`, `src/styles.css`, `src/App.test.tsx`
- Sync to publish checkout: `/tmp/local-json-beautifier-publish-20260718`

**Interfaces:**
- Consumes: the complete Bezier-first application from Tasks 1–3.
- Produces: a verified local and GitHub Pages deployment.

- [ ] **Step 1: Run the complete automated validation**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: all Vitest and Node tests pass, TypeScript reports no errors, and Vite emits `dist` successfully.

- [ ] **Step 2: Verify production asset and privacy contracts**

Run:

```bash
rg '/local-json-beautifier/' dist/index.html
rg -n 'https?://|fonts\.google|cdn' src index.html dist/index.html
```

Expected: built assets use `/local-json-beautifier/`; no runtime font, telemetry, or CDN URL exists in application source or `index.html`.

- [ ] **Step 3: Run the app on port 12626 and inspect it in the in-app browser**

Run `npm run dev`, open `http://127.0.0.1:12626/`, and verify:

- dark Bezier theme and token-driven panels render without missing styles;
- the Indentation Select works by mouse and keyboard;
- typing waits 250 ms before formatting;
- valid and invalid JSON, stale output, sample, clear, and copy work;
- focus rings and accessible names remain visible/available;
- at a narrow viewport the toolbar wraps and panels stack without horizontal page overflow.

Expected: no browser console errors or runtime network requests other than local Vite resources.

- [ ] **Step 4: Review the final diff**

Run:

```bash
git diff -- package.json package-lock.json src/main.tsx src/App.tsx src/App.test.tsx src/styles.css tests/project-structure.test.mjs docs/superpowers/specs/2026-07-18-bezier-first-ui-design.md docs/superpowers/plans/2026-07-18-bezier-first-ui.md
```

If the workspace still lacks writable Git metadata, compare the same files against the temporary publish checkout. Expected: only the Bezier migration, its tests, and its documentation changed; `src/json-utils.ts` and deployment configuration are unchanged.

- [ ] **Step 5: Sync and validate the temporary publish checkout**

Copy only the reviewed changed files and the updated lockfile into `/tmp/local-json-beautifier-publish-20260718`, then run there:

```bash
npm ci --cache /tmp/npm-cache-codex
npm test
npm run typecheck
npm run build
git status --short
```

Expected: clean validation and a status containing only the intentional Bezier migration files.

- [ ] **Step 6: Commit and push**

Run in the publish checkout:

```bash
git add package.json package-lock.json src/main.tsx src/App.tsx src/App.test.tsx src/styles.css tests/project-structure.test.mjs docs/superpowers/specs/2026-07-18-bezier-first-ui-design.md docs/superpowers/plans/2026-07-18-bezier-first-ui.md
git commit -m "feat: adopt Bezier-first interface"
git push origin main
```

Expected: one intentional commit is pushed to `main` without force.

- [ ] **Step 7: Verify GitHub Pages**

Monitor the new Actions run until build and deploy succeed, then open `https://shythm.github.io/local-json-beautifier/` and repeat the primary formatter flow.

Expected: the workflow has zero failing jobs and the public site serves the Bezier-first interface with HTTP 200.
