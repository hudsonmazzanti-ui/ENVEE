/**
 * ENVEE's static line art: the app's chrome drawn on the Hairline kernel, in the welcome room's
 * stroke vocabulary. These are rest poses only; scripts/build-line-art.mjs renders each one to an
 * SVG with its colours baked in, so the app shows them through expo-image with no WebView.
 *
 * Each scene: { name, ground, view: [w, h], cam: [az, k, S], fit: [points, cx, cy], sw, bg, draw(api) }
 *   ground  "linen" (stone lines, one emerald stroke) or "emerald" (the welcome's ivory lines)
 *   sw      stroke width in viewBox units. Strokes scale with the image, so this is set for its display size;
 *           a scene can list `variants: { sm: sw }` for a heavier copy used in small thumbnails
 *   bg      true paints a full-bleed ground rect, so the SVG stands in for a room photo
 *   draw    api = { P, front, add(build, cls) }; append back to front (rule 06)
 *
 * The four rooms use a near-frontal camera so frontal furniture cut-outs stand on their floor.
 * Everything else keeps the welcome's 2:1 view.
 */
(() => {
  const { circ, hull, open, poly, prism, rad, ringAt, rings, rrect, run, seg } = HL;

  const shift = (ring, cx, cy) => ring.map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
  /** A rounded box from z0 to z1. */
  const box = (x0, y0, x1, y1, r, b, z0, z1) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, b);
    return (P, front) => prism(P, front, ring, inner, z0, z1);
  };
  /** A round solid centred on (cx, cy): radius r0 at its foot, r1 at its top. */
  const drum = (cx, cy, r0, r1, z0, z1, b = 0.8) => {
    const foot = shift(circ(r0, 32), cx, cy), top = shift(circ(r1, 32), cx, cy), inner = shift(circ(r1 - b, 32), cx, cy);
    return (P, front) => ({
      sil: poly(hull(ringAt(P, foot, z0).concat(ringAt(P, top, z1)))),
      crease: open(ringAt(P, run(inner, front), z1)),
    });
  };
  /** A flat outline on a wall: a ring in (u = x, v = z), on the plane y = wy. */
  const onWall = (ring, wy) => (P) => ({ sil: poly(ring.map((q) => P(q.u, wy, q.v))), crease: "" });
  /** A flat outline on a side face: a ring in (u = y, v = z), on the plane x = wx. */
  const onSide = (ring, wx) => (P) => ({ sil: poly(ring.map((q) => P(wx, q.u, q.v))), crease: "" });
  /** A flat outline on the ground or a top face: a ring in (u = x, v = y), at height z. */
  const onTop = (ring, z) => (P) => ({ sil: poly(ringAt(P, ring, z)), crease: "" });
  /** Loose lines: pairs of world points. */
  const lines = (pairs) => (P) => ({ sil: pairs.map(([a, b]) => seg(P(...a), P(...b))).join(""), crease: "" });
  /** An arched opening in (u, v): straight jambs from v0 up to vs, then a half round. */
  const arch = (u0, u1, v0, vs) => {
    const cx = (u0 + u1) / 2, r = (u1 - u0) / 2, pts = [];
    pts.push({ u: u0 + 1.2, v: v0 }, { u: u1 - 1.2, v: v0 }, { u: u1, v: v0 + 1.2 });
    for (let i = 0; i <= 24; i++) { const a = rad((180 * i) / 24); pts.push({ u: cx + r * Math.cos(a), v: vs + r * Math.sin(a) }); }
    pts.push({ u: u0, v: v0 + 1.2 });
    return pts;
  };
  /** A ring turned by deg about (cx, cy), normals included, so it still knows which side faces the camera. */
  const turn = (ring, deg, cx, cy) => {
    const c = Math.cos(rad(deg)), s = Math.sin(rad(deg));
    return ring.map((q) => ({ u: cx + (q.u - cx) * c - (q.v - cy) * s, v: cy + (q.u - cx) * s + (q.v - cy) * c, nu: q.nu * c - q.nv * s, nv: q.nu * s + q.nv * c }));
  };
  const turnedPlate = (x0, y0, x1, y1, r, b, z0, z1, deg) => {
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, [ring, inner] = rings(x0, y0, x1, y1, r, b);
    return (P, front) => prism(P, front, turn(ring, deg, cx, cy), turn(inner, deg, cx, cy), z0, z1);
  };

  // ---------------------------------------------------------------- rooms
  // A diorama in the welcome's manner: floor slab, back wall, a baseboard, and one architectural feature.
  // World: x 0..120 across, y -6..104 from the wall out, z up. The wall's face is the plane y = -1.
  const ROOM = { view: [300, 400], cam: [8, 0.6, 2.3], sw: 1.1, variants: { sm: 1.9 }, ground: "linen", bg: true };
  const roomFit = [[[0, -6, -3], [120, 104, -3], [0, 104, -3], [120, -6, 84], [0, -6, 84]], 150, 222];
  function shell(add) {
    add(box(0, -6, 120, 104, 6, 1.6, -3, 0));
    add(box(0, -6, 120, -1, 2, 1.2, 0, 84));
  }
  const baseboard = (add) => add(box(1, -1, 119, 0.8, 0.6, 0.4, 0, 3.2));
  /** A sash window on the wall, frame bright: outer frame, inner frame, glazing bars, sill. */
  function sash(add, u0, v0, u1, v1, bars, bright) {
    add(onWall(rrect(u0, v0, u1, v1, 2.4, 4), -1), bright ? "hi" : undefined);
    add(onWall(rrect(u0 + 2.6, v0 + 2.6, u1 - 2.6, v1 - 2.6, 1.2, 4), -1), "nf lo");
    const mu = (u0 + u1) / 2, mv = (v0 + v1) / 2, l = [];
    if (bars.includes("v")) l.push([[mu, -1, v0 + 2.6], [mu, -1, v1 - 2.6]]);
    if (bars.includes("h")) l.push([[u0 + 2.6, -1, mv], [u1 - 2.6, -1, mv]]);
    add(lines(l), "nf lo");
    add(box(u0 - 2, -1, u1 + 2, 2.6, 0.8, 0.5, v0 - 2, v0));
  }

  const scenes = [];

  // Living room: one wide window, and floorboards running out from the wall.
  scenes.push({ ...ROOM, name: "room-living", fit: roomFit, draw({ add }) {
    add(box(0, -6, 120, 104, 6, 1.6, -3, 0));
    const boards = [];
    for (let x = 12; x < 120; x += 12) boards.push([[x, 0.8, 0], [x, 102, 0]]);
    add(lines(boards), "nf lo");
    add(box(0, -6, 120, -1, 2, 1.2, 0, 84));
    baseboard(add);
    sash(add, 30, 32, 90, 64, "vh", true);
  } });

  // Bedroom: a tall arched window over where the bed goes.
  scenes.push({ ...ROOM, name: "room-bedroom", fit: roomFit, draw({ add }) {
    shell(add);
    baseboard(add);
    add(onWall(arch(44, 76, 30, 58), -1), "hi");
    add(onWall(arch(46.6, 73.4, 32.6, 58), -1), "nf lo");
    add(lines([[[60, -1, 32.6], [60, -1, 71]], [[46.6, -1, 50], [73.4, -1, 50]]]), "nf lo");
    add(box(42, -1, 78, 2.6, 0.8, 0.5, 28, 30));
  } });

  // Studio: a tall window to one side, a radiator under it, a picture rail.
  scenes.push({ ...ROOM, name: "room-studio", fit: roomFit, draw({ add }) {
    shell(add);
    add(lines([[[1, -1, 74], [119, -1, 74]]]), "nf lo");
    baseboard(add);
    sash(add, 14, 28, 44, 68, "vh", true);
    add(box(16, -1, 42, 3.4, 1.2, 0.6, 4, 20));
    const fins = [];
    for (let x = 19; x < 41; x += 3) fins.push([[x, 3.4, 6], [x, 3.4, 18]]);
    add(lines(fins), "nf lo");
  } });

  // Rental listing: an empty apartment. A door on the left, a window to the right; the middle of the wall is free for art.
  scenes.push({ ...ROOM, name: "room-listing", fit: roomFit, draw({ add }) {
    add(box(0, -6, 120, 104, 6, 1.6, -3, 0));
    const boards = [];
    for (let x = 15; x < 120; x += 15) boards.push([[x, 0.8, 0], [x, 102, 0]]);
    add(lines(boards), "nf lo");
    add(box(0, -6, 120, -1, 2, 1.2, 0, 84));
    baseboard(add);
    add(onWall(rrect(8, 0, 32, 60, 1.6, 4), -1), "hi");
    add(onWall(rrect(11, 3.2, 29, 57, 1, 4), -1), "nf lo");
    add(onWall(rrect(13.5, 33, 26.5, 53, 0.8, 4), -1), "nf lo");
    add(onWall(rrect(13.5, 7, 26.5, 29, 0.8, 4), -1), "nf lo");
    add(onWall(shift(circ(0.9, 12), 26, 30), -1));
    sash(add, 74, 34, 110, 62, "v", false);
  } });

  // ---------------------------------------------------------------- empty states (2:1 view)
  const ISO = { view: [400, 320], cam: [45, 0.5, 1.9], sw: 1.5, ground: "linen" };

  // Saved, nothing yet: an open shelf, empty, with a dashed place on the middle shelf. The top shelf takes the bright edge.
  scenes.push({ ...ISO, name: "empty-saved", cam: [45, 0.5, 2.7], fit: [[[0, 0, 0], [64, 22, 0], [0, 22, 50], [64, 0, 50], [0, 0, 50], [64, 22, 50]], 200, 166], draw({ add }) {
    add(box(0, 0, 64, 1.6, 0.6, 0.4, 0, 50));
    add(box(0, 0, 4, 22, 1.2, 0.6, 0, 50));
    add(box(4, 0, 60, 22, 1, 0.6, 2, 4));
    add(box(4, 0, 60, 22, 1, 0.6, 24, 26));
    add(onTop(rrect(18, 6, 44, 18, 3, 4), 26), "nf dash");
    add(box(4, 0, 60, 22, 1, 0.6, 46, 48), "hi");
    add(box(60, 0, 64, 22, 1.2, 0.6, 0, 50));
  } });

  // Shop this room, nothing placed: a bare floor with a dashed footprint and tape at its corners.
  scenes.push({ ...ISO, name: "empty-room", cam: [45, 0.5, 2.35], fit: [[[0, 0, -3], [110, 80, -3], [0, 80, -3], [110, 0, -3]], 200, 166], draw({ add }) {
    add(box(0, 0, 110, 80, 6, 1.6, -3, 0));
    add(onTop(rrect(26, 26, 84, 52, 4, 4), 0), "nf dash");
    const t = 6, c = [[26, 26, 1, 1], [84, 26, -1, 1], [26, 52, 1, -1], [84, 52, -1, -1]];
    c.forEach(([x, y, sx, sy], i) => add(lines([[[x, y, 0], [x + sx * t, y, 0]], [[x, y, 0], [x, y + sy * t, 0]]]), i === 3 ? "nf hi" : "nf sil"));
  } });

  // Bag, empty (emerald): a tote standing open, and a second one folded flat beside it.
  scenes.push({ ...ISO, name: "empty-bag", ground: "emerald", cam: [45, 0.5, 2.9], fit: [[[0, 0, 0], [70, 40, 0], [0, 40, 0], [70, 0, 0], [30, 8, 66], [0, 0, 44]], 200, 170], draw({ add }) {
    const handle = (y) => {
      const pts = [];
      for (let i = 0; i <= 20; i++) { const a = rad((180 * i) / 20); pts.push([22 + 9 * Math.cos(a), y, 44 + 12 * Math.sin(a)]); }
      return (P) => ({ sil: open(pts.map((p) => P(...p))), crease: "" });
    };
    add(handle(1.5), "nf sil");
    add(box(0, 0, 44, 12, 2.2, 1, 0, 44));
    add(handle(10.5), "nf hi");
    add(box(40, 22, 70, 40, 2, 1, 0, 1.6));
    add(lines([[[40.8, 31, 1.6], [69.2, 31, 1.6]]]), "nf lo");
  } });

  // Order confirmed (emerald): boxes stacked to go, the top one taped bright.
  scenes.push({ ...ISO, name: "confirmed", ground: "emerald", cam: [45, 0.5, 2.75], fit: [[[0, 0, 0], [66, 34, 0], [0, 34, 0], [66, 0, 0], [6, 4, 48], [0, 0, 28]], 200, 166], draw({ add }) {
    const tape = (x0, x1, y, z) => lines([[[x0, y, z], [x1, y, z]]]);
    add(box(0, 0, 40, 32, 1.6, 1, 0, 28));
    add(tape(0.6, 39.4, 16, 28), "nf lo");
    add(box(6, 4, 32, 26, 1.4, 0.8, 28, 46));
    add(tape(6.6, 31.4, 15, 46), "nf hi");
    add(box(46, 14, 66, 34, 1.4, 0.8, 0, 16));
    add(tape(46.6, 65.4, 24, 16), "nf lo");
  } });

  // ---------------------------------------------------------------- new space options (portrait)
  const OPT = { view: [240, 320], cam: [45, 0.5, 2], sw: 2.4, ground: "linen" };

  // Camera roll: three prints fanned on a table, the top one bright.
  scenes.push({ ...OPT, name: "option-library", cam: [45, 0.5, 3.5], fit: [[[0, 0, 0], [60, 60, 0], [0, 60, 0], [60, 0, 0]], 120, 160], draw({ add }) {
    [[-14, 0, "sil"], [6, 1.2, "sil"], [24, 2.4, "hi"]].forEach(([deg, z, cls]) => {
      add(turnedPlate(10, 12, 50, 48, 1.4, 0.6, z, z + 1, deg), cls === "hi" ? "hi" : undefined);
      const [ring] = rings(14, 16, 46, 40, 0.8, 0.4);
      add(onTop(turn(ring, deg, 30, 30), z + 1), "nf lo");
    });
  } });

  // Take photo: a camera on a tripod, its lens bright.
  scenes.push({ ...OPT, name: "option-camera", cam: [45, 0.5, 2.9], fit: [[[0, 0, 0], [40, 40, 0], [10, 14, 86], [34, 26, 86]], 120, 160], draw({ add }) {
    const head = [22, 20, 60];
    add(lines([[head, [4, 8, 0]], [head, [40, 14, 0]]]), "nf sil");
    add(box(19, 17, 25, 23, 1, 0.4, 58, 62));
    add(box(8, 12, 36, 28, 3, 1.2, 62, 82));
    add(box(14, 15, 22, 25, 1.4, 0.6, 82, 85));
    const lens = (r, cls) => add(onSide(shift(circ(r, 32), 20, 72), 36), cls);
    lens(7, "hi");
    lens(4.6, "nf lo");
    add(lines([[head, [24, 36, 0]]]), "nf sil");
  } });

  // Rental listing: a walk-up's front, its third-floor window bright.
  scenes.push({ ...OPT, name: "option-listing", cam: [45, 0.5, 2.45], fit: [[[0, 0, 0], [36, 30, 0], [0, 30, 0], [36, 0, 0], [0, 0, 96], [36, 30, 96]], 120, 162], draw({ add }) {
    add(box(0, 0, 36, 30, 1.2, 0.8, 0, 92));
    add(box(-1.5, -1.5, 37.5, 31.5, 1, 0.6, 92, 96));
    const win = [];
    for (const z of [30, 52, 74]) for (const u of [5, 21]) win.push([u, z]);
    win.forEach(([u, z]) => add(onWall(rrect(u, z, u + 10, z + 13, 1, 4), 30), u === 21 && z === 74 ? "hi" : undefined));
    add(onWall(rrect(11, 0, 25, 20, 1, 4), 30));
    add(box(9, 30, 27, 36, 1, 0.5, 0, 2));
    for (const y of [9, 21]) add(onSide(rrect(y - 4, 52, y + 4, 64, 1, 4), 36), "nf lo");
  } });

  window.ENVEE_SCENES = scenes;
})();
