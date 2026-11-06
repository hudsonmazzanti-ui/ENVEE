// Renders ENVEE's furniture line art (hairline/items/: kit.js, then pilot.js and amazon.js, drawn on the Hairline kernel) to one SVG per item in
// assets/items, with colours and stroke baked into attributes and a transparent background, then writes the manifest:
// assets/items/manifest.json (for tooling) and src/data/itemManifest.ts (for the app).
//
//   npm run build:items
//
// Every item is drawn in one view at one scale: Cam(45, 0.5, PX_PER_INCH). See docs/hairline-assets.md.
// Needs Playwright + Chromium (the same as scripts/build-line-art.mjs).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'assets/items');
const kernel = fs.readFileSync(path.join(root, '.claude/skills/hairline-create/kernel.js'), 'utf8');
const sources = ['kit.js', 'pilot.js', 'amazon.js'].map((f) => fs.readFileSync(path.join(root, 'hairline/items', f), 'utf8'));
// The Amazon cache: each product's title and main photo become the item's name and sourceImage.
const cache = JSON.parse(fs.readFileSync(path.join(root, 'data/catalog/amazon-bestsellers.json'), 'utf8'));
const cached = Object.fromEntries(Object.values(cache.categories).flatMap((c) => c.products ?? c).map((p) => [p.asin, p]));

// The spec's numbers. Change them in docs/hairline-assets.md first.
export const SPEC = {
  az: 45, // camera azimuth, degrees
  k: 0.5, // sin(elevation): 30° above the floor, the 2:1 view
  pxPerInch: 2, // the camera scale S: viewBox units per world inch
  stroke: 1.1, // viewBox units, every line
  pad: 2, // viewBox units of clear space round the drawing
  // Linen, the app's neutral ground: warm stone lines on an ivory fill.
  palette: { plate: '#FAF8F5', hi: '#0F5B45', edge: '#8C867E', mid: '#B9B2A8', lo: '#D9D3CA' },
};

