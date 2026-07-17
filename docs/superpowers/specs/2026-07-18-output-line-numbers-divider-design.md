# Output Line Numbers and Hover Divider Design

## Goal

Show non-copyable line numbers beside formatted JSON and hide the workspace divider line until the resize handle is hovered, keyboard-focused, or actively dragged.

## Output Line Rendering

Add `highlightJsonWithLineNumbers(formatted: string): string` beside the existing highlighting utility. It will:

- call the existing safe `highlightJson` implementation;
- split the highlighted HTML on the formatter's real newline characters;
- wrap every line in `<span class="code-line" data-line-number="N">`;
- join the spans with real newline characters so `pre.textContent`, drag selection, and indentation behavior remain compatible;
- leave token spans and HTML escaping unchanged.

The line number will be CSS generated content from `data-line-number`, not a text node. Therefore it is visual-only, is not part of the JSON text, does not enter drag selection, and does not change clipboard output. The existing Copy action continues to copy the original `formatted` string directly.

## Gutter Layout

- Render a line-number pseudo-element before each non-empty output line span.
- Size the gutter from the number of digits in the current line count, with a two-digit minimum for stable small-document alignment.
- Use the same monospace font and line height as the output.
- Use Bezier `text-neutral-lighter` for numbers and `border-neutral` for the gutter divider so both themes retain appropriate contrast.
- Disable selection and pointer interaction on the generated number.
- Do not render line spans or numbers for the empty-output placeholder.
- Preserve stale-result opacity, scrolling, syntax highlighting, and responsive behavior.

## Workspace Divider

Keep the existing 14px separator hit area and accessibility behavior. Change only the visible two-pixel line:

- default opacity is zero;
- hover, `:focus-visible`, and `:active` set opacity to one;
- visible states use the existing Bezier focus color and expanded four-pixel line;
- transitions respect the existing reduced-motion rule.

Keyboard users must still receive a visible focus indication even though the default line is hidden.

## Code Organization

- `src/json-utils.ts`: add the line-wrapped highlighted HTML function.
- `src/json-utils.test.ts`: test line numbering, preserved newlines, token spans, and escaping.
- `src/App.tsx`: use the line-number renderer and expose a CSS gutter-width variable on the formatted `pre`.
- `src/App.test.tsx`: assert the rendered line count and unchanged Copy payload.
- `src/styles.css`: add gutter styling and hover-only divider visibility.

No formatter state, indentation behavior, parser behavior, persistence, or dependency changes are required.

## Validation

- Follow TDD: utility and component tests fail before implementation and pass afterward.
- Run all tests, type checking, and production build.
- In both light and dark browser modes, load the sample and verify line numbers align with every formatted line.
- Verify drag selection and Copy exclude line numbers.
- Verify the separator line is invisible at rest, visible on hover and keyboard focus, and remains usable for pointer and keyboard resizing.
- Verify the mobile layout still hides the separator completely.
- Publish to `main`, monitor GitHub Pages, and repeat the public-page checks.

## Completion Criteria

Formatted output displays aligned one-based visual line numbers without altering selectable or copied JSON, the divider line appears only for hover/focus/active interaction, all existing formatter behavior remains green, and GitHub Pages serves the verified implementation.
