# Selection and Logo Colors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use Bezier semantic colors for text selection and the header logo across light and dark themes.

**Architecture:** Keep the change in `src/styles.css`; guard the semantic mappings with the existing project structure test and verify both themes in the browser.

**Tech Stack:** CSS, Bezier semantic tokens, Node test runner, Vite

## Global Constraints

- Use `--color-state-action-light` for selection background.
- Use `--color-text-neutral-heaviest` for selected text and `.mark` text.
- Do not change layout, behavior, or theme detection.

---

### Task 1: Add semantic selection and logo colors

- [ ] Add failing stylesheet assertions to `tests/project-structure.test.mjs`.
- [ ] Run the focused Node test and verify it fails on the missing selection token.
- [ ] Add the global `::selection` rule and update `.mark` in `src/styles.css`.
- [ ] Run the complete test, typecheck, and build commands.
- [ ] Verify computed selection and logo colors under light and dark emulation.
- [ ] Sync to the publish checkout, commit, push `main`, and verify GitHub Pages.
