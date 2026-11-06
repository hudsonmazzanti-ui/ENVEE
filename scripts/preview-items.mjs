// Places the built item SVGs (assets/items) in the welcome room, the way the room editor will: each item's floor
// anchor lands on a floor point, and it is scaled by roomPxPerInch / ITEM_PX_PER_INCH. Mirrored items are the same
// SVG flipped about their anchor. Writes docs/hairline-pilot.png: the welcome's emerald, and the app's linen.
//
//   npm run build:items && node scripts/preview-items.mjs
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const kernel = fs.readFileSync(path.join(root, '.claude/skills/hairline-create/kernel.js'), 'utf8');
const { spec, items } = JSON.parse(fs.readFileSync(path.join(root, 'assets/items/manifest.json'), 'utf8'));
const svgs = Object.fromEntries(items.map((m) => [m.id, fs.readFileSync(path.join(root, m.file), 'utf8')]));

// The room, in inches: 12'6" × 10' of floor, an 7' back wall along x. Floor points are where each anchor goes.
const ROOMS = {
  // The pilot: the five pieces that set the style.
  pilot: [
    { id: 'pilot-rug', at: [72, 66] },
    { id: 'pilot-floorlamp', at: [14, 28] },
    { id: 'pilot-sofa', at: [76, 21] },
    { id: 'pilot-chair', at: [36, 80], mirror: true },
    { id: 'pilot-coffeetable', at: [76, 68] },
  ],
  // Amazon best sellers together: a sectional, a torchiere, an arched lamp, a swivel recliner, a drum table.
  amazon: [
    { id: 'pilot-rug', at: [64, 74] },
    { id: 'B08T1N86Q5', at: [8, 8] },
    { id: 'B0HKDCYMFF', at: [62, 31] },
    { id: 'B086ZLGLV3', at: [124, 12], mirror: true },
    { id: 'B0F64KYP45', at: [60, 82] },
    { id: 'B0FJL9N76F', at: [130, 98] },
  ],
};
const which = process.argv[2] ?? 'pilot';
const PLACE = ROOMS[which];
const ROOM_S = 1.62; // the room's px per inch in its 400 × 320 viewBox

const GROUNDS = {
  emerald: { label: 'Welcome (emerald)', plate: '#0F5B45', hi: '#FAF8F5', edge: '#C6D6CE', mid: '#90B1A6', lo: '#5F9081' },
  linen: { label: 'App (linen)', plate: '#FAF8F5', hi: '#0F5B45', edge: '#8C867E', mid: '#B9B2A8', lo: '#D9D3CA' },
};

