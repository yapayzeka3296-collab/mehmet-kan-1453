import fs from "node:fs";
import path from "node:path";

const file = path.resolve("src/routeTree.gen.ts");
if (!fs.existsSync(file)) process.exit(0);
let s = fs.readFileSync(file, "utf8");

const route = "/parsel-hatirasi";
const typeLine = "  '/parsel-hatirasi': typeof ParselHatirasiRoute";

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

for (const name of ["FileRoutesByFullPath", "FileRoutesByTo"]) {
  const marker = `export interface ${name} {`;
  if (s.includes(marker) && !s.includes(`export interface ${name} {\n${typeLine}`)) {
    s = s.replace(marker, `${marker}\n${typeLine}`);
  }
}

if (s.includes("export interface FileRoutesById {") && !s.includes(`export interface FileRoutesById {\n${typeLine}`)) {
  s = s.replace("export interface FileRoutesById {", `export interface FileRoutesById {\n${typeLine}`);
}

if (s.includes("export interface RootRouteChildren {") && !s.includes("  ParselHatirasiRoute: typeof ParselHatirasiRoute")) {
  s = s.replace("export interface RootRouteChildren {", "export interface RootRouteChildren {\n  ParselHatirasiRoute: typeof ParselHatirasiRoute");
}

const unionNeedles = [
  "    | '/siparislerim'\n    | '/yonetim'",
];
for (const needle of unionNeedles) {
  if (s.includes(needle) && !s.includes(`    | '${route}'\n    | '/yonetim'`)) {
    s = s.replace(needle, `    | '/siparislerim'\n    | '${route}'\n    | '/yonetim'`);
  }
}

const declareNeedle = "    '/yonetim': {\n      id: '/yonetim'";
if (s.includes(declareNeedle) && !s.includes(`    '${route}': {`)) {
  s = s.replace(
    declareNeedle,
    `    '${route}': {\n      id: '${route}'\n      path: '${route}'\n      fullPath: '${route}'\n      preLoaderRoute: typeof ParselHatirasiRouteImport\n      parentRoute: typeof rootRouteImport\n    }\n${declareNeedle}`
  );
}

if (s.includes("const rootRouteChildren: RootRouteChildren = {") && !s.includes("  ParselHatirasiRoute: ParselHatirasiRoute,")) {
  s = s.replace(
    "  SiparislerimRoute: SiparislerimRoute,",
    "  SiparislerimRoute: SiparislerimRoute,\n  ParselHatirasiRoute: ParselHatirasiRoute,"
  );
}

fs.writeFileSync(file, s);
