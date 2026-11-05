/**
 * Layers: a small living room, exploded upwards like a stack of stickers.
 * The room itself (floor, wall, window, floor lamp, plant) stays put; the rug,
 * the table and the couch each float one gap higher than the layer before, the
 * farthest highest, so the layers part without crossing. At rest it is assembled.
 * The pointer's x scrubs the gap on a spring, from assembled to fully apart;
 * its y picks the layer, which takes the bright edge. The slider is the
 * widest gap, in world units.
 *
 * Hit test: the layer is the one whose representative point, at the spring's
 * TARGET gap, sits nearest the pointer's screen y, so a layer rising out from
 * under the pointer cannot flip the choice.
 */
const {
  Cam, circ, clamp, facing, fit, hull, open, poly, prism, proj, rad, ringAt, rings, rrect, run, seg,
  spring, stepS, disposer, mk, pointer, put, register, solid,
} = HL;

const NAMES = ["room", "rug", "table", "couch"];
const REST_G = 0;
const shift = (ring, cx, cy) => ring.map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));

/** A rounded box from z0 to z1. */
const box = (x0, y0, x1, y1, r, b, z0, z1) => {
  const [ring, inner] = rings(x0, y0, x1, y1, r, b);
  return (P, front, dz) => prism(P, front, ring, inner, z0 + dz, z1 + dz);
};
/** A round solid centred on (cx, cy): radius r0 at its foot, r1 at its top. */
const drum = (cx, cy, r0, r1, z0, z1, b = 0.8) => {
  const foot = shift(circ(r0, 32), cx, cy), top = shift(circ(r1, 32), cx, cy), inner = shift(circ(r1 - b, 32), cx, cy);
  return (P, front, dz) => ({
    sil: poly(hull(ringAt(P, foot, z0 + dz).concat(ringAt(P, top, z1 + dz)))),
    crease: open(ringAt(P, run(inner, front), z1 + dz)),
  });
};
/** A flat outline in the wall's plane (y = wy), from a ring in (x, z). */
const onWall = (ring, wy) => (P) => ({ sil: poly(ring.map((q) => P(q.u, wy, q.v))), crease: "" });

/** One leaf of the plant: a lens from (bx, by, bz) out along azimuth a, rising at 55°. */
function leaf(P, bx, by, bz, a, len) {
  const ca = Math.cos(rad(a)), sa = Math.sin(rad(a)), ce = Math.cos(rad(55)), se = Math.sin(rad(55));
  const at = (t, w) => P(bx + ca * ce * len * t - sa * w, by + sa * ce * len * t + ca * w, bz + se * len * t);
  const side = (s) => Array.from({ length: 9 }, (_, k) => at(k / 8, s * 3.4 * Math.sin((Math.PI * k) / 8)));
  return { sil: poly([...side(1), ...side(-1).reverse()]), crease: seg(at(0.1, 0), at(0.85, 0)) };
}

