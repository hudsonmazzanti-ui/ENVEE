/**
 * The drawing kit for ENVEE's furniture assets: primitives on the Hairline kernel, and one builder per kind of
 * piece. A catalog item is a builder plus the numbers read off its product photo. See docs/hairline-assets.md.
 *
 * World: one unit is one inch. x across the width (0..w), y from the back (0) to the front (d), z up.
 * Every builder appends its parts back to front (rule 06): farther first, then upward.
 */
(() => {
  const { circ, fillet, hull, open, poly, prism, ringAt, rings, rrect, run, seg } = HL;

  // ---------------------------------------------------------------- primitives
  const shift = (ring, cx, cy) => ring.map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
  /** A rounded box from z0 to z1. */
  const box = (x0, y0, x1, y1, r, b, z0, z1) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, Math.min(b, (x1 - x0) / 2.2, (y1 - y0) / 2.2));
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
  /** A stadium (a rectangle with round ends along x). */
  const stadium = (x0, y0, x1, y1) => rrect(x0, y0, x1, y1, (y1 - y0) / 2, 12);
  /** A solid standing on any ring (with normals), from z0 to z1, its crease inset by b. */
  const slab = (ring, inner, z0, z1) => (P, front) => prism(P, front, ring, inner, z0, z1);
  /** Flat outlines: on the ground or a top (u = x, v = y at z), a front plane (u = x, v = z at y), a side plane (u = y, v = z at x). */
  const onTop = (ring, z) => (P) => ({ sil: poly(ringAt(P, ring, z)), crease: '' });
  const onFront = (ring, y) => (P) => ({ sil: poly(ring.map((q) => P(q.u, y, q.v))), crease: '' });
  const onSide = (ring, x) => (P) => ({ sil: poly(ring.map((q) => P(x, q.u, q.v))), crease: '' });
  /** A tapered leg: a rounded square w1 wide at (x, y, z1), w0 wide at its foot, pushed out by (dx, dy). */
  const leg = (x, y, dx, dy, w0, w1, z0, z1) => {
    const top = rrect(x - w1 / 2, y - w1 / 2, x + w1 / 2, y + w1 / 2, w1 / 2.4);
    const foot = rrect(x + dx - w0 / 2, y + dy - w0 / 2, x + dx + w0 / 2, y + dy + w0 / 2, w0 / 2.4);
    return (P) => ({ sil: poly(hull(ringAt(P, foot, z0).concat(ringAt(P, top, z1)))), crease: '' });
  };
  /** One open stroke through world points; loose segments between pairs of world points. */
  const path = (pts) => (P) => ({ sil: open(pts.map((p) => P(...p))), crease: '' });
  const lines = (pairs) => (P) => ({ sil: pairs.map(([a, b]) => seg(P(...a), P(...b))).join(''), crease: '' });
  const norm = (v) => { const l = Math.hypot(...v); return v.map((c) => c / l); };
  /** A cushion in any plane: a rounded w × h rectangle spanned from corner o along U and V, t thick. */
  const plate = (o, U, V, w, h, r, t) => {
    U = norm(U); V = norm(V);
    const N = norm([U[1] * V[2] - U[2] * V[1], U[2] * V[0] - U[0] * V[2], U[0] * V[1] - U[1] * V[0]]);
    const ring = rrect(0, 0, w, h, r, 6);
    const at = (q, s) => [0, 1, 2].map((i) => o[i] + q.u * U[i] + q.v * V[i] + s * N[i]);
    return (P) => ({ sil: poly(hull(ring.flatMap((q) => [P(...at(q, -t / 2)), P(...at(q, t / 2))]))), crease: '' });
  };
  /** A round roll lying along x, centred at (y, z). */
  const roll = (x0, x1, y, z, R) => (P) => {
    const pts = [];
    for (const x of [x0, x1]) for (let k = 0; k < 28; k++) { const a = (2 * Math.PI * k) / 28; pts.push(P(x, y + R * Math.cos(a), z + R * Math.sin(a))); }
    return { sil: poly(hull(pts)), crease: '' };
  };
  /** A flat cut-out standing in the x–z plane, t thick from y: a polygon in (x, z) with rounded corners. */
  const cutout = (pts, radius, y, t) => {
    const ring = fillet(pts, pts.map(() => radius)).map(([u, v]) => ({ u, v }));
    return [onFront(ring, y), onFront(ring.map((q) => ({ u: q.u, v: q.v })), y + t)];
  };

  // ---------------------------------------------------------------- builders
  const B = {};

  /**
   * A sofa or sectional, back along y = 0. Cloud and boneless sofas sit on the floor (legs 0).
   * chaise: { side: 'left' | 'right', w } runs that end's seat out to the full depth d; the main seat is `depth` deep.
   * arms: which ends have an arm ('both', 'left', 'right', 'none').
   */
  B.sofa = (add, o) => {
    const { w, d, depth = d, h = 30, seatZ = 17, armW = 8, armH = 24, backD = 9, seats = 3, legs = 0, r = 4, chaise = null, arms = 'both', backCushions = seats } = o;
    const z0 = legs, la = arms === 'both' || arms === 'left', ra = arms === 'both' || arms === 'right';
    if (legs) for (const [x, y] of [[4, 4], [w - 4, 4], [4, depth - 3], [w - 4, depth - 3]]) add(leg(x, y, 0, 0, 1.2, 2, 0, legs));
    const xi0 = la ? armW : 0, xi1 = ra ? w - armW : w;
    const cx0 = chaise ? (chaise.side === 'left' ? xi0 : xi1 - chaise.w) : xi1, cx1 = chaise ? (chaise.side === 'left' ? xi0 + chaise.w : xi1) : xi1;
    const armD = (side) => (chaise && chaise.side === side ? d : depth);
    if (la) add(box(0, 2, armW, armD('left'), r + 1, 1.6, z0, armH));
    add(box(xi0 - (la ? 1 : 0), 0, xi1 + (ra ? 1 : 0), backD, r, 1.6, z0, h));
    const bw = (xi1 - xi0) / backCushions;
    for (let i = 0; i < backCushions; i++) add(box(xi0 + i * bw + 0.5, backD - 2, xi0 + (i + 1) * bw - 0.5, backD + 6, r, 1.4, seatZ - 1, h - 2));
    const main = () => {
      const m0 = chaise && chaise.side === 'left' ? cx1 : xi0, m1 = chaise && chaise.side === 'right' ? cx0 : xi1;
      add(box(m0, backD, m1, depth, 2, 1, z0, seatZ - 5));
      const sw = (m1 - m0) / seats;
      for (let i = 0; i < seats; i++) add(box(m0 + i * sw + 0.5, backD + 5, m0 + (i + 1) * sw - 0.5, depth - 0.3, r, 1.4, seatZ - 5, seatZ));
    };
    const ch = () => {
      add(box(cx0, backD, cx1, d, 2, 1, z0, seatZ - 5));
      add(box(cx0 + 0.5, backD + 5, cx1 - 0.5, d - 0.3, r, 1.4, seatZ - 5, seatZ));
    };
    if (chaise && chaise.side === 'left') { ch(); main(); } else { main(); if (chaise) ch(); }
    if (ra) add(box(w - armW, 2, w, armD('right'), r + 1, 1.6, z0, armH));
  };

  /** A floor chair or fold-out sofa bed: stacked cushion layers, an upright back cushion, and an optional roll on top. */
  B.floorChair = (add, o) => {
    const { w, d, h, layers = 2, layerH = 8, backT = 8, r = 5, bolster = false } = o;
    const top = layers * layerH;
    add(box(0, 0, w, backT, r, 1.6, top, bolster ? h - 7 : h));
    if (bolster) add(roll(1, w - 1, backT / 2, h - 4, 4));
    for (let i = 0; i < layers; i++) add(box(0, i === layers - 1 ? 0 : 0, w, d, r, 1.6, i * layerH, (i + 1) * layerH));
  };

  /** A recliner or lift chair: a base, padded arms, a back with stacked pillows, a seat over a footrest panel. */
  B.recliner = (add, o) => {
    const { w, d, h, armW = 7, armH = 26, seatZ = 20, base = 'block', tiers = 3, r = 5 } = o;
    let z0 = 0;
    if (base === 'swivel') { add(drum(w / 2, d / 2, 11, 11, 0, 2.5, 0.8)); z0 = 2.5; }
    if (base === 'rocker') { add(box(4, 5, w - 4, d - 5, 2, 1, 0, 2.5)); z0 = 2.5; }
    add(box(0, 3, armW, d - 1, r + 1, 1.6, z0, armH));
    add(box(armW - 1, 0, w - armW + 1, 9, r, 1.6, z0, h));
    const th = (h - 1.5 - seatZ) / tiers;
    for (let i = 0; i < tiers; i++) add(box(armW + 0.5, 6, w - armW - 0.5, 12 - i * 0.6, r - 1, 1.2, seatZ + i * th, seatZ + (i + 1) * th - 0.4));
    add(box(armW, 9, w - armW, d - 0.5, 2, 1, z0, seatZ - 4));
    add(box(armW + 0.3, 11, w - armW - 0.3, d, r - 1, 1.4, seatZ - 4, seatZ));
    add(box(w - armW, 3, w, d - 1, r + 1, 1.6, z0, armH));
  };

  /** A padded ottoman on legs ('taper', 'x' cross legs, 'block' to the floor), its back at y0. */
  B.ottoman = (add, x0, y0, w, d, h, legs = 'taper', r = 3) => {
    const x1 = x0 + w, y1 = y0 + d, lz = legs === 'block' ? 0 : h - 6;
    if (legs === 'taper') for (const [x, y] of [[x0 + 2, y0 + 2], [x1 - 2, y0 + 2], [x0 + 2, y1 - 2], [x1 - 2, y1 - 2]]) add(leg(x, y, 0, 0, 1, 1.6, 0, lz));
    if (legs === 'x') add(lines([[[x0 + 2, y0 + 1, 0], [x0 + 2, y1 - 1, lz]], [[x0 + 2, y1 - 1, 0], [x0 + 2, y0 + 1, lz]], [[x1 - 2, y0 + 1, 0], [x1 - 2, y1 - 1, lz]], [[x1 - 2, y1 - 1, 0], [x1 - 2, y0 + 1, lz]]]), 'nf sil');
    add(box(x0, y0, x1, y1, r, 1.4, lz, h));
  };

  /** A wooden glider on runners: a frame of posts and arm rails, a seat and a tall back cushion, arm pads. */
  B.glider = (add, o) => {
    const { w, d, h, armH = 24, seatZ = 17 } = o;
    for (const x of [3, w - 5]) add(box(x, 2, x + 2, d - 2, 0.8, 0.4, 0, 2.5));
    const posts = [[4, 4], [w - 4, 4]];
    for (const [x, y] of posts) add(box(x - 0.9, y - 0.9, x + 0.9, y + 0.9, 0.5, 0.3, 2.5, armH));
    add(box(3, 1, w - 3, 7, 4, 1.6, seatZ - 2, h));
    add(box(2, 5, 5.5, d - 1, 1, 0.5, armH, armH + 1.5));
    add(box(2.3, 6, 5.2, d - 4, 1.4, 0.6, armH + 1.5, armH + 4));
    add(box(4, 6, w - 4, d - 1, 3, 1.4, seatZ - 4, seatZ));
    for (const [x, y] of [[4, d - 3], [w - 4, d - 3]]) add(box(x - 0.9, y - 0.9, x + 0.9, y + 0.9, 0.5, 0.3, 2.5, armH));
    add(box(w - 5.5, 5, w - 2, d - 1, 1, 0.5, armH, armH + 1.5));
    add(box(w - 5.2, 6, w - 2.3, d - 4, 1.4, 0.6, armH + 1.5, armH + 4));
  };

  /** A lounge chair: thin legs (or none), a seat and a back cushion leaning back, padded arms. */
  B.lounge = (add, o) => {
    const { w, d, h, seatZ = 16, lean = 0.35, armH = 24, armW = 5, legs = 'metal' } = o;
    if (legs === 'metal') for (const [x, y, dx, dy] of [[4, 6, -1, -2], [w - 4, 6, 1, -2]]) add(leg(x, y, dx, dy, 0.8, 1, 0, seatZ - 4));
    add(box(0, 5, armW, d - 3, 3, 1.2, seatZ - 4, armH));
    add(plate([armW, 8, seatZ - 2], [1, 0, 0], [0, -lean, 1], w - 2 * armW, h - seatZ, 6, 6));
    add(box(armW, 7, w - armW, d - 1, 5, 1.6, seatZ - 4, seatZ));
    if (legs === 'metal') for (const [x, y, dx, dy] of [[4, d - 4, -1, 2], [w - 4, d - 4, 1, 2]]) add(leg(x, y, dx, dy, 0.8, 1, 0, seatZ - 4));
    add(box(w - armW, 5, w, d - 3, 3, 1.2, seatZ - 4, armH));
  };

  /** A sling chair: a tube frame on each side with a wood arm rest, and a cushion slung between them. */
  B.sling = (add, o) => {
    const { w, d, h, armH = 22 } = o;
    const side = (x) => {
      add(path([[x, 3, h], [x, 6, 2], [x, 7, 0], [x, d - 3, 0], [x, d - 2, 1], [x, d - 2, armH - 1]]), 'nf sil');
      add(box(x - 1.2, 3, x + 1.2, d, 1, 0.5, armH - 1, armH + 0.6));
    };
    side(1.5);
    add(plate([3, 6, 12], [1, 0, 0], [0, -0.3, 1], w - 6, h - 12, 6, 5));
    add(plate([3, 6, 12], [1, 0, 0], [0, 1, 0.18], w - 6, d - 9, 6, 5));
    side(w - 1.5);
  };

  /** A low rocking lounger on two wooden runners, with a matching footstool in front. */
  B.rockerLounger = (add, o) => {
    const { w, d, h, chairD } = o;
    const side = (x) => add((P) => ({ sil: poly(fillet([[2, 2], [chairD * 0.15, 0], [chairD * 0.85, 0], [chairD - 1, 3], [chairD * 0.9, 8], [chairD * 0.3, 11]], [1.5, 2, 2, 1.5, 2, 2]).map(([y, z]) => P(x, y, z))), crease: '' }));
    side(2); side(3.4);
    add(plate([1, 4, 11], [1, 0, 0], [0, -0.75, 1], w - 2, h - 10, 6, 5));
    add(plate([1, 5, 11], [1, 0, 0], [0, 1, 0.15], w - 2, chairD - 8, 6, 5));
    side(w - 3.4); side(w - 2);
    B.ottoman(add, 3, chairD + 3, w - 6, d - chairD - 3, 12, 'taper', 4);
  };

  /** An office or vanity chair: a five-star base on casters, a post, a tub of a back with low arms, a deep seat. */
  B.swivelChair = (add, o) => {
    const { w, d, h, seatZ = 19 } = o;
    const cx = w / 2, cy = d / 2, R = Math.min(w, d) / 2 - 1;
    const spokes = [90, 162, 234, 306, 18].map((a) => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)]);
    const ends = spokes.map(([c, s]) => [cx + R * c, cy - R * s]).sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
    add(lines(ends.map(([x, y]) => [[cx, cy, 3.2], [x, y, 2.2]])), 'nf sil');
    for (const [x, y] of ends) add(drum(x, y, 1.1, 1.1, 0, 2.2, 0.3));
    add(drum(cx, cy, 2.2, 1.6, 2.6, 4.2, 0.4));
    add(drum(cx, cy, 1, 1, 4.2, seatZ - 3, 0.3));
    add(box(1, 0, w - 1, 5, 3, 1.2, seatZ - 2, h));
    add(box(0, 1.5, 3.4, d - 4, 1.7, 0.8, seatZ - 2, seatZ + 7));
    add(box(2.5, 3, w - 2.5, d, 5, 1.6, seatZ - 3, seatZ + 1));
    add(box(w - 3.4, 1.5, w, d - 4, 1.7, 0.8, seatZ - 2, seatZ + 7));
  };

  // ---------------------------------------------------------------- lamps (base centred at (cx, cy))
  /** A stick lamp: a round base, a pole, a drum shade. */
  B.stickLamp = (add, o) => {
    const { h, baseR = 5, shadeR = 6.5, shadeH = 10, cx = 7, cy = 7 } = o;
    add(drum(cx, cy, baseR, baseR - 0.4, 0, 1.4, 0.6));
    add(lines([[[cx, cy, 1.4], [cx, cy, h - shadeH]]]), 'nf sil');
    add(drum(cx, cy, shadeR, shadeR, h - shadeH, h, 0.6));
  };
  /** A torchiere: a round base, a pole, an up-turned bowl; optionally a reading arm with a small shade. */
  B.torchiere = (add, o) => {
    const { h, baseR = 5, bowlR = 7, bowlH = 6, reading = false, cx = 7.5, cy = 7.5 } = o;
    add(drum(cx, cy, baseR, baseR - 0.5, 0, 1.6, 0.6));
    add(lines([[[cx, cy, 1.6], [cx, cy, h - bowlH]]]), 'nf sil');
    if (reading) {
      const z = h * 0.68, ex = cx + 7, ez = z + 9;
      add(path([[cx, cy, z], [cx + 2.5, cy, z + 3], [cx + 5, cy, z + 6.5], [ex, cy, ez]]), 'nf sil');
      add(drum(ex + 1, cy, 3.2, 1.2, ez - 4.5, ez + 0.5, 0.4));
    }
    add(drum(cx, cy, 1.4, bowlR, h - bowlH, h, 0.8));
  };
  /** An arched lamp: a round base, a tall pole, a hooked arm reaching +x, a drum shade hanging from it. */
  B.hookLamp = (add, o) => {
    const { h, reach = 14, baseR = 5, shadeR = 6, shadeH = 9, drop = 12, cx = 6, cy = 6 } = o;
    add(drum(cx, cy, baseR, baseR - 0.4, 0, 1.4, 0.6));
    const sx = cx + reach, R = reach / 2, arc = [[cx, cy, 1.4], [cx, cy, h - R]];
    for (let i = 1; i <= 16; i++) { const t = (Math.PI * i) / 16; arc.push([cx + R - R * Math.cos(t), cy, h - R + R * Math.sin(t)]); }
    arc.push([sx, cy, h - drop]);
    add(path(arc), 'nf sil');
    add(drum(sx, cy, shadeR, shadeR, h - drop - shadeH, h - drop, 0.6));
  };

  // ---------------------------------------------------------------- tables
  /** A storage coffee table: a case on tapered legs (or on the floor), a top, and the front's openings drawn in. */
  B.caseTable = (add, o) => {
    const { w, d, h, legH = 5, legs = 'taper', cubby = null, shelf = false, door = null, top = 1.4, splay = 0.8 } = o;
    const z0 = legs === 'none' ? 0 : legH;
    if (legs === 'taper') for (const [x, y, sx, sy] of [[2.5, 2.5, -1, -1], [w - 2.5, 2.5, 1, -1]]) add(leg(x, y, sx * splay, sy * splay, 1.1, 1.9, 0, legH));
    if (legs === 'taper') for (const [x, y, sx, sy] of [[2.5, d - 2.5, -1, 1], [w - 2.5, d - 2.5, 1, 1]]) add(leg(x, y, sx * splay, sy * splay, 1.1, 1.9, 0, legH));
    add(box(0.6, 0.6, w - 0.6, d - 0.6, 1, 0.6, z0, h - top));
    add(box(0, 0, w, d, 1.4, 0.8, h - top, h));
    const fy = d - 0.6, zt = h - top - 1.4, zb = z0 + 1.4;
    if (cubby) {
      const [a, b] = cubby === 'left' ? [1.6, w * 0.32] : [w * 0.68, w - 1.6];
      add(onFront(rrect(a, zb, b, zt, 0.6, 4).map((q) => ({ u: q.u, v: q.v })), fy), 'nf lo');
    }
    if (shelf) add(onFront(rrect(1.6, zb, w - 1.6, z0 + (h - z0) * 0.5, 0.6, 4), fy), 'nf lo');
    if (door === 'barn') {
      const a = 1.6, b = w * 0.55, z1 = zt;
      add(onFront(rrect(a, zb, b, z1, 0.6, 4), fy), 'nf lo');
      add(lines([[[a + 1, fy, zb + 1], [b - 1, fy, z1 - 1]], [[a + 1, fy, z1 - 1], [b - 1, fy, zb + 1]]]), 'nf lo');
      add(onFront(rrect(b + 1, zb, w - 1.6, z1, 0.6, 4), fy), 'nf lo');
    }
  };
  /** A round storage table: a drum on short legs, fluting on its face, a top a little proud of it. */
  B.drumTable = (add, o) => {
    const { w, h, legH = 4 } = o, R = w / 2, c = R;
    for (const a of [225, 315, 135]) add(leg(c + (R - 4) * Math.cos((a * Math.PI) / 180), c + (R - 4) * Math.sin((a * Math.PI) / 180), 0, 0, 1.2, 1.8, 0, legH));
    add(drum(c, c, R - 0.6, R - 0.6, legH, h - 1.2, 0.6));
    const fl = [];
    for (let a = -10; a <= 95; a += 7.5) { const t = (a * Math.PI) / 180; fl.push([[c + (R - 0.6) * Math.cos(t), c + (R - 0.6) * Math.sin(t), legH + 1.2], [c + (R - 0.6) * Math.cos(t), c + (R - 0.6) * Math.sin(t), h - 2.4]]); }
    add(lines(fl), 'nf lo');
    add(leg(c + (R - 4) * Math.cos(Math.PI / 4), c + (R - 4) * Math.sin(Math.PI / 4), 0, 0, 1.2, 1.8, 0, legH));
    add(drum(c, c, R, R, h - 1.2, h, 1));
  };
  /** A two-tier table: a top and a lower shelf, on splayed tapered legs or on two U frames. shape: rect, oval, round. */
  B.twoTier = (add, o) => {
    const { w, d, h, shape = 'rect', legs = 'taper', shelfZ = 5, inset = 3, top = 1.2, splay = 1.4 } = o;
    const ring = (x0, y0, x1, y1, r) => (shape === 'round' ? oval((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2) : shape === 'oval' ? stadium(x0, y0, x1, y1) : rrect(x0, y0, x1, y1, r, 6));
    const inner = (x0, y0, x1, y1, r, b) => ring(x0 + b, y0 + b, x1 - b, y1 - b, Math.max(0.3, r - b));
    let pts;
    if (shape === 'round') { const R = w / 2 - inset - 1; pts = [225, 315, 135, 45].map((a) => [w / 2 + R * Math.cos((a * Math.PI) / 180), d / 2 + R * Math.sin((a * Math.PI) / 180)]); }
    else pts = [[inset, inset], [w - inset, inset], [inset, d - inset], [w - inset, d - inset]];
    const isBack = (y) => y < d / 2;
    const drawLeg = ([x, y]) => {
      if (legs === 'frame') add(box(x - 0.7, y - 0.7, x + 0.7, y + 0.7, 0.4, 0.2, 1.2, h - top));
      else { const sx = Math.sign(x - w / 2), sy = Math.sign(y - d / 2); add(leg(x, y, sx * splay, sy * splay, 1.1, 1.9, 0, h - top)); }
    };
    if (legs === 'frame') for (const x of [inset, w - inset]) add(box(x - 0.7, inset - 0.7, x + 0.7, d - inset + 0.7, 0.4, 0.2, 0, 1.2));
    pts.filter(([, y]) => isBack(y)).forEach(drawLeg);
    const s = inset - 1.5;
    add(slab(ring(s, s, w - s, d - s, 2), inner(s, s, w - s, d - s, 2, 0.8), shelfZ, shelfZ + 1));
    pts.filter(([, y]) => !isBack(y)).forEach(drawLeg);
    add(slab(ring(0, 0, w, d, 2), inner(0, 0, w, d, 2, 1), h - top, h));
  };
  /** A slab table: a top with soft corners on two panel legs, a shelf between them. */
  B.panelTable = (add, o) => {
    const { w, d, h, panel = 4, shelfZ = 4.5 } = o;
    add(box(panel, 1.5, panel + 1.6, d - 1.5, 0.5, 0.3, 0, h - 0.9));
    add(box(panel + 1.6, 2, w - panel - 1.6, d - 2, 0.5, 0.3, shelfZ, shelfZ + 0.9));
    add(box(w - panel - 1.6, 1.5, w - panel, d - 1.5, 0.5, 0.3, 0, h - 0.9));
    add(box(0, 0, w, d, 4, 1, h - 0.9, h));
  };
  /** A sculpted glass table: two wooden cut-outs crossing under a free-form glass top, which shows them through. */
  B.glassTable = (add, o) => {
    const { w, d, h } = o, t = 1.6, zt = h - 0.6;
    const back = [[6, 0], [w * 0.42, 0], [w * 0.36, zt * 0.55], [w * 0.5, zt], [4, zt], [9, zt * 0.45]];
    for (const f of cutout(back, 3, d * 0.3, t)) add(f);
    const ring = (pts) => fillet(pts, pts.map(() => 5)).map(([y, z]) => ({ u: y, v: z }));
    const side = ring([[2, 0], [d - 3, 0], [d - 6, zt * 0.5], [d - 2, zt], [d * 0.45, zt], [5, zt * 0.4]]);
    add(onSide(side, w * 0.66)); add(onSide(side, w * 0.66 + t));
    const topPts = fillet([[0, 2], [w, d * 0.35], [w * 0.55, d], [2, d - 2]], [10, 10, 10, 10]).map(([u, v]) => ({ u, v }));
    add(onTop(topPts, h - 0.6), 'nf lo');
    add(onTop(topPts, h), 'nf sil');
  };

  window.ENVEE_KIT = { B, box, drum, oval, onTop, onFront, onSide, leg, path, lines, plate, roll };
})();
