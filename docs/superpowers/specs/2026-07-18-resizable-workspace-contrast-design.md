# Resizable Workspace and Light Contrast Design

## Goal

Remove the source editor's focus border, let users resize the source and formatted-result panels horizontally, and improve light-theme syntax contrast with Bezier semantic colors.

## Resizable Workspace

- Extract the workspace grid into `ResizableWorkspace` with explicit source and result panel slots.
- Start at 50% source width and keep the ratio only in React state.
- Clamp pointer dragging to 25%–75%.
- Render a focusable `role="separator"` with `aria-orientation="vertical"`, min/max/current values, and label `Resize JSON panels`.
- Support Left/Right arrows in 2% increments, Home/End for limits, and double-click for 50:50 reset.
- Use pointer capture when available so dragging continues outside the handle.
- Hide the separator and stack panels below 760px.

## Focus Treatment

Remove the panel `:focus-within` border/elevation change and the textarea `:focus-visible` outline. The editor retains its caret and native text selection; buttons, Select, and the keyboard-operable separator retain visible focus states.

## Syntax Contrast

Replace fixed syntax hex colors with theme-aware Bezier text tokens:

- key: `--color-text-accent-blue`
- string: `--color-text-accent-green`
- number: `--color-text-accent-orange`
- boolean: `--color-text-accent-purple`
- null: `--color-text-accent-pink`
- punctuation: `--color-text-neutral-light`

## Validation

Test keyboard, pointer clamp, reset, accessible separator values, and non-persistence. Add CSS contracts for removed editor focus borders and semantic syntax tokens. Run the full suite, typecheck, build, and browser checks in light/dark and desktop/mobile modes before deploying to GitHub Pages.
