# GitHub Pages Deployment Design

## Goal

Publish the existing Local JSON Beautifier to `https://shythm.github.io/local-json-beautifier/` and automatically redeploy it whenever `main` is updated.

## Constraints

- GitHub Pages serves static files and cannot run the existing Vinext server bundle.
- Preserve the current Vinext development and production build paths.
- Reuse the existing React page, stylesheet, and JSON utilities without duplicating product behavior.
- Keep JSON processing entirely in the browser after deployment.
- The remote `shythm/local-json-beautifier` repository is public and currently empty.

## Selected Approach

Add a dedicated static Vite build alongside the existing Vinext build. A small browser entry point mounts the existing page component, while a Pages-specific Vite configuration sets the repository base path and writes a self-contained static bundle to `pages-dist`.

This keeps the current local workflow intact and limits Pages-specific code to deployment infrastructure.

## Build Structure

- `pages/index.html` provides the static HTML shell.
- `pages/main.tsx` mounts `app/page.tsx` and imports `app/globals.css`.
- `vite.pages.config.ts` configures React, the `/local-json-beautifier/` base path, and the `pages-dist` output directory.
- `npm run build:pages` produces the deployable static artifact.
- `pages-dist` remains ignored and is never committed.

## Deployment Workflow

Create `.github/workflows/deploy-pages.yml` with these behaviors:

- Trigger automatically on pushes to `main` and allow manual `workflow_dispatch` runs.
- Install dependencies with `npm ci` using the committed lockfile.
- Run the complete Vitest suite before deployment.
- Build the static Pages artifact with `npm run build:pages`.
- Upload `pages-dist` with the official Pages artifact action.
- Deploy through the official Pages deployment action using the `github-pages` environment.
- Use only the minimal `contents: read`, `pages: write`, and `id-token: write` permissions.
- Concurrency allows an active deployment to finish while cancelling redundant queued runs.

## Repository Publication

Because the current workspace cannot create `.git`, clone the empty GitHub repository into a temporary writable directory. Copy the project into that checkout while excluding generated and local-only content such as `node_modules`, `dist`, `pages-dist`, `.wrangler`, `work`, and `outputs`.

Review the resulting Git status, commit the intended source as the initial `main` commit, and push to `origin/main`. Then configure the repository Pages build type as GitHub Actions and verify the deployment workflow and resulting Pages URL.

## Validation

- Run `npm test -- --run` for application behavior.
- Run `npm run build` to ensure the existing Vinext build remains valid.
- Run `npm run build:pages` and inspect `pages-dist/index.html` plus referenced assets.
- Serve `pages-dist` locally under the repository subpath and verify the page loads without missing assets.
- Validate the workflow YAML syntax and required permissions.
- After push, verify the GitHub Actions run completes and the Pages endpoint returns the application.

## Failure Handling

- Do not push if any required local test or build fails.
- If the remote stops being empty before publication, stop and reconcile the remote history instead of overwriting it.
- If Pages activation or deployment fails, inspect the Actions logs and repository Pages settings, correct only the identified configuration issue, rerun validation, and push a follow-up commit.

## Completion Criteria

The work is complete when the source is on `main`, the Pages workflow succeeds, and `https://shythm.github.io/local-json-beautifier/` serves the functioning local-only JSON beautifier with correct assets under the repository subpath.
