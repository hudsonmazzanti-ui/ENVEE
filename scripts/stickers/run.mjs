// npm run stickers [-- --force | --only ASIN]
// Runs the sticker maker in the project's Python venv, then regenerates src/theme/assets.ts.
// One-time setup:  py -m venv .venv  &&  .venv/Scripts/python -m pip install "rembg[cpu]" pillow
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const python = [path.join(root, '.venv/Scripts/python.exe'), path.join(root, '.venv/bin/python')].find((p) => fs.existsSync(p));
if (!python) {
  console.error('No .venv found. Set it up first:\n  py -m venv .venv\n  .venv/Scripts/python -m pip install "rembg[cpu]" pillow');
  process.exit(1);
}
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: root });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run(python, [path.join(root, 'scripts/stickers/make_stickers.py'), ...process.argv.slice(2)]);
run(process.execPath, [path.join(root, 'scripts/gen-assets.mjs')]);
