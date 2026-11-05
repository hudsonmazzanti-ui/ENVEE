// Assembles the Hairline room figure (hairline/layers.js) and the Hairline kernel into one
// self-contained HTML page for the Welcome screen, with no bench chrome (slider, buttons, captions).
//
//   npm run build:hairline  ->  src/components/hairline/roomSceneHtml.ts
//
// Re-run after editing hairline/layers.js. The page posts two messages to the app:
// "open" when a swipe up is long enough or fast enough, "tap" on a tap.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const kernel = fs.readFileSync(path.join(root, '.claude/skills/hairline-create/kernel.js'), 'utf8');
const figure = fs.readFileSync(path.join(root, 'hairline/layers.js'), 'utf8');
// ENVEE emerald (C.accent) for the plate; the lines are the app's off-white (C.canvas), stepped toward the green
// for the dimmer strokes so the brightest line still stands out.
const PALETTE = { plate: '#0F5B45', hi: '#FAF8F5', edge: '#C6D6CE', mid: '#90B1A6', lo: '#5F9081' };
const vars = Object.entries(PALETTE).map(([k, v]) => `--hairline-${k}: ${v};`).join(' ');

// Mounts the figure the way the bench does, minus the controls. The read-out goes to a hidden live region.
const host = `
window.hairline = (f) => {
  const stage = document.getElementById("stage"), live = document.getElementById("read");
  HL.inject(document);
  stage.setAttribute("data-hairline", f.name);
  stage.setAttribute("data-hairline-theme", "light");
  stage.setAttribute("role", "img");
  stage.setAttribute("aria-label", f.means);
  const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
  const read = { get textContent() { return live.textContent; }, set textContent(v) { live.textContent = v; } };
  f.mount({ stage, svg, read }, f.range[1]);
};`;

// The reel gesture. The page owns the touch (touch-action: none) and drives the figure with synthetic
// pointer events, so the figure itself is unchanged: its x is the gap, so swipe progress becomes x.
// Swiping up pulls the room apart under the finger. On release it enters the app if the swipe was
// long (ENTER_DIST of the screen height, however slow) or a quick flick (FLICK px/ms, at least
// FLICK_MIN px); otherwise the room springs back. A tap enters too.
const swipe = `
(() => {
  const ENTER_DIST = 0.3, FLICK = 0.3, FLICK_MIN = 24, TAP = 8;
  const stage = document.getElementById("stage");
  const post = (m) => window.ReactNativeWebView ? window.ReactNativeWebView.postMessage(m) : parent.postMessage({ hairline: m }, "*");
  // Feed the figure a pointer at viewBox point (vx, vy), using the kernel's own screen-to-viewBox mapping.
  const feed = (type, vx, vy) => {
    const r = stage.getBoundingClientRect();
    stage.dispatchEvent(new PointerEvent(type, { pointerType: "mouse", pointerId: 1, bubbles: true,
      clientX: r.left + (vx / 400) * r.width, clientY: r.top + (vy / 320) * r.height }));
  };
  // vy 0 keeps the couch (the layer that lifts highest) bright while the room comes apart.
  const progress = (p) => feed("pointermove", 60 + 220 * Math.min(1, Math.max(0, p)), 0);
  let y0 = null, samples = [], done = false;
  // Real events stop here; the synthetic ones fed above pass through to the figure untouched.
  const swallow = (e) => { if (!e.isTrusted) return false; e.stopImmediatePropagation(); return true; };
  for (const t of ["pointerover", "pointerenter", "pointerleave", "pointerout"]) window.addEventListener(t, swallow, true);
  window.addEventListener("pointerdown", (e) => {
    if (!swallow(e) || done) return;
    y0 = e.clientY; samples = [[e.timeStamp, e.clientY]];
  }, true);
  window.addEventListener("pointermove", (e) => {
    if (!swallow(e) || y0 === null || done) return;
    samples.push([e.timeStamp, e.clientY]);
    if (samples.length > 8) samples.shift();
    progress((y0 - e.clientY) / (innerHeight * ENTER_DIST));
  }, true);
  const end = (e, cancelled) => {
    if (!swallow(e) || y0 === null || done) return;
    const dy = y0 - e.clientY;
    const recent = samples.filter(([t]) => e.timeStamp - t < 150);
    const [t1, y1] = recent[0] || samples[0];
    const v = (y1 - e.clientY) / Math.max(1, e.timeStamp - t1);
    y0 = null;
    if (!cancelled && (dy >= innerHeight * ENTER_DIST || (dy >= FLICK_MIN && v >= FLICK))) {
      done = true; progress(1); post("open");
    } else if (!cancelled && Math.abs(dy) < TAP) {
      done = true; post("tap");
    } else {
      feed("pointerleave", 0, 0);
    }
  };
  window.addEventListener("pointerup", (e) => end(e, false), true);
  window.addEventListener("pointercancel", (e) => end(e, true), true);
  // When the app comes back to this screen, the page is reused: reset.
  window.addEventListener("pageshow", () => { done = false; feed("pointerleave", 0, 0); });
  window.hairlineReset = () => { done = false; y0 = null; feed("pointerleave", 0, 0); };
})();`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: ${PALETTE.plate}; -webkit-tap-highlight-color: transparent; }
  #stage { width: 100%; height: 100%; aspect-ratio: auto; touch-action: none; ${vars} cursor: grab; }
  /* Full screen: the drawing is drawn larger than the stage's width, centred a little above the middle. */
  #stage > svg { inset: auto; left: 50%; top: 46%; width: min(164vw, 118vh); height: auto; aspect-ratio: 5 / 4; transform: translate(-50%, -50%); }
  #read { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
</style></head>
<body><div id="stage"></div><span id="read" aria-live="polite"></span>
<script>${kernel}</script>
<script>${host}</script>
<script>${figure}</script>
<script>${swipe}</script>
</body></html>`;

const out = path.join(root, 'src/components/hairline/roomSceneHtml.ts');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(
  out,
  `// AUTO-GENERATED by scripts/build-hairline.mjs from hairline/layers.js. Do not edit by hand.\n` +
    `export const roomSceneHtml = ${JSON.stringify(html)};\n`,
);
console.log(`wrote ${path.relative(root, out)} (${(html.length / 1024).toFixed(1)} KB)`);
