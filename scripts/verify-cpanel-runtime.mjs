import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".output/server");
if (!fs.existsSync(root)) {
  throw new Error(`Missing production server output: ${root}`);
}

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".mjs")) files.push(full);
  }
}
walk(root);

const relativeFiles = new Set(
  files.map((file) => path.relative(root, file).split(path.sep).join("/")),
);

const resolveImport = (fromFile, specifier) => {
  const clean = specifier.split(/[?#]/)[0];
  const base = path.posix.normalize(
    path.posix.join(path.posix.dirname(fromFile), clean),
  );
  const candidates = [base, `${base}.mjs`, `${base}.js`, `${base}/index.mjs`];
  return candidates.find((candidate) => relativeFiles.has(candidate));
};

const missing = [];
for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  const text = fs.readFileSync(file, "utf8");
  const importPattern = /(?:from\s*|import\s*(?:\(\s*)?)["'](\.[^"']+)["']/g;
  for (const match of text.matchAll(importPattern)) {
    if (!resolveImport(rel, match[1])) missing.push(`${rel} -> ${match[1]}`);
  }
}

const ssrFile = path.join(root, "_ssr", "ssr.mjs");
const ssrText = fs.readFileSync(ssrFile, "utf8");
const serverMatch = ssrText.match(/import\(["'](\.\/server-[^"']+\.mjs)["']\)/);
if (!serverMatch) {
  throw new Error(
    "Could not find the generated SSR server entry import in .output/server/_ssr/ssr.mjs",
  );
}
if (!resolveImport("_ssr/ssr.mjs", serverMatch[1])) {
  missing.push(`_ssr/ssr.mjs -> ${serverMatch[1]}`);
}

if (missing.length) {
  console.error("Missing relative production server imports:");
  console.error(missing.join("\n"));
  process.exit(1);
}

for (const required of ["index.mjs", "_ssr/ssr.mjs"]) {
  if (!relativeFiles.has(required)) {
    throw new Error(`Required production server file is missing: ${required}`);
  }
}

console.log(`Verified ${files.length} production server modules and all relative imports.`);