function compose({ spec, items, svgs, PLACE, ROOM_S, GROUNDS }) {
  const { Cam, circ, fit, hull, mk, open, poly, prism, proj, facing, rad, ringAt, rings, rrect, run, seg, solid, put } = HL;
  HL.inject(document);
  const hex = (c) => {
    const m = c.match(/\d+(\.\d+)?/g);
    return m ? '#' + m.slice(0, 3).map((v) => Math.round(+v).toString(16).padStart(2, '0')).join('').toUpperCase() : c;
  };
  const byId = Object.fromEntries(items.map((m) => [m.id, m]));
  const k = ROOM_S / spec.pxPerInch;
  const shift = (ring, cx, cy) => ring.map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
  const box = (x0, y0, x1, y1, r, b, z0, z1) => { const [ring, inner] = rings(x0, y0, x1, y1, r, b); return (P, f) => prism(P, f, ring, inner, z0, z1); };
  const onWall = (ring, wy) => (P) => ({ sil: poly(ring.map((q) => P(q.u, wy, q.v))), crease: '' });
  const drum = (cx, cy, r0, r1, z0, z1, b = 0.8) => {
    const foot = shift(circ(r0, 32), cx, cy), top = shift(circ(r1, 32), cx, cy), inner = shift(circ(r1 - b, 32), cx, cy);
    return (P, front) => ({ sil: poly(hull(ringAt(P, foot, z0).concat(ringAt(P, top, z1)))), crease: open(ringAt(P, run(inner, front), z1)) });
  };
  function leaf(P, bx, by, bz, a, len) {
    const ca = Math.cos(rad(a)), sa = Math.sin(rad(a)), ce = Math.cos(rad(55)), se = Math.sin(rad(55));
    const at = (t, w) => P(bx + ca * ce * len * t - sa * w, by + sa * ce * len * t + ca * w, bz + se * len * t);
    const side = (s) => Array.from({ length: 9 }, (_, i) => at(i / 8, s * 3.8 * Math.sin((Math.PI * i) / 8)));
    return { sil: poly([...side(1), ...side(-1).reverse()]), crease: seg(at(0.1, 0), at(0.85, 0)) };
  }

  const out = [];
  for (const [name, pal] of Object.entries(GROUNDS)) {
    const stage = document.createElement('div');
    stage.setAttribute('data-hairline', 'pilot');
    stage.setAttribute('data-hairline-theme', 'light');
    for (const key of ['plate', 'hi', 'edge', 'mid', 'lo']) stage.style.setProperty(`--hairline-${key}`, pal[key]);
    stage.style.width = '400px';
    document.body.appendChild(stage);
    const svg = mk('svg', { viewBox: '0 0 400 320' }, stage);
    const C = Cam(spec.az, spec.k, ROOM_S);
    fit(C, [[0, -5, -3], [150, 120, -3], [0, 120, -3], [150, -5, 84], [0, -5, 84]], 200, 162);
    const P = proj(C), front = facing(C);
    const g = mk('g', {}, svg);
    const add = (build, cls) => { const s = solid(g); if (cls) s.sil.setAttribute('class', cls); put(s, build(P, front)); };
    // The welcome's room, in inches: floor slab, back wall, a window with its sill.
    add(box(0, -5, 150, 120, 7, 1.8, -3, 0));
    add(box(0, -5, 150, 0, 2, 1.2, 0, 84));
    add(onWall(rrect(52, 40, 104, 70, 3, 4), 0));
    add(onWall(rrect(55.5, 43.5, 100.5, 66.5, 1.5, 4), 0), 'nf lo');
    add((P) => ({ sil: seg(P(78, 0, 43.5), P(78, 0, 66.5)) + seg(P(55.5, 0, 55), P(100.5, 0, 55)), crease: '' }), 'nf lo');
    add(box(50, 0, 106, 4, 1, 0.6, 38, 40));
    // Bake the room's computed colours into attributes, so it sits beside the items' baked ones.
    for (const el of svg.querySelectorAll('path')) {
      const cs = getComputedStyle(el);
      el.setAttribute('fill', cs.fill === 'none' ? 'none' : hex(cs.fill));
      el.setAttribute('stroke', cs.stroke === 'none' ? 'none' : hex(cs.stroke));
      el.removeAttribute('class');
    }
    const room = svg.innerHTML;

    // The items: flat ones first, then back to front by their floor anchor (x + y).
    const recolor = (s) => s.replace(/#FAF8F5/g, pal.plate).replace(/#8C867E/g, pal.edge).replace(/#B9B2A8/g, pal.mid).replace(/#D9D3CA/g, pal.lo);
    const order = [...PLACE].sort((a, b) => {
      const fa = byId[a.id].dims.h < 2, fb = byId[b.id].dims.h < 2;
      return fa !== fb ? (fa ? -1 : 1) : a.at[0] + a.at[1] - (b.at[0] + b.at[1]);
    });
    let body = '';
    for (const p of order) {
      const m = byId[p.id];
      const [sx, sy] = P(p.at[0], p.at[1], 0);
      const inner = recolor(svgs[p.id]).replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
      body += `<g transform="translate(${sx} ${sy}) scale(${p.mirror ? -k : k} ${k}) translate(${-m.anchor.x} ${-m.anchor.y})">${inner}</g>`;
    }
    // The plant stays the room's own, nearest the viewer at the front left.
    const g2 = mk('g', {}, svg);
    svg.innerHTML = '';
    svg.appendChild(g2);
    const add2 = (build, cls) => { const s = solid(g2); if (cls) s.sil.setAttribute('class', cls); put(s, build(P, front)); };
    add2(drum(12, 104, 5, 6.5, 0, 13));
    for (const a of [225, 180, 270, 135, 315, 90, 0, 45]) add2((P) => leaf(P, 12, 104, 12, a, a % 90 ? 15 : 13));
    for (const el of svg.querySelectorAll('path')) {
      const cs = getComputedStyle(el);
      el.setAttribute('fill', cs.fill === 'none' ? 'none' : hex(cs.fill));
      el.setAttribute('stroke', cs.stroke === 'none' ? 'none' : hex(cs.stroke));
      el.removeAttribute('class');
    }
    const plant = svg.innerHTML;
    stage.remove();
    const sw = spec.stroke * k;
    out.push({
      label: pal.label,
      plate: pal.plate,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320"><rect width="400" height="320" fill="${pal.plate}"/><g stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">${room}</g>${body}<g stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">${plant}</g></svg>`,
    });
  }
  return out;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1320, height: 600 }, deviceScaleFactor: 2 });
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: kernel });
const panels = await page.evaluate(compose, { spec, items, svgs, PLACE, ROOM_S, GROUNDS });
await page.setContent(`<!doctype html><html><body style="margin:0;background:#FFFFFF;font:14px system-ui;color:#5F5A54">
<div style="display:flex;gap:20px;padding:20px">${panels
  .map((p) => `<figure style="margin:0"><div style="width:630px;height:504px;border-radius:12px;overflow:hidden">${p.svg.replace('<svg ', '<svg width="630" height="504" ')}</div><figcaption style="margin-top:8px">${p.label}</figcaption></figure>`)
  .join('')}</div></body></html>`);
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
await page.screenshot({ path: path.join(root, which === 'pilot' ? 'docs/hairline-pilot.png' : `docs/hairline-room-${which}.png`), fullPage: true });
await browser.close();
console.log(`wrote the ${which} room`);
