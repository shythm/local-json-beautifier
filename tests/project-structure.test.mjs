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

  for (const path of [
    "src/main.tsx",
    "src/App.tsx",
    "src/json-utils.ts",
    "src/styles.css",
  ]) {
    readRequired(path);
  }

  assert.deepEqual(Object.keys(packageJson.dependencies).sort(), [
    "react",
    "react-dom",
  ]);
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
