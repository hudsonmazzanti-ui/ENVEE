// A review sheet for the built items: each drawing at the one shared scale (so sizes compare truly) beside the photo
// it was drawn from. Writes docs/hairline-items.png (the 30 stickered items), or with --all, one sheet per 40 items
// to the folder given (default .cache/sheets).
//
//   npm run build:items && node scripts/sheet-items.mjs [--all [dir]]
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { items } = JSON.parse(fs.readFileSync(path.join(root, 'assets/items/manifest.json'), 'utf8'));
const SCALE = 1.25; // screen px per viewBox unit, the same for every item
const COLS = 5, CELL = 300;

const all = process.argv[2] === '--all';
const outDir = all ? path.resolve(process.argv[3] ?? path.join(root, '.cache/sheets')) : path.join(root, 'docs');
const stickered = new Set(fs.readdirSync(path.join(root, 'assets/stickers')).map((f) => f.replace(/\.webp$/, '')));
const cells = items
  .filter((m) => m.dimsFrom !== 'spec' && (all || stickered.has(m.productId)))
  .map((m) => {
    const svg = fs.readFileSync(path.join(root, m.file), 'utf8').replace('<svg ', `<svg style="width:${m.view.w * SCALE}px;height:${m.view.h * SCALE}px;max-width:${CELL - 16}px;max-height:${CELL - 70}px" `);
    const st = path.join(root, 'assets/stickers', m.productId + '.webp');
    const jpg = path.join(root, '.cache/photos', m.productId + '.jpg');
    const [file, type] = fs.existsSync(st) ? [st, 'webp'] : fs.existsSync(jpg) ? [jpg, 'jpeg'] : [];
    const photo = file ? `<img src="data:image/${type};base64,${fs.readFileSync(file).toString('base64')}" style="position:absolute;right:6px;top:6px;width:${all ? 96 : 64}px;height:${all ? 96 : 64}px;object-fit:contain;opacity:.9">` : '';
    const d = m.dims;
    return `<div style="position:relative;width:${CELL}px;height:${CELL}px;border:1px solid #E7E2DB;border-radius:10px;background:#FAF8F5;display:flex;align-items:center;justify-content:center;overflow:hidden">
      ${photo}${svg}
      <div style="position:absolute;left:8px;bottom:6px;right:8px;font:11px system-ui;color:#5F5A54;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.productId} · ${d.w}×${d.d}×${d.h}"${m.dimsFrom === 'estimate' ? ' est.' : ''}<br>${(m.name ?? '').slice(0, 44)}</div></div>`;
  });

const PAGE = all ? 40 : cells.length;
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: COLS * (CELL + 10) + 28, height: 800 }, deviceScaleFactor: all ? 1 : 2 });
for (let i = 0; i < cells.length; i += PAGE) {
  const html = `<!doctype html><html><body style="margin:0;background:#fff"><div style="display:grid;grid-template-columns:repeat(${COLS},${CELL}px);gap:10px;padding:14px">${cells.slice(i, i + PAGE).join('')}</div></body></html>`;
  await page.setContent(html);
  const file = all ? path.join(outDir, `items-${String(i / PAGE).padStart(2, '0')}.png`) : path.join(outDir, 'hairline-items.png');
  await page.screenshot({ path: file, fullPage: true });
}
await browser.close();
console.log(`wrote ${cells.length} items to ${path.relative(root, outDir) || '.'}`);
