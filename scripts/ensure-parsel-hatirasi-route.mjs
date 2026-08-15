import fs from "node:fs";
import path from "node:path";

const file = path.resolve("src/routes/routeTree.gen.ts");
if (!fs.existsSync(file)) process.exit(0);
let s = fs.readFileSync(file, "utf8");

if (!s.includes("ParselHatirasiRouteImport")) {
  s = s.replace(
    "import { Route as SiparislerimRouteImport } from './routes/siparislerim'",
    "import { Route as SiparislerimRouteImport } from './routes/siparislerim'\nimport { Route as ParselHatirasiRouteImport } from './routes/parsel-hatirasi'"
  );
}

if (!s.includes("const ParselHatirasiRoute =")) {
  s = s.replace(
    "const YonetimRoute = YonetimRouteImport.update({",
    "const ParselHatirasiRoute = ParselHatirasiRouteImport.update({\n  id: '/parsel-hatirasi',\n  path: '/parsel-hatirasi',\n  getParentRoute: () => rootRouteImport,\n} as any)\nconst YonetimRoute = YonetimRouteImport.update({"
  );
}

const maps = ["FileRoutesByFullPath", "FileRoutesByTo"];
for (const name of maps) {
  const marker = `export interface ${name} {`;
  if (s.includes(marker) && !s.includes(`${name} {\n  '/parsel-hatirasi'`)) {
    s = s.replace(marker, `${marker}\n  '/parsel-hatirasi': typeof ParselHatirasiRoute`);
  }
}

if (s.includes("export interface FileRoutesById {") && !s.includes("  '/parsel-hatirasi': typeof ParselHatirasiRoute\n  '/parsellerim'")) {
  s = s.replace(
    "export interface FileRoutesById {",
    "export interface FileRoutesById {\n  '/parsel-hatirasi': typeof ParselHatirasiRoute"
  );
}

if (s.includes("export interface RootRouteChildren {") && !s.includes("  ParselHatirasiRoute: typeof ParselHatirasiRoute")) {
  s = s.replace(
    "export interface RootRouteChildren {",
    "export interface RootRouteChildren {\n  ParselHatirasiRoute: typeof ParselHatirasiRoute"
  );
}

if (s.includes("const rootRouteChildren = {") && !s.includes("ParselHatirasiRoute,")) {
  s = s.replace(
    "const rootRouteChildren = {",
    "const rootRouteChildren = {\n  ParselHatirasiRoute,"
  );
}

fs.writeFileSync(file, s);
