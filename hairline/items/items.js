/**
 * ENVEE's furniture as Hairline line-art assets. See docs/hairline-assets.md for the spec.
 *
 * Every item is drawn in the same world, in the same view:
 *   - one world unit is one inch
 *   - x runs across the piece's width (0..w), y from its back (0) to its front (d), z up from the floor (0)
 *   - the camera is the welcome room's: Cam(45, 0.5, 2), so the front faces lower-left and the +x end lower-right
 *   - parts are appended back to front (rule 06): ascending x + y, then upward
 *
 * scripts/build-items.mjs renders each one to assets/items/<id>.svg with its colours baked in, and writes the
 * manifest (src/data/itemManifest.ts). The other 3/4 side is the same SVG mirrored in code, never drawn twice.
 *
 * Each item: { id, productId, name, dims: { w, d, h }, foot: { x0, y0, x1, y1, shape }, draw(add) }
 *   dims  the real bounding box, in inches
 *   foot  where the piece touches the floor, in world inches; its centre is the floor anchor.
 *         Defaults to the whole w × d box. shape is "rect" or "ellipse".
 *   draw  add(build, cls): build(P, front) returns {sil, crease}; cls is a kernel class ("nf lo", "nf sil")
 */
(() => {
  const { circ, hull, open, poly, prism, rad, ringAt, rings, rrect, run } = HL;

  const shift = (ring, cx, cy) => ring.map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
  /** A rounded box from z0 to z1. */
  const box = (x0, y0, x1, y1, r, b, z0, z1) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, b);
    return (P, front) => prism(P, front, ring, inner, z0, z1);
  };
  /** A round solid centred on (cx, cy): radius r0 at its foot, r1 at its top. */
  const drum = (cx, cy, r0, r1, z0, z1, b = 0.8) => {
    const foot = shift(circ(r0, 40), cx, cy), top = shift(circ(r1, 40), cx, cy), inner = shift(circ(Math.max(0.2, r1 - b), 40), cx, cy);
    return (P, front) => ({
      sil: poly(hull(ringAt(P, foot, z0).concat(ringAt(P, top, z1)))),
      crease: open(ringAt(P, run(inner, front), z1)),
    });
  };
  /** An ellipse ring centred on (cx, cy), half-axes a (x) and b (y), with true normals. */
  const oval = (cx, cy, a, b, n = 96) =>
    Array.from({ length: n }, (_, k) => {
      const t = (2 * Math.PI * k) / n, nu = b * Math.cos(t), nv = a * Math.sin(t), l = Math.hypot(nu, nv);
      return { u: cx + a * Math.cos(t), v: cy + b * Math.sin(t), nu: nu / l, nv: nv / l };
    });
  /** A flat outline lying at height z: a ring in (u = x, v = y). */
  const onTop = (ring, z) => (P) => ({ sil: poly(ringAt(P, ring, z)), crease: "" });
  /** A splayed leg: a small rounded square at the top (x, y, z1) and a smaller one at the foot, pushed out by (dx, dy). */
  const leg = (x, y, dx, dy, w0, w1, z0, z1) => {
    const top = rrect(x - w1 / 2, y - w1 / 2, x + w1 / 2, y + w1 / 2, w1 / 2.4);
    const foot = rrect(x + dx - w0 / 2, y + dy - w0 / 2, x + dx + w0 / 2, y + dy + w0 / 2, w0 / 2.4);
    return (P) => ({ sil: poly(hull(ringAt(P, foot, z0).concat(ringAt(P, top, z1)))), crease: "" });
  };
  /** A line through world points, drawn as one open stroke. */
  const path = (pts) => (P) => ({ sil: open(pts.map((p) => P(...p))), crease: "" });

  const items = [];

  // ---------------------------------------------------------------- sofa
  // Emerald Velvet Sofa, 84" W × 36" D × 33" H: tapered legs, rounded track arms, two back and two seat cushions.
  items.push({
    id: "sofa", productId: "sofa", name: "Emerald Velvet Sofa",
    dims: { w: 84, d: 36, h: 33 },
    draw(add) {
      const W = 84, D = 36, arm = 10, legH = 5;
      for (const [x, y] of [[5, 5], [W - 5, 5], [5, D - 4], [W - 5, D - 4]]) add(leg(x, y, 0, 0, 1.4, 2.2, 0, legH));
      add(box(0, 3, arm, D, 5, 1.6, legH, 25));
      add(box(arm, 3, W - arm, D, 2, 1, legH, 15));
      add(box(arm - 1, 0, W - arm + 1, 10, 4, 1.6, legH + 4, 33));
      const cw = (W - 2 * arm) / 2;
      for (let i = 0; i < 2; i++) add(box(arm + i * cw + 0.6, 9, arm + (i + 1) * cw - 0.6, 15, 4, 1.4, 15, 29.5));
      for (let i = 0; i < 2; i++) add(box(arm + i * cw + 0.6, 13, arm + (i + 1) * cw - 0.6, D - 0.5, 3.5, 1.4, 15, 20));
      add(box(W - arm, 3, W, D, 5, 1.6, legH, 25));
    },
  });

  // ---------------------------------------------------------------- arc floor lamp
  // Arc Floor Lamp, Brass, 72" H × 48" reach: a marble slab base, a brass arc, a domed shade hanging at the end.
  // The arc reaches along +x; mirroring sends it the other way. The footprint is only the base.
  items.push({
    id: "floorlamp", productId: "floorlamp", name: "Arc Floor Lamp, Brass",
    dims: { w: 63, d: 16, h: 72 },
    foot: { x0: 0, y0: 2, x1: 14, y1: 14, shape: "rect" },
    draw(add) {
      const bx = 7, by = 8, sx = bx + 48, top = 72, rim = 52, R = 8, dome = 7.5, r = 20;
      add(box(0, 2, 14, 14, 3, 1, 0, 2.4));
      // the arc: straight up, a quarter round to the top, then a long quarter ellipse down to the shade's crown
      const crown = rim + dome, arc = [[bx, by, 2.4]];
      for (let i = 0; i <= 16; i++) { const a = rad(180 - (90 * i) / 16); arc.push([bx + r + r * Math.cos(a), by, top - r + r * Math.sin(a)]); }
      for (let i = 1; i <= 16; i++) { const t = rad((90 * i) / 16); arc.push([bx + r + (sx - bx - r) * Math.sin(t), by, crown + (top - crown) * Math.cos(t)]); }
      add(path(arc), "nf sil");
      // the dome: rings up a quarter round, hulled; the crease is a dim line just above the rim
      add((P, front) => {
        const pts = [];
        for (let i = 0; i <= 8; i++) { const a = (Math.PI / 2) * (i / 8); pts.push(...ringAt(P, shift(circ(R * Math.cos(a) + 0.4, 40), sx, by), rim + dome * Math.sin(a))); }
        return { sil: poly(hull(pts)), crease: open(ringAt(P, run(shift(circ(R - 0.6, 40), sx, by), front), rim + 1.4)) };
      });
    },
  });

  // ---------------------------------------------------------------- rug
  // Oval Wool Rug, Oat, 6' × 9': a low oval slab, a tonal border, and a medallion.
  items.push({
    id: "rug", productId: "rug", name: "Oval Wool Rug, Oat",
    dims: { w: 108, d: 72, h: 0.5 },
    foot: { x0: 0, y0: 0, x1: 108, y1: 72, shape: "ellipse" },
    draw(add) {
      add((P, front) => prism(P, front, oval(54, 36, 54, 36), oval(54, 36, 53, 35), 0, 0.5));
      add(onTop(oval(54, 36, 47, 29), 0.5), "nf lo");
      add(onTop(oval(54, 36, 20, 12), 0.5), "nf lo");
    },
  });

  // ---------------------------------------------------------------- chair
  // Oak Spindle Chair, 20" W × 21" D × 33" H: splayed tapered legs, a padded seat, two posts and a padded back.
  items.push({
    id: "chair", productId: "chair", name: "Oak Spindle Chair",
    dims: { w: 20, d: 21, h: 33 },
    draw(add) {
      const seat = 17.5;
      add(leg(3.5, 4, -1.6, -1.6, 1.2, 1.8, 0, seat));
      add(leg(16.5, 4, 1.6, -1.6, 1.2, 1.8, 0, seat));
      for (const x of [5, 15]) add(box(x - 0.8, 1.4, x + 0.8, 3, 0.6, 0.3, seat, 23));
      add(box(1.5, 0.6, 18.5, 3.2, 1.2, 0.6, 23, 33));
      add(leg(3.5, 17, -1.6, 1.6, 1.2, 1.8, 0, seat));
      add(leg(16.5, 17, 1.6, 1.6, 1.2, 1.8, 0, seat));
      add(box(0.5, 1.5, 19.5, 20, 2, 1, seat, 20));
    },
  });

  // ---------------------------------------------------------------- coffee table
  // Round Oak Pedestal Table, 36" Ø × 16" H: a round foot, a tapered pedestal, a thick round top.
  items.push({
    id: "coffeetable", productId: "coffeetable", name: "Round Oak Pedestal Table",
    dims: { w: 36, d: 36, h: 16 },
    foot: { x0: 9, y0: 9, x1: 27, y1: 27, shape: "ellipse" },
    draw(add) {
      add(drum(18, 18, 9, 8.6, 0, 1.4, 0.6));
      add(drum(18, 18, 5.2, 3.4, 1.4, 13.8, 0.4));
      add(drum(18, 18, 18, 18, 13.8, 16, 1.4));
    },
  });

  window.ENVEE_ITEMS = items;
})();
