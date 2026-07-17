# Local JSON Beautifier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-only, responsive JSON formatter with automatic formatting, safe syntax highlighting, selectable indentation, error locations, and copy/clear/sample actions.

**Architecture:** A single-route React/Vite app owns the interface and debounced state. Pure utilities parse, format, locate errors, escape content, and generate syntax markup so behavior is independently testable and user JSON can never become executable HTML.

**Tech Stack:** TypeScript, React, Vite/Sites starter, Vitest, Testing Library, CSS

## Global Constraints

- Perform all JSON processing in the browser with no API, telemetry, database, authentication, or network-dependent runtime assets.
- Format 250 ms after the latest input change.
- Support indentation with two spaces, four spaces, or one tab.
- Preserve the last valid result and mark it stale while current input is invalid.
- Store only the indentation preference in local storage; never persist JSON input.
- Use a responsive split layout that stacks on narrow screens and remains fully keyboard accessible.

---

### Task 1: Safe JSON Formatting Core

**Files:**
- Create: `app/json-utils.test.ts`
- Create: `app/json-utils.ts`

**Interfaces:**
- Produces: `formatJson(source: string, indent: JsonIndent): FormatResult`, `highlightJson(formatted: string): string`, and `getErrorLocation(source: string, error: unknown): ErrorLocation | null`.

- [ ] **Step 1: Write failing utility tests**

Test empty input, valid two-space/four-space/tab output, invalid input with line and column, token classes, and escaping of `<script>` inside JSON strings. The desired API is:

```ts
expect(formatJson('{"ok":true}', 2)).toEqual({
  status: 'valid',
  formatted: '{\n  "ok": true\n}',
});
expect(highlightJson('{"value":"<script>"}')).not.toContain('<script>');
```

- [ ] **Step 2: Verify the tests fail for missing production code**

Run: `npm test -- --run app/json-utils.test.ts`

Expected: FAIL because `./json-utils` does not exist.

- [ ] **Step 3: Implement the minimal pure utilities**

Define `JsonIndent = 2 | 4 | '\t'`, discriminated valid/empty/invalid results, offset-to-line/column calculation from native parser errors, HTML escaping, and token markup for keys, strings, numbers, booleans, null, and punctuation.

- [ ] **Step 4: Verify utility tests pass**

Run: `npm test -- --run app/json-utils.test.ts`

Expected: all utility tests PASS with no warnings.

### Task 2: Interactive Beautifier Interface

**Files:**
- Create: `app/page.test.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Delete: `app/_sites-preview/**`

**Interfaces:**
- Consumes: `formatJson`, `highlightJson`, and `JsonIndent` from `app/json-utils.ts`.
- Produces: the complete single-page JSON beautifier UI.

- [ ] **Step 1: Write failing interaction tests**

Use fake timers to verify 250 ms debouncing, sample loading, indentation changes, invalid status with stale output, clear behavior, safe highlighted output, copy enablement and feedback, and local-storage preference without source persistence.

```tsx
fireEvent.change(screen.getByLabelText('JSON input'), {
  target: { value: '{"name":"Ada"}' },
});
await act(async () => vi.advanceTimersByTime(250));
expect(screen.getByLabelText('Formatted JSON')).toHaveTextContent('"name": "Ada"');
```

- [ ] **Step 2: Verify the interface tests fail for missing UI behavior**

Run: `npm test -- --run app/page.test.tsx`

Expected: FAIL because the starter does not expose the requested controls and behavior.

- [ ] **Step 3: Implement minimal interface behavior**

Build the labeled input/output panes, status live region, 2-space/4-space/tab select, Sample/Clear/Copy actions, debounced parsing, stale-result behavior, local indentation preference, and clipboard feedback. Render only escaped markup from `highlightJson` into the read-only output.

- [ ] **Step 4: Implement the visual system and responsive layout**

Use a dark, compact tool surface with system fonts, a monospaced editor, accessible token colors, clear focus rings, horizontally scrollable code, equal desktop columns, and a single-column breakpoint below 760 px. Replace starter metadata with `Local JSON Beautifier` and a privacy-focused description.

- [ ] **Step 5: Verify interface and utility tests pass together**

Run: `npm test -- --run`

Expected: all tests PASS with no warnings.

### Task 3: Production and Browser Verification

**Files:**
- Modify only files required to correct a discovered, test-reproduced defect.

**Interfaces:**
- Consumes: completed local application.
- Produces: verified local preview kept running in the in-app Browser.

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: exit code 0 with no TypeScript or bundling errors.

- [ ] **Step 2: Open the exact local development URL in the in-app Browser**

Keep `npm run dev` running and open its printed Local URL once.

- [ ] **Step 3: Verify requested interactions in Browser**

Load the sample, edit JSON and wait for automatic formatting, select every indentation option, enter invalid JSON and confirm stale/error behavior, copy output, clear input, inspect token colors, and confirm the panes stack at a mobile viewport.

- [ ] **Step 4: Re-run complete verification after any browser-discovered fix**

Run: `npm test -- --run && npm run build`

Expected: all tests PASS and build exits 0.

## Execution Note

Execute inline in the current session with `superpowers:executing-plans`; multi-agent execution is intentionally not used because the tasks share one small application surface and no delegation was requested.
