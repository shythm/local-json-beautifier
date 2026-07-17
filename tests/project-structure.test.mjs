import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const readRequired = (path) => {
  assert.equal(existsSync(path), true, `${path} must exist`);
  return readFileSync(path, "utf8");
};

test("uses a minimal React and Vite project structure", () => {
  const packageJson = JSON.parse(readRequired("package.json"));
  const viteConfig = readRequired("vite.config.ts");
  const indexHtml = readRequired("index.html");
  const mainSource = readRequired("src/main.tsx");
  const systemThemeProvider = readRequired("src/SystemThemeProvider.tsx");
  const styles = readRequired("src/styles.css");

  for (const path of [
    "src/main.tsx",
    "src/App.tsx",
    "src/ResizableWorkspace.tsx",
    "src/SystemThemeProvider.tsx",
    "src/json-utils.ts",
    "src/styles.css",
  ]) {
    readRequired(path);
  }

  assert.deepEqual(Object.keys(packageJson.dependencies).sort(), [
    "@channel.io/bezier-icons",
    "@channel.io/bezier-react",
    "react",
    "react-dom",
  ]);
  assert.equal(packageJson.dependencies["@channel.io/bezier-react"], "4.0.0-next.12");
  assert.equal(packageJson.dependencies["@channel.io/bezier-icons"], "0.60.0");
  assert.match(mainSource, /@channel\.io\/bezier-react\/styles\.css/);
  assert.match(mainSource, /<SystemThemeProvider>/);
  assert.doesNotMatch(mainSource, /<AppProvider themeName=/);
  assert.match(systemThemeProvider, /\(prefers-color-scheme: dark\)/);
  assert.match(systemThemeProvider, /addEventListener\("change"/);
  assert.match(systemThemeProvider, /removeEventListener\("change"/);
  assert.match(styles, /var\(--color-surface\)/);
  assert.match(styles, /var\(--color-surface-high\)/);
  assert.match(styles, /var\(--color-border-neutral\)/);
  assert.match(styles, /var\(--color-text-neutral\)/);
  assert.match(styles, /var\(--color-state-focus\)/);
  assert.match(
    styles,
    /::selection\s*\{[^}]*var\(--color-state-action-light\)[^}]*var\(--color-text-neutral-heaviest\)/s,
  );
  assert.match(
    styles,
    /\.mark\s*\{[^}]*color:\s*var\(--color-text-neutral-heaviest\)/s,
  );
  assert.doesNotMatch(styles, /--bg:/);
  assert.doesNotMatch(styles, /--surface:/);
  assert.doesNotMatch(styles, /font-family:\s*Inter/);
  assert.doesNotMatch(styles, /https?:\/\//);
  assert.doesNotMatch(styles, /\.panel:focus-within/);
  assert.doesNotMatch(styles, /textarea:focus-visible/);
  assert.match(
    styles,
    /\.code-line::before\s*\{[^}]*content:\s*attr\(data-line-number\)/s,
  );
  assert.match(styles, /\.code-line\s*\{[^}]*display:\s*inline/s);
  assert.match(
    styles,
    /\.workspace-divider::before\s*\{[^}]*opacity:\s*0/s,
  );
  assert.match(
    styles,
    /\.workspace-divider:hover::before,\s*\.workspace-divider:focus-visible::before,\s*\.workspace-divider:active::before/,
  );
  for (const token of [
    "--color-text-accent-blue",
    "--color-text-accent-green",
    "--color-text-accent-orange",
    "--color-text-accent-purple",
    "--color-text-accent-pink",
    "--color-text-neutral-light",
  ]) {
    assert.match(styles, new RegExp(`color: var\\(${token}\\)`));
  }
  assert.match(packageJson.scripts.dev, /^vite\b/);
  assert.match(packageJson.scripts.build, /tsc --noEmit/);
  assert.match(packageJson.scripts.build, /vite build/);
  assert.equal(packageJson.scripts.typecheck, "tsc --noEmit");
  assert.match(viteConfig, /port:\s*12626/);
  assert.match(viteConfig, /\/local-json-beautifier\//);
  assert.match(indexHtml, /id="root"/);
  assert.match(indexHtml, /\/src\/main\.tsx/);

  const allPackages = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  for (const legacyPackage of [
    "next",
    "vinext",
    "wrangler",
    "drizzle-orm",
    "drizzle-kit",
    "tailwindcss",
    "@cloudflare/vite-plugin",
    "@tailwindcss/postcss",
    "react-server-dom-webpack",
  ]) {
    assert.equal(allPackages[legacyPackage], undefined, `${legacyPackage} must be removed`);
  }

  for (const legacyPath of [
    "app",
    "worker",
    "build",
    "db",
    "drizzle",
    "examples",
    ".openai",
    ".vinext",
    "next.config.ts",
    "postcss.config.mjs",
    "drizzle.config.ts",
  ]) {
    assert.equal(existsSync(legacyPath), false, `${legacyPath} must be removed`);
  }
});
