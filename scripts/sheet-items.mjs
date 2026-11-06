// A review sheet for the built items: each drawing at the one shared scale (so sizes compare truly) beside the photo
// it was drawn from. Writes docs/hairline-items.png.
//
//   npm run build:items && node scripts/sheet-items.mjs
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { items } = JSON.parse(fs.readFileSync(path.join(root, 'assets/items/manifest.json'), 'utf8'));
const SCALE = 1.25; // screen px per viewBox unit, the same for every item
const COLS = 5, CELL = 300;

const cells = items
  .filter((m) => m.dimsFrom !== 'spec')
  .map((m) => {
    const svg = fs.readFileSync(path.join(root, m.file), 'utf8').replace('<svg ', `<svg style="width:${m.view.w * SCALE}px;height:${m.view.h * SCALE}px;max-width:${CELL - 16}px;max-height:${CELL - 70}px" `);
    const st = path.join(root, 'assets/stickers', m.productId + '.webp');
    const photo = fs.existsSync(st) ? `<img src="data:image/webp;base64,${fs.readFileSync(st).toString('base64')}" style="position:absolute;right:6px;top:6px;width:64px;height:64px;object-fit:contain;opacity:.9">` : '';
    const d = m.dims;
    return `<div style="position:relative;width:${CELL}px;height:${CELL}px;border:1px solid #E7E2DB;border-radius:10px;background:#FAF8F5;display:flex;align-items:center;justify-content:center;overflow:hidden">
      ${photo}${svg}
      <div style="position:absolute;left:8px;bottom:6px;right:8px;font:11px system-ui;color:#5F5A54;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.productId} · ${d.w}×${d.d}×${d.h}"${m.dimsFrom === 'estimate' ? ' est.' : ''}<br>${(m.name ?? '').slice(0, 44)}</div></div>`;
  });

const html = `<!doctype html><html><body style="margin:0;background:#fff"><div style="display:grid;grid-template-columns:repeat(${COLS},${CELL}px);gap:10px;padding:14px">${cells.join('')}</div></body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: COLS * (CELL + 10) + 28, height: 800 }, deviceScaleFactor: 2 });
await page.setContent(html);
await page.screenshot({ path: path.join(root, 'docs/hairline-items.png'), fullPage: true });
await browser.close();
console.log(`wrote docs/hairline-items.png (${cells.length} items)`);
