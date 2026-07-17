# Local JSON Beautifier

A privacy-first JSON formatter that runs entirely in the browser. It provides
automatic formatting, syntax highlighting, configurable indentation, useful
parse errors, and one-click copying without uploading JSON anywhere.

## Development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

The local app runs at <http://127.0.0.1:12626/>.

## Validation

```bash
npm test
npm run typecheck
npm run build
```

The production build uses the `/local-json-beautifier/` base path for GitHub
Pages.
