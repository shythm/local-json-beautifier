# Selection and Logo Color Design

## Goal

Replace the browser's dark default text-selection appearance with Bezier semantic selection colors and make the header `{ }` logo white in dark mode and black in light mode.

## Design

- Apply a global `::selection` background using `--color-state-action-light`.
- Apply `--color-text-neutral-heaviest` to selected text so contrast follows the active Bezier theme.
- Change `.mark` text color to `--color-text-neutral-heaviest`; the semantic token resolves to white in dark mode and black in light mode.
- Preserve the existing logo background, border, dimensions, typography, formatter behavior, and theme detection.

## Validation

- Add a stylesheet contract test for both semantic tokens and the `.mark` mapping.
- Run all tests, type checking, and the production build.
- Verify input and highlighted-output selection plus logo colors in light and dark browser modes.
- Deploy through the existing GitHub Pages workflow and verify the public page.