/** The scene, back to front. Each part: [layer, builder(P, front, dz)]. */
function parts() {
  const L = [];
  // layer 0, the room: floor slab, wall, window
  L.push([0, box(-4, -6, 124, 80, 6, 1.6, -3, 0)]);
  L.push([0, box(-4, -6, 124, -1, 2, 1.2, 0, 70)]);
  L.push([0, onWall(rrect(36, 36, 80, 62, 3, 4), -1)]);
  L.push([0, onWall(rrect(39, 39, 77, 59, 1.5, 4), -1), "nf lo"]);
  L.push([0, (P) => ({ sil: seg(P(58, -1, 39), P(58, -1, 59)) + seg(P(39, -1, 49), P(77, -1, 49)), crease: "" }), "nf lo"]);
  L.push([0, box(34, -1, 82, 3, 1, 0.6, 34.5, 36.5)]);
  // layer 1, the rug, with its woven border
  L.push([1, box(14, 18, 102, 72, 3, 1.2, 0, 1)]);
  L.push([1, (P, f, dz) => ({ sil: poly(ringAt(P, rrect(20, 24, 96, 66, 2, 4), 1 + dz)), crease: "" }), "nf lo"]);
  // layer 3, the couch: feet, left arm, base, back, two cushions, right arm
  for (const [x, y] of [[22, 9], [94, 9], [22, 29], [94, 29]]) L.push([3, box(x - 1.4, y - 1.4, x + 1.4, y + 1.4, 1, 0.4, 0, 4)]);
  L.push([3, box(20, 8, 29, 31, 3, 1.4, 4, 24)]);
  L.push([3, box(29, 8, 87, 31, 2, 1, 4, 14)]);
  L.push([3, box(29, 6, 87, 14, 4, 1.6, 14, 33)]);
  L.push([3, box(29.5, 14, 58, 31, 3, 1.4, 14, 19)]);
  L.push([3, box(58, 14, 86.5, 31, 3, 1.4, 14, 19)]);
  L.push([3, box(87, 8, 96, 31, 3, 1.4, 4, 24)]);
  // layer 0, the plant: pot, then leaves from the back round to the front
  L.push([0, drum(6, 58, 4.2, 5.6, 0, 11)]);
  for (const a of [225, 180, 270, 135, 315, 90, 0, 45]) L.push([0, (P) => leaf(P, 6, 58, 10, a, a % 90 ? 13 : 11)]);
  // layer 2, the table: foot, post, round top
  L.push([2, drum(58, 55, 6, 5, 0, 1.6)]);
  L.push([2, drum(58, 55, 1.6, 1.6, 1.6, 11, 0.4)]);
  L.push([2, drum(58, 55, 12, 12, 11, 14, 1.4)]);
  // layer 0, the floor lamp: base, pole, tapered shade
  L.push([0, drum(108, 16, 4.5, 4, 0, 1.6)]);
  L.push([0, (P) => ({ sil: seg(P(108, 16, 1.6), P(108, 16, 46)), crease: "" }), "nf sil"]);
  L.push([0, drum(108, 16, 8, 5, 44, 56)]);
  return L;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gmax = value;

  // fitted to the widest explode the slider allows, so no pose leaves the frame
  const C = Cam(45, 0.5, 1.5);
  fit(C, [[-4, -6, -3], [124, 80, -3], [-4, 80, -3], [124, -6, 70], [-4, -6, 70], [58, 55, 2 * 22 + 14], [58, 6, 3 * 22 + 33], [96, 31, 3 * 22]], 200, 160);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const items = parts().map(([layer, build, cls]) => {
    const s = solid(g);
    if (cls) s.sil.setAttribute("class", cls);
    return { layer, build, s, cls };
  });

  const gap = spring(REST_G);
  let drawn = null;
  function draw() {
    if (drawn === gap.x) return;
    drawn = gap.x;
    for (const it of items) put(it.s, it.build(P, front, it.layer * gap.x));
  }

  // representative points: floor front, rug middle, table top, couch back top
  const rep = (i, gp) => [P(60, 74, 0), P(58, 45, gp), P(58, 55, 2 * gp + 14), P(58, 10, 3 * gp + 26)][i][1];

  let act = -1;
  function light(a) {
    const on = a < 0 ? 3 : a;
    for (const it of items) if (!it.cls) it.s.sil.classList.toggle("hi", it.layer === on);
    read.textContent = a < 0 ? "rest" : a + " · " + NAMES[a];
  }
  light(-1);

  const B = register(stage, (dt) => {
    const moving = stepS(gap, dt);
    draw();
    return moving;
  });
  bag.add(B.unregister);
  draw();

  function move([x, y]) {
    gap.t = clamp((x - 70) / 260, 0, 1) * gmax;
    let best = 0, bd = Infinity;
    for (let i = 0; i < 4; i++) { const d = Math.abs(rep(i, gap.t) - y); if (d < bd) { bd = d; best = i; } }
    if (best !== act) { act = best; light(act); }
    B.wake();
  }
  function leave() {
    gap.t = REST_G;
    act = -1;
    light(-1);
    B.wake();
  }

  bag.add(pointer(stage, { move, leave }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { gmax = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "layers",
  means: "A living room pulled apart in layers: slide across to lift the rug, table and couch; up and down picks one.",
  rules: [1, 3, 5, 6, 8],
  range: [10, 16, 22],
  tour: [[150, 230], [250, 120], [330, 80], null],
  mount,
});
