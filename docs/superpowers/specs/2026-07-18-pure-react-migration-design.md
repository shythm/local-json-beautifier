# Pure React Migration and GitHub Pages Design

## Goal

Replace the unnecessary Next/Vinext/Cloudflare application shell with a conventional React + Vite single-page application, preserve all existing JSON beautifier behavior, and deploy the static result automatically to GitHub Pages.

This design supersedes `2026-07-18-github-pages-deployment-design.md`.

## Product Behavior

The migration must preserve:

- the split input and highlighted output layout;
- 250 ms debounced formatting;
- two-space, four-space, and tab indentation;
- key, string, number, boolean, null, and punctuation highlighting;
- safe HTML escaping;
- invalid JSON errors and the last valid stale result;
- copy, clear, and sample actions;
- indentation preference in local storage without persisting JSON input;
- responsive stacking and keyboard accessibility;
- local-only JSON processing with no API, telemetry, or runtime network dependency.

## Application Architecture

Use a standard Vite SPA:

- `index.html` contains the document metadata and `#root` mount point.
- `src/main.tsx` imports the stylesheet and mounts the application.
- `src/App.tsx` owns the existing interface and state transitions.
- `src/json-utils.ts` contains the existing pure formatter, error-location, escaping, and highlighting functions.
- `src/styles.css` contains the existing visual system without Tailwind imports.
- Tests live beside the migrated source in `src/*.test.ts(x)`.

The application has no router, server rendering, API layer, worker, database, or persistence service because none is required by the product.

## Dependency and File Cleanup

Keep runtime dependencies limited to `react` and `react-dom`.

Keep only development dependencies required for Vite, React TypeScript types, Vitest, jsdom, and Testing Library. Remove Next, Vinext, Cloudflare, Wrangler, React Server Components, Drizzle, Tailwind, ESLint’s Next configuration, and their supporting configuration and generated starter folders.

Remove the obsolete `app`, `worker`, `build`, `db`, `drizzle`, and `examples` trees plus `next.config.ts`, `postcss.config.mjs`, `drizzle.config.ts`, and the Sites hosting configuration. Preserve product documentation and public assets that remain relevant.

## Scripts and Configuration

- `npm run dev` starts Vite on port `12626`.
- `npm run build` runs TypeScript project validation and Vite production build.
- `npm test` runs the complete Vitest suite once.
- `npm run typecheck` runs `tsc --noEmit`.
- `vite.config.ts` uses the React plugin, outputs to `dist`, uses `/` during development, and uses `/local-json-beautifier/` during production builds.
- `vitest.config.ts` retains the jsdom environment and test setup for Testing Library.
- TypeScript configuration targets the browser and Vite rather than Next-generated types.

## GitHub Pages Deployment

Create `.github/workflows/deploy-pages.yml` that:

- runs automatically for pushes to `main` and supports manual dispatch;
- installs dependencies with `npm ci` on Node 22;
- runs tests, type checking, and the Vite build;
- configures Pages and uploads `dist` with the official Pages actions;
- deploys through the `github-pages` environment;
- uses only `contents: read`, `pages: write`, and `id-token: write` permissions;
- prevents redundant queued Pages deployments without interrupting an active deployment.

## Repository Publication

The remote `shythm/local-json-beautifier` repository is public and empty. Because the current workspace cannot create `.git`, clone the remote into a temporary writable checkout, copy only the cleaned and validated source, inspect the complete file set, create the initial `main` commit, and push it without force.

After push, enable GitHub Pages with Actions as the build source, monitor the deployment workflow, and verify `https://shythm.github.io/local-json-beautifier/` plus its referenced CSS and JavaScript assets.

## Validation

- Run the current tests before migration to establish a passing baseline.
- Keep the same behavioral tests green after moving them to `src`.
- Add a deployment contract test for the Vite base path, workflow triggers, permissions, validation commands, and `dist` artifact path.
- Run `npm test`, `npm run typecheck`, and `npm run build` in the working directory.
- Repeat `npm ci`, tests, type checking, and build in the temporary publish checkout.
- Inspect the built `dist/index.html` to confirm `/local-json-beautifier/` asset URLs.
- After deployment, verify the public page returns the application successfully.

## Failure Handling

- Do not push if tests, type checking, or build fail.
- Do not force-push or overwrite the remote if it stops being empty before publication.
- If the GitHub workflow fails, diagnose the failing job from its logs and make only the configuration change supported by that evidence.
- Do not claim deployment success until the Actions run succeeds and the public Pages endpoint serves the application.

## Completion Criteria

The migration is complete when the repository contains only the React + Vite application and its development/test/deployment support, all preserved behaviors pass automated validation, `main` is pushed without legacy server infrastructure, and the GitHub Pages URL serves the functioning local-only JSON beautifier.
