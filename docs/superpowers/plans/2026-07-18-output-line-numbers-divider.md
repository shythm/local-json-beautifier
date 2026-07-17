# Output Line Numbers and Hover Divider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add non-copyable line numbers to highlighted JSON output and show the workspace divider line only during hover, keyboard focus, or active dragging.

**Architecture:** Keep token escaping and highlighting in `json-utils`, then add a line-wrapping renderer that preserves real newline text. `App` supplies only the gutter digit width, while CSS generates visual numbers and controls divider visibility without changing resize behavior.

**Tech Stack:** React 19, TypeScript, Bezier semantic CSS tokens, Vitest, Testing Library, Vite

## Global Constraints

- Line numbers are one-based, visual-only, and excluded from selected text and Copy output.
- Existing JSON HTML escaping and syntax token spans remain unchanged.
- The empty-output placeholder has no line number.
- The divider retains its 14px hit area and all pointer/keyboard resizing behavior.
- The divider line is visible only on hover, `:focus-visible`, or `:active`.
- No dependency, parser, persistence, or formatter-state changes.

---

### Task 1: Produce safe line-wrapped highlighted HTML

**Files:**
- Modify: `src/json-utils.test.ts`
- Modify: `src/json-utils.ts`

**Interfaces:**
- Consumes: `highlightJson(formatted: string): string`.
- Produces: `highlightJsonWithLineNumbers(formatted: string): string`.

- [ ] **Step 1: Write the failing utility test**

Import `highlightJsonWithLineNumbers` and add a test that asserts one-based `data-line-number` attributes, highlighted token classes, and exact decoded DOM `textContent`. Extend escaping coverage to assert the new renderer contains `&lt;script&gt;` but not `<script>`.

- [ ] **Step 2: Verify RED**

Run:

```bash
npx vitest run src/json-utils.test.ts
```

Expected: FAIL because `highlightJsonWithLineNumbers` is not exported.

- [ ] **Step 3: Implement the line wrapper**

Add after `highlightJson`:

```ts
export function highlightJsonWithLineNumbers(formatted: string): string {
  return highlightJson(formatted)
    .split("\n")
    .map(
      (line, index) =>
        `<span class="code-line" data-line-number="${index + 1}">${line}</span>`,
    )
    .join("\n");
}
```

- [ ] **Step 4: Verify GREEN**

Run `npx vitest run src/json-utils.test.ts`. Expected: all utility tests pass.

### Task 2: Integrate line numbers and hover-only divider styling

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `tests/project-structure.test.mjs`

**Interfaces:**
- Consumes: `highlightJsonWithLineNumbers(formatted)` from Task 1.
- Produces: `.code-line[data-line-number]`, `--line-number-width`, and hover/focus/active divider states.

- [ ] **Step 1: Write failing component and CSS contract tests**

Add an App test that formats `{"ok":true}` and asserts three `.code-line` elements with line numbers `1`, `2`, `3`, while the formatted `pre.textContent` remains `'{\n  "ok": true\n}'`.

Add project-structure assertions for visual-only line-number content, inline line wrappers, default hidden divider opacity, and hover/focus/active selectors.

- [ ] **Step 2: Verify RED**

Run focused App and structure tests. Expected: FAIL because line elements and hidden-divider CSS do not exist.

- [ ] **Step 3: Integrate the renderer**

Replace the `highlightJson` import/use in `App.tsx` with `highlightJsonWithLineNumbers`. Derive:

```ts
const formattedLineCount = formatted ? formatted.split("\n").length : 0;
const lineNumberWidth = `${Math.max(2, String(formattedLineCount).length) + 1}ch`;
```

When formatted output exists, add class `numbered-output`, set `--line-number-width` through `CSSProperties`, and render `highlightJsonWithLineNumbers(formatted)`. Preserve `empty-output`, `data-stale`, and the original plain `formatted` copy payload.

- [ ] **Step 4: Add gutter and divider CSS**

Add:

```css
.code-line {
  display: inline;
}

.code-line::before {
  content: attr(data-line-number);
  display: inline-block;
  width: var(--line-number-width);
  margin-right: 16px;
  padding-right: 12px;
  border-right: 1px solid var(--color-border-neutral);
  color: var(--color-text-neutral-lighter);
  text-align: right;
  user-select: none;
  pointer-events: none;
}
```

Keep the line wrapper inline so the real newline separators preserve exact text without adding extra visual rows. Set `.workspace-divider::before` to `opacity: 0` with an opacity transition. Extend the visible-state selector to include `:active`, set `opacity: 1`, retain the focus color and four-pixel width, and leave the mobile `display: none` rule untouched.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: 0 failures, 0 type errors, and a successful Vite build.

### Task 3: Browser verification and publication

**Files:**
- Sync modified source/tests/docs to `/tmp/local-json-beautifier-publish-20260718`.

**Interfaces:**
- Consumes: complete line-number and divider implementation.
- Produces: verified `origin/main` commit and GitHub Pages deployment.

- [ ] **Step 1: Verify local browser behavior**

Load the sample at `http://127.0.0.1:12626/`. Verify line count equals formatted newline count, DOM text excludes line numbers, Copy returns plain JSON, divider pseudo opacity is zero at rest and one during focus/hover, resizing still works, light/dark colors are legible, and mobile hides the separator.

- [ ] **Step 2: Validate the publish checkout**

Run `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check` in the temporary checkout. Expected: all pass.

- [ ] **Step 3: Commit and deploy**

Commit with `feat: add formatted JSON line numbers`, push `main`, monitor the Pages workflow, confirm zero annotations, HTTP 200, and the same public-page behavior.
