# Pure React Migration and GitHub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Vinext/Next/Cloudflare starter with a minimal React + Vite SPA, preserve all product behavior, and publish it automatically to GitHub Pages.

**Architecture:** Move the existing page, JSON utilities, tests, and CSS into a conventional `src` tree mounted by Vite. Remove every unused server, database, RSC, Cloudflare, Tailwind, and Sites layer; then deploy the single Vite `dist` artifact with GitHub Actions.

**Tech Stack:** React 19, TypeScript, Vite 8, Vitest, Testing Library, GitHub Actions, GitHub Pages

## Global Constraints

- Preserve all existing JSON beautifier behavior and accessibility.
- Keep runtime dependencies limited to `react` and `react-dom`.
- Keep JSON processing entirely in the browser with no API or telemetry.
- Use port `12626` for local development.
- Use `/local-json-beautifier/` as the production base path.
- Deploy automatically from `main` and support manual deployment.
- Do not force-push or overwrite non-empty remote history.

---

### Task 1: Establish the Migration Contract

**Files:**
- Create: `tests/project-structure.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: a Node test that defines the intended React-only package, file structure, scripts, Vite base path, and absence of legacy dependencies.

- [ ] **Step 1: Run the current application tests as a baseline**

Run: `npm test`

Expected: 12 tests PASS.

- [ ] **Step 2: Write the failing project-structure test**

The test reads `package.json`, `vite.config.ts`, `index.html`, and required `src` files. It asserts runtime dependencies equal `react` and `react-dom`; scripts are Vite-based; production base is `/local-json-beautifier/`; port is `12626`; and Next, Vinext, Cloudflare, Wrangler, Drizzle, Tailwind, `app`, and `worker` are absent.

- [ ] **Step 3: Verify the migration contract fails for the legacy structure**

Run: `node --test tests/project-structure.test.mjs`

Expected: FAIL because `src/App.tsx` and `index.html` do not exist and legacy dependencies remain.

### Task 2: Migrate the Application to Vite

**Files:**
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.test.tsx`
- Create: `src/json-utils.ts`
- Create: `src/json-utils.test.ts`
- Create: `src/styles.css`
- Create: `src/test-setup.ts`
- Replace: `vite.config.ts`
- Replace: `vitest.config.ts`
- Replace: `tsconfig.json`
- Replace: `package.json`
- Replace: `README.md`
- Modify: `.gitignore`
- Delete: `app/**`, `worker/**`, `build/**`, `db/**`, `drizzle/**`, `examples/**`, `.openai/**`, `next.config.ts`, `postcss.config.mjs`, `drizzle.config.ts`, `eslint.config.mjs`, `tests/rendered-html.test.mjs`, `public/file.svg`, `public/globe.svg`, `public/window.svg`

**Interfaces:**
- Consumes: the existing `Home` component, formatter utilities, styles, and 12 behavioral tests.
- Produces: `App`, `formatJson`, `highlightJson`, `npm run dev`, `npm test`, `npm run typecheck`, and `npm run build` in a React-only project.

- [ ] **Step 1: Move behavior without changing it**

Move `app/page.tsx` to `src/App.tsx` and remove only the `"use client"` directive. Move the JSON utilities, tests, test setup, and CSS into `src`; remove the unused Tailwind import from the CSS. Update test imports and Vitest include/setup paths.

- [ ] **Step 2: Add the Vite mount point and browser metadata**

Create root `index.html` with title `Local JSON Beautifier`, privacy-focused description, local favicon, `#root`, and `/src/main.tsx`. Create `src/main.tsx` that imports `src/styles.css` and renders `<App />` inside `StrictMode`.

- [ ] **Step 3: Replace framework configuration**

Replace `vite.config.ts` with `@vitejs/plugin-react`, server port `12626`, production base `/local-json-beautifier/`, and `dist` output. Replace TypeScript config with browser/Vite settings and `vite/client` types. Replace package metadata and scripts with Vite-only equivalents.

- [ ] **Step 4: Remove legacy infrastructure and refresh dependencies**

Delete the listed obsolete files and directories. Run `npm install --cache /tmp/local-json-beautifier-npm-cache` to refresh the lockfile and remove unused packages.

- [ ] **Step 5: Pass migration and behavior validation**

Run separately:

- `node --test tests/project-structure.test.mjs`
- `npm test`
- `npm run typecheck`
- `npm run build`

Expected: the structure contract and all 12 behavioral tests pass; type checking and Vite build exit 0; `dist/index.html` references `/local-json-beautifier/assets/`.

### Task 3: Add the GitHub Pages Deployment Contract

**Files:**
- Create: `tests/pages-deployment.test.mjs`
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `package.json`

**Interfaces:**
- Consumes: the Vite `dist` build from Task 2.
- Produces: a tested `main`-push/manual GitHub Pages workflow.

- [ ] **Step 1: Write the failing deployment test**

Assert the workflow file exists and includes `main`, `workflow_dispatch`, Node 22, `npm ci`, `npm test`, `npm run typecheck`, `npm run build`, minimal Pages permissions, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` with `dist`, and `actions/deploy-pages@v4`.

- [ ] **Step 2: Verify the test fails before the workflow exists**

Run: `node --test tests/pages-deployment.test.mjs`

Expected: FAIL because `.github/workflows/deploy-pages.yml` does not exist.

- [ ] **Step 3: Create the official Pages workflow**

Add the `main` and manual triggers, minimal permissions, non-interrupting `pages` concurrency group, build job, official artifact upload, and `github-pages` deployment job.

- [ ] **Step 4: Integrate deployment contracts into the test script**

Update `npm test` to run Vitest, `tests/project-structure.test.mjs`, and `tests/pages-deployment.test.mjs`. Run `npm test`, `npm run typecheck`, and `npm run build`.

Expected: all checks pass and the static artifact remains valid.

### Task 4: Publish and Verify GitHub Pages

**Files:**
- Copy the validated clean project into a temporary clone of `shythm/local-json-beautifier`.
- Commit the complete intended source and documentation set.

**Interfaces:**
- Consumes: authenticated `gh`, validated source, and an empty remote.
- Produces: the initial `main` commit, a successful Pages workflow, and the live site.

- [ ] **Step 1: Reconfirm remote safety**

Run: `gh repo view shythm/local-json-beautifier --json isEmpty,defaultBranchRef`

Expected: `isEmpty: true`; stop if false.

- [ ] **Step 2: Clone and copy only source files**

Clone to `/tmp/local-json-beautifier-publish`, copy the workspace excluding `.git`, `node_modules`, `dist`, `.wrangler`, `work`, and `outputs`, then review `git status --short` and the staged file list.

- [ ] **Step 3: Reproduce validation in the publish checkout**

Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run build` in the temporary checkout.

Expected: clean install, all tests pass, type checking passes, and the build exits 0.

- [ ] **Step 4: Commit and push**

Commit as `feat: publish local JSON beautifier`, set the branch to `main`, and push with tracking to `origin/main` without force.

- [ ] **Step 5: Enable and monitor Pages**

Set Pages build type to workflow through the GitHub API, monitor `Deploy GitHub Pages` to completion, and verify `https://shythm.github.io/local-json-beautifier/` plus its CSS and JavaScript assets return successfully.

- [ ] **Step 6: Report evidence**

Report the commit SHA, test/typecheck/build results, Actions run URL, and live Pages URL. If deployment fails, report the exact failing job instead of claiming success.

## Execution Note

Execute inline in the current session with `superpowers:executing-plans`. No subagent delegation was requested and the migration, validation, and first push share one sequential state.
