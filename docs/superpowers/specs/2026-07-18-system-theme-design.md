# System Theme Design

## Goal

Make the Bezier-first JSON beautifier follow the operating system's light or dark color preference at initial load and update immediately when that preference changes, without adding a manual toggle or persisted theme setting.

## Chosen Approach

Use the browser's `window.matchMedia('(prefers-color-scheme: dark)')` result as the only source of truth and bridge it to Bezier's `AppProvider themeName` prop.

A small `SystemThemeProvider` component will:

- read the current media query synchronously for the initial React render;
- subscribe to the media query's `change` event;
- pass `dark` when the query matches and `light` otherwise;
- remove the listener when unmounted;
- render the existing application inside Bezier's `AppProvider`.

The application has no server rendering, so no server/client theme reconciliation is required.

## Alternatives Rejected

- CSS-only `prefers-color-scheme`: Bezier components select semantic tokens through `AppProvider`, so CSS alone would leave the component context on the wrong theme.
- Manual theme toggle with local storage: this adds a second source of truth and is outside the requested system-driven behavior.
- Reading the media query only once: this would require a reload after the operating system theme changes.

## Code Organization

- Add `src/SystemThemeProvider.tsx` as the browser-theme integration boundary.
- Update `src/main.tsx` to use `SystemThemeProvider` instead of a fixed `AppProvider`.
- Add `src/SystemThemeProvider.test.tsx` for initial light/dark selection, live changes, and listener cleanup.
- Keep `src/App.tsx`, formatter state, editor behavior, and semantic token styles unchanged.

## Accessibility and Privacy

Theme changes do not alter document structure, accessible names, focus behavior, or formatter state. `matchMedia` is a local browser API; no preference is stored or transmitted.

## Testing and Validation

- Mock `matchMedia` with a controllable `MediaQueryList`.
- Verify the document root receives `data-bezier-theme="light"` and `data-bezier-theme="dark"` for the corresponding initial system preference.
- Dispatch a media-query change and verify the Bezier root attribute changes without remounting the application.
- Verify the change listener is removed on unmount.
- Run the complete test suite, type checking, production build, and desktop browser validation.
- In the browser, emulate or change `prefers-color-scheme` and confirm Bezier surfaces and native editor token colors remain legible in both modes.

## Publication

After verification, sync the changed files to the existing temporary repository checkout, commit, push `main`, monitor GitHub Pages, and verify the public URL.

## Completion Criteria

The application selects the system theme on load, follows system theme changes live, adds no manual or persisted setting, passes automated and browser validation, and is deployed successfully to GitHub Pages.
