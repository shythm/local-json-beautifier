# Resizable Workspace and Contrast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accessible desktop panel resizer, remove editor focus borders, and make syntax colors theme-aware.

**Architecture:** `ResizableWorkspace` owns only split-ratio interaction state and renders the two existing panels. `App` retains formatter state. CSS owns layout, separator visuals, focus treatment, and Bezier semantic syntax colors.

**Tech Stack:** React 19, TypeScript, Bezier tokens, Vitest, Testing Library, Vite

## Global Constraints

- Ratio defaults to 50, clamps to 25–75, and is not persisted.
- Keyboard step is 2 percentage points.
- Mobile below 760px remains stacked with no visible separator.
- Formatter behavior and accessible editor names remain unchanged.

---

### Task 1: Build the accessible resizer

- [ ] Add failing App tests for separator semantics, keyboard controls, double-click reset, and pointer clamping.
- [ ] Verify focused tests fail because the separator is absent.
- [ ] Create `src/ResizableWorkspace.tsx` and replace the workspace section in `src/App.tsx`.
- [ ] Run App tests and typecheck until green.

### Task 2: Fix focus and contrast styling

- [ ] Add failing CSS contract assertions for semantic syntax tokens and removed focus selectors.
- [ ] Update `src/styles.css` with the three-column grid, separator, mobile fallback, no editor focus border, and Bezier syntax tokens.
- [ ] Run all tests, typecheck, and build.

### Task 3: Verify and publish

- [ ] Verify pointer/keyboard resizing, mobile stacking, no editor border, and light/dark syntax contrast in the browser.
- [ ] Sync reviewed files to `/tmp/local-json-beautifier-publish-20260718` and repeat full validation.
- [ ] Commit `feat: add resizable JSON workspace`, push `main`, and verify GitHub Pages.
