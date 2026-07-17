# Local JSON Beautifier Design

## Goal

Build a small, privacy-first web application that formats JSON entirely in the browser. The app runs from a local development server and does not send JSON or analytics to any external service.

## User Experience

- Use a split layout with editable JSON input on the left and highlighted, read-only formatted output on the right.
- On narrow screens, stack input above output.
- Format automatically 250 ms after the latest input change.
- Let the user select two spaces, four spaces, or a tab for indentation.
- Provide actions to copy the formatted result, clear the input, and load a representative example.
- Use a compact, tool-like interface with strong contrast, readable monospaced text, and visible keyboard focus states.

## Formatting and Highlighting

- Parse input with the browser's native JSON parser.
- Serialize valid input with the selected indentation.
- Highlight object keys, strings, numbers, booleans, null, and punctuation with distinct accessible colors.
- Treat highlighted output as rendered text, never executable markup. Escape JSON content before applying syntax markup so user-provided strings cannot inject HTML.

## Errors and State

- Empty input produces an empty output and a neutral ready state.
- Invalid JSON shows a concise parse error and, when the parser exposes an offset, its line and column.
- While input is invalid, keep the last successfully formatted result visible but visually mark it as stale. If no successful result exists, show an empty output state.
- Changing indentation immediately reformats the current valid input.
- Copy is disabled when there is no valid formatted result. Successful copy gives brief inline confirmation; clipboard failure shows a concise error.

## Architecture

- Create a single-route React application using the existing Sites/Vite starter structure.
- Keep parsing and error-position calculation in small pure utility functions.
- Keep syntax highlighting in a separate pure function that returns safe markup.
- Keep UI state in the page component: source text, indentation choice, formatted text, parse status, and copy feedback.
- Store only the indentation preference in local browser storage. Do not persist JSON input.
- Do not add a server API, database, authentication, telemetry, or network-dependent runtime assets.

## Accessibility and Responsive Behavior

- Associate labels with the input and indentation controls.
- Announce parse and copy status through an appropriate live region.
- Ensure all controls work with keyboard navigation.
- Preserve horizontal scrolling for long unbroken values rather than wrapping them unpredictably.
- Maintain a usable stacked layout on mobile-sized viewports.

## Verification

- Unit-test formatting, indentation changes, safe highlighting, empty input, invalid JSON, and error position calculation.
- Build the production bundle successfully.
- In the in-app Browser, verify sample loading, automatic formatting, all indentation choices, syntax colors, invalid-input handling, copy feedback, clearing, and responsive stacking.

## Completion Criteria

The app is complete when it runs on a local URL, performs all JSON processing without external requests, produces correctly indented highlighted output, handles invalid input safely, and passes the automated and browser checks above.
