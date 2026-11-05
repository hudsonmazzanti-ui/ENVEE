// Renders ENVEE's static line art (hairline/art/scenes.js, drawn on the Hairline kernel) to plain SVG files in
// assets/line, with every colour and stroke baked into attributes, so expo-image can show them on iOS, Android
// and web without CSS, classes or a WebView. Then regenerates src/theme/assets.ts.
//
//   npm run build:line-art
//
// Needs Playwright + Chromium (the same as scripts/generate-art.js).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'assets/line');
const kernel = fs.readFileSync(path.join(root, '.claude/skills/hairline-create/kernel.js'), 'utf8');
const scenes = fs.readFileSync(path.join(root, 'hairline/art/scenes.js'), 'utf8');

// The two grounds. Linen: stone lines with one emerald stroke, for anything beside photos.
// Emerald: the welcome room's own palette, for full-screen moments.
const GROUNDS = {
  linen: { plate: '#FFFFFF', bg: '#FAF8F5', hi: '#0F5B45', edge: '#8C867E', mid: '#B9B2A8', lo: '#D9D3CA' },
  emerald: { plate: '#0F5B45', bg: '#0F5B45', hi: '#FAF8F5', edge: '#C6D6CE', mid: '#90B1A6', lo: '#5F9081' },
};

function render(GROUNDS) {
  const NS = 'http://www.w3.org/2000/svg';
  HL.inject(document);
  const hex = (c) => {
    const m = c.match(/\d+(\.\d+)?/g);
    return m ? '#' + m.slice(0, 3).map((v) => Math.round(+v).toString(16).padStart(2, '0')).join('').toUpperCase() : c;
  };
  const files = [];
  for (const sc of window.ENVEE_SCENES) {
    const pal = { ...GROUNDS[sc.ground] };
    if (sc.bg) pal.plate = pal.bg; // a room is a full-bleed picture: its plates are the ground colour
    const stage = document.createElement('div');
    stage.setAttribute('data-hairline', sc.name);
    stage.setAttribute('data-hairline-theme', 'light');
    for (const k of ['plate', 'hi', 'edge', 'mid', 'lo']) stage.style.setProperty(`--hairline-${k}`, pal[k]);
    stage.style.width = sc.view[0] + 'px';
    document.body.appendChild(stage);
    const svg = HL.mk('svg', { viewBox: `0 0 ${sc.view[0]} ${sc.view[1]}` }, stage);
    const C = HL.Cam(...sc.cam);
    HL.fit(C, ...sc.fit);
    const P = HL.proj(C), front = HL.facing(C);
    const g = HL.mk('g', {}, svg);
    sc.draw({
      P,
      front,
      add(build, cls) {
        const s = HL.solid(g);
        if (cls) s.sil.setAttribute('class', cls);
        HL.put(s, build(P, front));
      },
    });

    // Bake the computed style of every path into attributes; drop empty paths and classes.
    const paths = [];
    for (const el of svg.querySelectorAll('path')) {
      const d = el.getAttribute('d');
      if (!d) continue;
      const cs = getComputedStyle(el);
      paths.push({ d, fill: cs.fill === 'none' ? 'none' : hex(cs.fill), stroke: cs.stroke === 'none' ? 'none' : hex(cs.stroke), dash: cs.strokeDasharray !== 'none' });
    }
    stage.remove();

    const weights = { '': sc.sw, ...Object.fromEntries(Object.entries(sc.variants ?? {}).map(([k, v]) => ['-' + k, v])) };
    for (const [suffix, sw] of Object.entries(weights)) {
      const [w, h] = sc.view;
      const body = paths
        .map((p) => `<path d="${p.d}" fill="${p.fill}" stroke="${p.stroke}"${p.dash ? ` stroke-dasharray="${+(sw * 1.2).toFixed(2)} ${+(sw * 3).toFixed(2)}"` : ''}/>`)
        .join('');
      const bg = sc.bg ? `<rect width="${w}" height="${h}" fill="${pal.bg}"/>` : '';
      files.push({
        name: sc.name + suffix,
        svg: `<svg xmlns="${NS}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg}<g stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>\n`,
      });
    }
  }
  return files;
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: kernel });
await page.addScriptTag({ content: scenes });
const files = await page.evaluate(render, GROUNDS);
await browser.close();

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of files) fs.writeFileSync(path.join(out, f.name + '.svg'), f.svg);
console.log(`wrote ${files.length} files to assets/line`);
execFileSync('node', [path.join(root, 'scripts/gen-assets.mjs')], { stdio: 'inherit' });
