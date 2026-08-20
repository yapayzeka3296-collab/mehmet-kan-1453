const { createRequire } = require('node:module');
const requireFromServer = createRequire(__filename);

(async () => {
  const { spawn } = requireFromServer('node:child_process');
  const { join } = requireFromServer('node:path');
  const serverEntry = join(__dirname, '.output', 'server', 'index.mjs');
  const child = spawn(process.execPath, [serverEntry], {
    stdio: 'inherit',
    env: { ...process.env, PORT: process.env.PORT || '3000', HOST: process.env.HOST || '0.0.0.0' }
  });
  child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
})();