function render(SPEC) {
  HL.inject(document);
  const hex = (c) => {
    const m = c.match(/\d+(\.\d+)?/g);
    return m ? '#' + m.slice(0, 3).map((v) => Math.round(+v).toString(16).padStart(2, '0')).join('').toUpperCase() : c;
  };
  const r2 = (n) => Math.round(n * 100) / 100;
  const results = [];
  for (const it of window.ENVEE_ITEMS) {
    const stage = document.createElement('div');
    stage.setAttribute('data-hairline', it.id);
    stage.setAttribute('data-hairline-theme', 'light');
    for (const [k, v] of Object.entries(SPEC.palette)) stage.style.setProperty(`--hairline-${k}`, v);
    stage.style.width = '800px';
    document.body.appendChild(stage);
    const svg = HL.mk('svg', { viewBox: '0 0 800 800' }, stage);
    const C = HL.Cam(SPEC.az, SPEC.k, SPEC.pxPerInch);

    const draw = () => {
      svg.replaceChildren();
      const P = HL.proj(C), front = HL.facing(C), g = HL.mk('g', {}, svg);
      it.draw((build, cls) => {
        const s = HL.solid(g);
        if (cls) s.sil.setAttribute('class', cls);
        HL.put(s, build(P, front));
      });
      return { P, g };
    };
    // First pass at the origin to measure, then again shifted so the drawing starts at (pad, pad).
    C.ox = 0; C.oy = 0;
    const b = draw().g.getBBox();
    C.ox = SPEC.pad - b.x; C.oy = SPEC.pad - b.y;
    const { P } = draw();
    const w = Math.ceil(b.width + 2 * SPEC.pad), h = Math.ceil(b.height + 2 * SPEC.pad);

    const paths = [];
    for (const el of svg.querySelectorAll('path')) {
      const d = el.getAttribute('d');
      if (!d) continue;
      const cs = getComputedStyle(el);
      paths.push(`<path d="${d}" fill="${cs.fill === 'none' ? 'none' : hex(cs.fill)}" stroke="${cs.stroke === 'none' ? 'none' : hex(cs.stroke)}"/>`);
    }
    stage.remove();

    const foot = it.foot ?? { x0: 0, y0: 0, x1: it.dims.w, y1: it.dims.d, shape: 'rect' };
    const fcx = (foot.x0 + foot.x1) / 2, fcy = (foot.y0 + foot.y1) / 2;
    const [ax, ay] = P(fcx, fcy, 0);
    const outline = foot.shape === 'ellipse'
      ? Array.from({ length: 24 }, (_, i) => { const t = (2 * Math.PI * i) / 24; return P(fcx + ((foot.x1 - foot.x0) / 2) * Math.cos(t), fcy + ((foot.y1 - foot.y0) / 2) * Math.sin(t), 0); })
      : [[foot.x0, foot.y0], [foot.x1, foot.y0], [foot.x1, foot.y1], [foot.x0, foot.y1]].map(([x, y]) => P(x, y, 0));

    results.push({
      id: it.id,
      productId: it.productId,
      name: it.name ?? null,
      dimsFrom: it.dimsFrom ?? 'spec',
      file: `assets/items/${it.id}.svg`,
      view: { w, h },
      dims: it.dims,
      anchor: { x: r2(ax), y: r2(ay) },
      footprint: { shape: foot.shape, w: foot.x1 - foot.x0, d: foot.y1 - foot.y0, outline: outline.map(([x, y]) => [r2(x), r2(y)]) },
      sourceImage: it.source ?? null,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><g stroke-width="${SPEC.stroke}" stroke-linejoin="round" stroke-linecap="round">${paths.join('')}</g></svg>\n`,
    });
  }
  return results;
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: kernel });
for (const content of sources) await page.addScriptTag({ content });
const results = (await page.evaluate(render, SPEC)).map((r) => {
  const c = cached[r.productId];
  return c ? { ...r, name: r.name ?? c.name.split(' | ')[0], sourceImage: c.imageUrl, productUrl: c.productUrl } : r;
});
await browser.close();

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const r of results) fs.writeFileSync(path.join(root, r.file), r.svg);
const manifest = results.map(({ svg, ...m }) => m);
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({ spec: SPEC, items: manifest }, null, 2) + '\n');

const ts = `// AUTO-GENERATED by scripts/build-items.mjs from hairline/items/items.js. Do not edit by hand.
// Every item is drawn in one view (Cam(${SPEC.az}°, k ${SPEC.k})) at ${SPEC.pxPerInch} viewBox units per inch. See docs/hairline-assets.md.
import type { ImageSourcePropType } from 'react-native';

/** viewBox units per real inch, the same for every item: scale an item by roomPxPerInch / ITEM_PX_PER_INCH. */
export const ITEM_PX_PER_INCH = ${SPEC.pxPerInch};

export type ItemAsset = {
  id: string;
  /** The catalog product this drawing is of (an ASIN for Amazon pieces); null for a style reference. */
  productId: string | null;
  name: string | null;
  /** Where dims came from: the product title ('name'), a typical size for the kind ('estimate'), or the pilot spec. */
  dimsFrom: 'name' | 'estimate' | 'spec';
  /** The SVG, transparent background, drawn front-left. Mirror it (scaleX -1 about anchor.x) for the other side. */
  svg: ImageSourcePropType;
  file: string;
  /** The SVG's size, in viewBox units. */
  view: { w: number; h: number };
  /** Real size in inches: width × depth × height. */
  dims: { w: number; d: number; h: number };
  /** The centre of where the piece touches the floor, in viewBox units from the SVG's top left. */
  anchor: { x: number; y: number };
  /** Where it touches the floor: its size in inches, and its outline in viewBox units. */
  footprint: { shape: 'rect' | 'ellipse'; w: number; d: number; outline: [number, number][] };
  /** The original product photo's URL, for "see real photo". null until the catalog has one. */
  sourceImage: string | null;
  /** The product's page, when known. */
  productUrl?: string;
};

const svgs: Record<string, ImageSourcePropType> = {
${results.map((r) => `  ${JSON.stringify(r.id)}: require('../../${r.file}'),`).join('\n')}
};

// JSON, so the outlines are plain arrays: typed as the manifest says.
const data = ${JSON.stringify(manifest, null, 2)} as unknown as Omit<ItemAsset, 'svg'>[];

export const itemAssets: ItemAsset[] = data.map((m) => ({ ...m, svg: svgs[m.id] }));

export const itemForProduct = (productId: string) => itemAssets.find((a) => a.productId === productId);
`;
fs.writeFileSync(path.join(root, 'src/data/itemManifest.ts'), ts);
console.log(`wrote ${results.length} items to assets/items, and src/data/itemManifest.ts`);
