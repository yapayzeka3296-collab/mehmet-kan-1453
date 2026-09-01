import { Generator, getConfig } from '@tanstack/router-generator';

const root = process.cwd();
const config = getConfig(
  {
    target: 'react',
    routesDirectory: './src/routes',
    generatedRouteTree: './src/routeTree.gen.ts',
    routeFileIgnorePrefix: '-',
    quoteStyle: 'single',
    semicolons: false,
    enableRouteTreeFormatting: true,
  },
  root,
);

const generator = new Generator({ config, root });
await generator.run();
console.log('TanStack route tree generated successfully.');
