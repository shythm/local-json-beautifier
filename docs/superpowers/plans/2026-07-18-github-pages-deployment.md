# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish Local JSON Beautifier as a static GitHub Pages site and automatically redeploy it from `main`.

**Architecture:** Preserve the existing Vinext application and add a separate Vite browser entry that reuses the existing page, CSS, and JSON utilities. A GitHub Actions workflow tests and builds the static artifact, then deploys it through the official Pages actions.

**Tech Stack:** React 19, TypeScript, Vite 8, Vitest, Node test runner, GitHub Actions, GitHub Pages

## Global Constraints

- Preserve the existing `npm run dev` and `npm run build` Vinext workflows.
- Serve the static app from `/local-json-beautifier/`.
- Keep all JSON parsing, formatting, and highlighting in the browser.
- Do not commit `node_modules`, `dist`, `pages-dist`, `.wrangler`, `work`, or `outputs`.
- Deploy automatically on `main` pushes and support manual workflow runs.
- Use only `contents: read`, `pages: write`, and `id-token: write` workflow permissions.
- Do not overwrite remote history if the empty repository changes before publication.

---

### Task 1: Static GitHub Pages Build

**Files:**
- Create: `pages/index.html`
- Create: `pages/main.tsx`
- Create: `vite.pages.config.ts`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: default export `Home` from `app/page.tsx` and `app/globals.css`.
- Produces: `npm run build:pages`, which writes a deployable site to `pages-dist/` with base path `/local-json-beautifier/`.

- [ ] **Step 1: Verify the requested static build does not exist**

Run: `npm run build:pages`

Expected: FAIL with `Missing script: "build:pages"`.

- [ ] **Step 2: Add the static browser entry**

Create `pages/index.html` with a root element, local metadata, favicon through `%BASE_URL%favicon.svg`, and a module script for `/main.tsx`. Create `pages/main.tsx` that imports `app/globals.css`, renders the existing `Home` component into `#root`, and adds no new product state.

- [ ] **Step 3: Add the Pages Vite configuration and script**

Create `vite.pages.config.ts` using `@vitejs/plugin-react`, `root: "pages"`, `base: "/local-json-beautifier/"`, `publicDir: "../public"`, and `outDir: "../pages-dist"`. Add `"build:pages": "vite build --config vite.pages.config.ts"` to `package.json` and add `pages-dist` to `.gitignore`.

- [ ] **Step 4: Verify the static build**

Run: `npm run build:pages`

Expected: exit code 0 and `pages-dist/index.html` referencing assets under `/local-json-beautifier/assets/`.

### Task 2: Tested GitHub Pages Workflow

**Files:**
- Create: `tests/pages-deployment.test.mjs`
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `package.json`

**Interfaces:**
- Consumes: `npm run build:pages` from Task 1.
- Produces: a `main`-push and manually triggered Pages deployment workflow.

- [ ] **Step 1: Write the failing deployment contract test**

Create a Node test that reads `package.json`, `vite.pages.config.ts`, and `.github/workflows/deploy-pages.yml`, then asserts the Pages build script, repository base path, `main` trigger, `workflow_dispatch`, minimal permissions, `npm ci`, application tests, static build, artifact upload path `pages-dist`, and official `actions/deploy-pages` step.

- [ ] **Step 2: Verify the deployment test fails**

Run: `node --test tests/pages-deployment.test.mjs`

Expected: FAIL because `.github/workflows/deploy-pages.yml` does not exist.

- [ ] **Step 3: Add the deployment workflow**

Create `.github/workflows/deploy-pages.yml` with:

- push trigger for `main` and `workflow_dispatch`;
- the three minimal permissions;
- concurrency group `pages` with `cancel-in-progress: false`;
- a build job using checkout, Node 22 with npm cache, `npm ci`, `npm test`, `npm run build:pages`, `actions/configure-pages@v5`, and `actions/upload-pages-artifact@v3` for `pages-dist`;
- a deploy job using the `github-pages` environment and `actions/deploy-pages@v4`.

- [ ] **Step 4: Integrate and pass deployment tests**

Add `"test:deployment": "node --test tests/pages-deployment.test.mjs"` and update `test` to run Vitest followed by the deployment test. Run: `npm test`

Expected: all 12 application tests and all deployment contract tests PASS.

- [ ] **Step 5: Verify both build paths**

Run separately:

- `npm run build`
- `npm run build:pages`

Expected: both exit 0.

### Task 3: Initial Repository Publication and Deployment

**Files:**
- Copy the validated source tree into a temporary clone of `shythm/local-json-beautifier`.
- Commit all intended source and documentation files.

**Interfaces:**
- Consumes: validated project source and authenticated `gh`/Git access.
- Produces: `origin/main`, an enabled Pages configuration, a successful deployment run, and the public Pages URL.

- [ ] **Step 1: Reconfirm the remote is empty**

Run: `gh repo view shythm/local-json-beautifier --json isEmpty,defaultBranchRef`

Expected: `isEmpty: true`. Stop if it is false.

- [ ] **Step 2: Clone and copy the intended source**

Clone to `/tmp/local-json-beautifier-publish`, copy the workspace while excluding `.git`, `node_modules`, `dist`, `pages-dist`, `.wrangler`, `work`, and `outputs`, then inspect `git status --short` and the complete staged file list before committing.

- [ ] **Step 3: Validate from the publish checkout**

Run `npm ci`, `npm test`, `npm run build`, and `npm run build:pages` inside the temporary checkout.

Expected: clean dependency install, all tests pass, and both builds exit 0.

- [ ] **Step 4: Commit and push the initial main branch**

Stage only the reviewed source files, commit as `feat: publish local JSON beautifier`, rename the branch to `main` if needed, and push with tracking to `origin/main`.

- [ ] **Step 5: Enable Pages and monitor deployment**

Configure the Pages build type as workflow using the GitHub API, inspect the `Deploy GitHub Pages` Actions run until completion, and verify `https://shythm.github.io/local-json-beautifier/` returns the app with its CSS and JavaScript assets.

- [ ] **Step 6: Report publication evidence**

Report the pushed commit SHA, validation results, Actions run URL, and live Pages URL. If deployment fails, report the exact failing job and do not claim publication succeeded.

## Execution Note

Execute inline in the current session with `superpowers:executing-plans`. The tasks share one small project surface and no subagent delegation was requested.
