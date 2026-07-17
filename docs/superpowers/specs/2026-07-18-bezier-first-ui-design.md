# Bezier-first UI Design

## Goal

Adopt `@channel.io/bezier-react@4.0.0-next.12` as the visual and interaction foundation of the local JSON beautifier while preserving its focused code-editor experience, existing behavior, accessibility, privacy, and GitHub Pages deployment.

The result is Bezier-first rather than Bezier-only: Bezier owns the application theme, semantic tokens, typography, controls, feedback, spacing, borders, and surfaces. Native code-oriented elements remain only where Bezier has no equivalent editor primitive.

## Chosen Approach

Use a hybrid Bezier-first implementation.

- Use Bezier's provider, global stylesheet, beta controls, typography, and semantic design tokens throughout the product chrome.
- Retain a native `textarea` for the full-height JSON source editor and a `pre` element for highlighted output.
- Style those native editor elements exclusively with Bezier semantic surface, text, border, focus, radius, and motion tokens, apart from a small syntax-highlighting palette and the system monospace font stack.
- Do not build a local wrapper component library; this application is too small to benefit from that abstraction.

This avoids forcing the auto-growing Bezier `TextArea` into a two-pane code editor while still making Bezier the source of truth for the interface.

## Dependencies and Theme

- Add exact runtime dependencies `@channel.io/bezier-react@4.0.0-next.12` and `@channel.io/bezier-icons@0.60.0`.
- Import `@channel.io/bezier-react/styles.css` before the application stylesheet.
- Wrap the application with `AppProvider` using the dark theme.
- Use beta exports for new controls because the package marks the legacy component exports as deprecated.
- Do not load Inter or any other font from a CDN. Use the local system sans-serif and monospace stacks so the deployed page has no runtime font request.

## Interface Structure

Keep the current single-page structure and information density:

1. The header presents the JSON Beautifier identity and the local-processing promise.
2. The formatting toolbar contains an explicitly labelled Bezier `Select` for indentation and Bezier buttons for sample and clear actions.
3. A compact status row communicates local-only processing and the current formatter state.
4. Two equal workspace panels contain the source editor and formatted result on wide screens.
5. An error notice appears below the workspace when parsing fails.
6. A restrained footer explains debounce timing and the lack of uploads, tracking, and JSON persistence.

On narrow screens, the toolbar wraps and the two panels stack vertically. Both editor panes keep a useful minimum height and independent scrolling.

## Bezier Component Mapping

- `AppProvider`: dark theme and semantic token context.
- `Text`: product title, supporting copy, panel labels, counts, status, and footer copy where its rendered semantics remain appropriate.
- `Button`: load sample, clear input, and copy actions. Use secondary styling for non-primary actions and primary styling for copy.
- `Select` and `SelectOption`: two spaces, four spaces, and tab indentation choices.
- `Badge`, when its accessible output and API fit the state: local-only and last-valid-result indicators. Otherwise render semantic text styled with Bezier tokens rather than forcing a component that weakens accessibility.
- Native `textarea`: JSON input editor with its existing label and browser editing behavior.
- Native `pre`: formatted, highlighted, selectable JSON output.

The application must not use deprecated legacy Bezier controls for convenience.

## Visual Language

- Replace locally invented background, surface, border, text, muted, focus, success, and danger variables with Bezier semantic CSS variables.
- Use Bezier radii and elevations for panels and controls.
- Reduce decorative effects that compete with the formatter; hierarchy should come from surface levels, typography, and spacing.
- Keep a small, accessible custom palette for JSON keys, strings, numbers, booleans, null values, and punctuation because Bezier does not define syntax-highlight roles.
- Use a visible Bezier focus state on the native source editor and preserve the focus behavior supplied by Bezier controls.
- Respect `prefers-reduced-motion` and avoid decorative animation.

## Behavior and State

All current behavior remains unchanged:

- Formatting occurs 250 ms after source typing stops.
- Changing indentation reformats immediately and stores only the indentation preference in local storage.
- Valid JSON replaces the highlighted result.
- Invalid JSON shows an error while retaining and visually marking the last valid result.
- Empty input clears both the result and the error.
- Copy is enabled only for a valid, non-empty result and reports success or failure through the live status region.
- Sample and clear retain their current actions and disabled states.

Bezier adoption must not introduce a server request, telemetry, JSON persistence, or runtime CDN dependency.

## Accessibility

- Preserve the accessible names `JSON input`, `Formatted JSON`, `Indentation`, `Load sample`, `Clear input`, and `Copy formatted JSON`.
- Preserve the polite `status` live region and assertive `alert` error region.
- Ensure the custom Select remains programmatically labelled `Indentation`; use a visible label or Bezier-supported accessible labelling rather than relying on placeholder text.
- Preserve semantic headings, articles, sections, and keyboard access.
- Do not communicate valid, invalid, pending, or stale states by color alone; keep their existing text labels.
- Maintain readable contrast for custom syntax colors against Bezier's dark editor surface.

## Code Organization

- `src/main.tsx` imports Bezier CSS and supplies `AppProvider`.
- `src/App.tsx` replaces product-chrome elements with Bezier components while retaining the current explicit formatter state and handlers.
- `src/styles.css` becomes a small layout and editor stylesheet based on Bezier semantic tokens.
- `src/json-utils.ts` remains unchanged because formatting and highlighting behavior are independent of the design system.

Avoid unrelated state refactors or new component layers during the migration.

## Testing and Validation

- Keep the existing formatter interaction tests passing.
- Adapt Select interaction tests to the accessible interaction model exposed by Bezier rather than relying on native `change` events if necessary.
- Add a provider-level test proving the application renders within the dark Bezier theme.
- Assert the toolbar controls retain their accessible names and disabled behavior.
- Run the full test suite, type checking, and production build.
- Inspect the production bundle for the expected `/local-json-beautifier/` asset base and confirm that no external font URL was introduced.
- Exercise the page in the in-app browser at desktop and narrow viewport widths, including typing, indentation changes, invalid input, sample, clear, and copy.

## Publication

After local verification, sync the validated files to the existing temporary repository checkout, commit the Bezier-first migration, push `main`, monitor the GitHub Pages workflow, and verify the public Pages URL. Do not publish if tests, type checking, or build fail.

## Completion Criteria

The work is complete when the application uses the pinned Bezier release as its design foundation, the native editor exceptions are limited and token-driven, all existing behavior and accessibility contracts pass, local and production builds succeed, and the deployed GitHub Pages application serves the verified Bezier-first interface without runtime data or font requests.
