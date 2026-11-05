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
  /** One leaf of a plant: a lens from (bx, by, bz) out along azimuth a, rising at 55° (the welcome's plant). */
  function leaf(P, bx, by, bz, a, len) {
    const ca = Math.cos(rad(a)), sa = Math.sin(rad(a)), ce = Math.cos(rad(55)), se = Math.sin(rad(55));
    const at = (t, w) => P(bx + ca * ce * len * t - sa * w, by + sa * ce * len * t + ca * w, bz + se * len * t);
    const side = (s) => Array.from({ length: 9 }, (_, k) => at(k / 8, s * 3.4 * Math.sin((Math.PI * k) / 8)));
    return { sil: poly([...side(1), ...side(-1).reverse()]), crease: seg(at(0.1, 0), at(0.85, 0)) };
  }
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

  // The four rooms. `bright` gives the room's feature the one bright stroke; a furnished room passes false
  // and gives it to its main piece instead (rule 04: one bright mark says where to look).
  const ROOMS = {
    // Living room: one wide window, and floorboards running out from the wall.
    living(add, bright) {
      add(box(0, -6, 120, 104, 6, 1.6, -3, 0));
      const boards = [];
      for (let x = 12; x < 120; x += 12) boards.push([[x, 0.8, 0], [x, 102, 0]]);
      add(lines(boards), "nf lo");
      add(box(0, -6, 120, -1, 2, 1.2, 0, 84));
      baseboard(add);
      sash(add, 30, 32, 90, 64, "vh", bright);
    },
    // Bedroom: a tall arched window over where the bed goes.
    bedroom(add, bright) {
      shell(add);
      baseboard(add);
      add(onWall(arch(44, 76, 30, 58), -1), bright ? "hi" : undefined);
      add(onWall(arch(46.6, 73.4, 32.6, 58), -1), "nf lo");
      add(lines([[[60, -1, 32.6], [60, -1, 71]], [[46.6, -1, 50], [73.4, -1, 50]]]), "nf lo");
      add(box(42, -1, 78, 2.6, 0.8, 0.5, 28, 30));
    },
    // Studio: a tall window to one side, a radiator under it, a picture rail.
    studio(add, bright) {
      shell(add);
      add(lines([[[1, -1, 74], [119, -1, 74]]]), "nf lo");
      baseboard(add);
      sash(add, 14, 28, 44, 68, "vh", bright);
      add(box(16, -1, 42, 3.4, 1.2, 0.6, 4, 20));
      const fins = [];
      for (let x = 19; x < 41; x += 3) fins.push([[x, 3.4, 6], [x, 3.4, 18]]);
      add(lines(fins), "nf lo");
    },
    // Rental listing: an empty apartment. A door on the left, a window to the right; the middle of the wall is free for art.
    listing(add, bright) {
      add(box(0, -6, 120, 104, 6, 1.6, -3, 0));
      const boards = [];
      for (let x = 15; x < 120; x += 15) boards.push([[x, 0.8, 0], [x, 102, 0]]);
      add(lines(boards), "nf lo");
      add(box(0, -6, 120, -1, 2, 1.2, 0, 84));
      baseboard(add);
      add(onWall(rrect(8, 0, 32, 60, 1.6, 4), -1), bright ? "hi" : undefined);
      add(onWall(rrect(11, 3.2, 29, 57, 1, 4), -1), "nf lo");
      add(onWall(rrect(13.5, 33, 26.5, 53, 0.8, 4), -1), "nf lo");
      add(onWall(rrect(13.5, 7, 26.5, 29, 0.8, 4), -1), "nf lo");
      add(onWall(shift(circ(0.9, 12), 26, 30), -1));
      sash(add, 74, 34, 110, 62, "v", false);
    },
  };

  // ---------------------------------------------------------------- furniture, in the rooms' world
  // One unit is about an inch and a quarter: the floor is 12 ft across. Each piece is a few rounded solids,
  // a silhouette and one crease each (rule 09). `cls` "hi" makes the piece the room's bright mark.
  const FUR = {
    /** A sofa (or, narrow, an armchair) with its back against y0: feet, arms, base, back, seat cushions. */
    sofa(add, x0, y0, w, cls, seats = w > 50 ? 2 : 1) {
      const x1 = x0 + w, d = 25, arm = w > 50 ? 9 : 7;
      for (const [x, y] of [[x0 + 2.4, y0 + 4], [x1 - 2.4, y0 + 4], [x0 + 2.4, y0 + d - 2.4], [x1 - 2.4, y0 + d - 2.4]]) add(box(x - 1.3, y - 1.3, x + 1.3, y + 1.3, 1, 0.4, 0, 4));
      add(box(x0, y0 + 2, x0 + arm, y0 + d, 3, 1.4, 4, 22));
      add(box(x0 + arm, y0 + 2, x1 - arm, y0 + d, 2, 1, 4, 13));
      add(box(x0 + arm, y0, x1 - arm, y0 + 8, 4, 1.6, 13, w > 50 ? 31 : 34), cls);
      const cw = (w - 2 * arm) / seats;
      for (let i = 0; i < seats; i++) add(box(x0 + arm + i * cw + 0.5, y0 + 8, x0 + arm + (i + 1) * cw - 0.5, y0 + d, 3, 1.4, 13, 18));
      add(box(x1 - arm, y0 + 2, x1, y0 + d, 3, 1.4, 4, 22));
    },
    /** A tufted ottoman on four feet. */
    ottoman(add, cx, cy, w, d, cls) {
      for (const [x, y] of [[cx - w / 2 + 3, cy - d / 2 + 3], [cx + w / 2 - 3, cy - d / 2 + 3], [cx - w / 2 + 3, cy + d / 2 - 3], [cx + w / 2 - 3, cy + d / 2 - 3]]) add(box(x - 1.2, y - 1.2, x + 1.2, y + 1.2, 1, 0.4, 0, 4));
      add(box(cx - w / 2, cy - d / 2, cx + w / 2, cy + d / 2, Math.min(w, d) * 0.45, 1.6, 4, 15), cls);
    },
    /** A flat rug with a woven border; oval when round is set. */
    rug(add, x0, y0, x1, y1, round) {
      const r = round ? Math.min(x1 - x0, y1 - y0) / 2 : 3;
      add((P, front) => prism(P, front, rrect(x0, y0, x1, y1, r, 14), rrect(x0 + 1, y0 + 1, x1 - 1, y1 - 1, Math.max(r - 1, 0.5), 14), 0, 0.8));
      add(onTop(rrect(x0 + 5, y0 + 5, x1 - 5, y1 - 5, Math.max(r - 5, 1), 14), 0.8), "nf lo");
    },
    /** A round pedestal table: foot, post, top. */
    pedestal(add, cx, cy, r, h = 14, cls) {
      add(drum(cx, cy, r * 0.45, r * 0.4, 0, 1.4));
      add(drum(cx, cy, 1.4, 1.4, 1.4, h - 2.5, 0.4));
      add(drum(cx, cy, r, r, h - 2.5, h, 1.2), cls);
    },
    /** A drum side table. */
    sideTable(add, cx, cy, r, h) { add(drum(cx, cy, r, r * 0.92, 0, h, 1)); },
    /** A floor lamp: base, pole, tapered shade. */
    floorLamp(add, cx, cy, h = 58) {
      add(drum(cx, cy, 4.5, 4, 0, 1.6));
      add(lines([[[cx, cy, 1.6], [cx, cy, h - 11]]]), "nf sil");
      add(drum(cx, cy, 8, 5, h - 12, h));
    },
    /** A table lamp standing at z0: gourd base, stem, shade. */
    tableLamp(add, cx, cy, z0) {
      add(drum(cx, cy, 2.6, 3.4, z0, z0 + 7));
      add(lines([[[cx, cy, z0 + 7], [cx, cy, z0 + 10]]]), "nf sil");
      add(drum(cx, cy, 6, 4, z0 + 10, z0 + 18));
    },
    /** A potted plant: a pot, then leaves from the back round to the front (the welcome's plant, scaled). */
    plant(add, cx, cy, s = 1) {
      add(drum(cx, cy, 4.2 * s, 5.6 * s, 0, 11 * s));
      for (const a of [225, 180, 270, 135, 315, 90, 0, 45]) add((P) => leaf(P, cx, cy, 10 * s, a, (a % 90 ? 13 : 11) * s));
    },
    /** A framed print on the wall: frame, mat, and its picture (a sun over a hill). */
    print(add, u0, v0, u1, v1) {
      add(onWall(rrect(u0, v0, u1, v1, 0.8, 4), -0.6));
      add(onWall(rrect(u0 + 2, v0 + 2, u1 - 2, v1 - 2, 0.5, 4), -0.6), "nf lo");
      const cu = (u0 + u1) / 2, w = u1 - u0, h = v1 - v0, hill = [];
      for (let i = 0; i <= 16; i++) { const a = rad((180 * i) / 16); hill.push({ u: cu - (w / 2 - 4) * Math.cos(a), v: v0 + 4 + (h * 0.32) * Math.sin(a) }); }
      add((P) => ({ sil: open(hill.map((q) => P(q.u, -0.6, q.v))), crease: "" }), "nf lo");
      add(onWall(shift(circ(w * 0.11, 16), cu + w * 0.12, v0 + h * 0.66), -0.6), "nf lo");
    },
    /** A globe pendant hanging from above the frame at height zc. */
    pendant(add, cx, cy, zc, r = 5) {
      add(lines([[[cx, cy, zc + r], [cx, cy, 140]]]), "nf sil");
      const band = [];
      for (let i = -3; i <= 3; i++) { const a = (Math.PI / 2) * (i / 3.2); band.push(...ringAt(HL_P, shift(circ(r * Math.cos(a), 20), cx, cy), zc + r * Math.sin(a))); }
      add(() => ({ sil: poly(hull(band)), crease: open(ringAt(HL_P, run(shift(circ(r * 0.98, 24), cx, cy), HL_F), zc)) }));
    },
    /** A bed with its headboard against y0: channel-tufted headboard, frame, mattress and duvet, two pillows. */
    bed(add, x0, y0, w, len, cls) {
      const x1 = x0 + w;
      add(box(x0 - 2, y0, x1 + 2, y0 + 4, 3, 1.2, 0, 40));
      const ch = [];
      for (let x = x0 + 4; x < x1; x += 6) ch.push([[x, y0 + 4, 16], [x, y0 + 4, 37]]);
      add(lines(ch), "nf lo");
      for (const x of [x0 + 2, x1 - 2]) add(box(x - 1.4, y0 + len - 4, x + 1.4, y0 + len - 1.2, 0.8, 0.4, 0, 4));
      add(box(x0, y0 + 4, x1, y0 + len, 2, 1, 4, 12));
      add(box(x0 + 0.5, y0 + 4, x1 - 0.5, y0 + len, 3, 1.4, 12, 20), cls);
      add(lines([[[x0 + 0.6, y0 + len * 0.62, 20], [x1 - 0.6, y0 + len * 0.62, 20]]]), "nf lo");
      const pw = (w - 10) / 2;
      add(box(x0 + 4, y0 + 6, x0 + 4 + pw, y0 + 16, 3.4, 1.2, 20, 25));
      add(box(x1 - 4 - pw, y0 + 6, x1 - 4, y0 + 16, 3.4, 1.2, 20, 25));
    },
    /** A six-drawer dresser on short legs, its back against y0. */
    dresser(add, x0, y0, w, h, cls) {
      const x1 = x0 + w, d = 14, f = y0 + d;
      for (const x of [x0 + 2, x1 - 2]) add(box(x - 1, f - 2.6, x + 1, f - 0.6, 0.6, 0.3, 0, 4));
      add(box(x0, y0, x1, f, 1.4, 0.8, 4, h), cls);
      const rows = 3, rh = (h - 7) / rows, mu = (x0 + x1) / 2, dr = [];
      for (let r = 0; r < rows; r++) for (const [a, b] of [[x0 + 1.6, mu - 0.6], [mu + 0.6, x1 - 1.6]]) dr.push(rrect(a, 5.6 + r * rh, b, 5.6 + (r + 1) * rh - 1.2, 0.6, 4));
      dr.forEach((ring) => add(onWall(ring, f), "nf lo"));
    },
    /** An open bookshelf against y0: a case, its shelves, and books standing on them. */
    bookshelf(add, x0, y0, w, h) {
      const x1 = x0 + w, f = y0 + 12, sh = [], books = [];
      add(box(x0, y0, x1, f, 1.2, 0.7, 0, h));
      const n = 4, step = (h - 4) / n;
      for (let i = 1; i < n; i++) sh.push([[x0 + 1.6, f, 2 + i * step], [x1 - 1.6, f, 2 + i * step]]);
      add(lines(sh), "nf sil");
      for (let i = 0; i < n; i++) {
        const z = 2 + i * step, k = [3, 5, 2, 4][i];
        for (let j = 0; j < k; j++) { const x = x0 + 3 + j * 2.4 + (i % 2) * 6; books.push([[x, f, z], [x, f, z + step * (0.6 + 0.1 * ((j + i) % 3))]]); }
      }
      add(lines(books), "nf lo");
    },
    /** An arched floor mirror leaning on the wall. */
    mirror(add, u0, u1, top) {
      add(onWall(arch(u0, u1, 0, top - (u1 - u0) / 2), 1.6));
      add(onWall(arch(u0 + 1.6, u1 - 1.6, 1.6, top - (u1 - u0) / 2), 1.6), "nf lo");
    },
    /** A swivel chair: round foot, post, a deep seat, and its back toward the wall. */
    swivel(add, cx, cy, cls) {
      add(drum(cx, cy, 6, 5, 0, 1.6));
      add(drum(cx, cy, 1.6, 1.6, 1.6, 8, 0.4));
      add(box(cx - 13, cy - 11, cx + 13, cy - 4, 4, 1.6, 8, 30), cls);
      add(box(cx - 13, cy - 7, cx + 13, cy + 11, 6, 1.6, 8, 16));
      add(box(cx - 10, cy - 4, cx + 10, cy + 10, 4, 1.4, 16, 19));
    },
  };
  // The pendant's globe needs the projection directly; draw() sets these before building a scene.
  let HL_P = null, HL_F = null;

  const scenes = [];
  // The empty rooms: what a new space starts on.
  for (const [k, build] of Object.entries(ROOMS)) scenes.push({ ...ROOM, name: "room-" + k, fit: roomFit, draw({ add }) { build(add, true); } });
  /** A furnished room: the room, then its furniture, back to front (rule 06). */
  const furnished = (name, room, place) => scenes.push({ ...ROOM, name, fit: roomFit, draw({ add, P, front }) {
    HL_P = P; HL_F = front;
    ROOMS[room](add, false);
    place(add, FUR);
  } });

  // The sample spaces, lightly furnished.
  furnished("space-bedroom", "bedroom", (add, F) => {
    F.sideTable(add, 19, 9, 6, 20);
    F.tableLamp(add, 19, 9, 20);
    F.bed(add, 34, 0, 52, 66, "hi");
    F.plant(add, 104, 16, 1.2);
  });
  furnished("space-listing", "listing", (add, F) => {
    F.print(add, 45, 40, 61, 58);
    F.rug(add, 26, 22, 108, 82, true);
    F.floorLamp(add, 112, 9);
    F.sofa(add, 36, 2, 66, "hi");
  });
  furnished("space-living", "living", (add, F) => {
    F.sofa(add, 14, 10, 40, "hi");
    F.plant(add, 104, 14, 1.2);
    F.ottoman(add, 70, 50, 22, 18);
  });

  // The looks, fuller: each draws the pieces its shopping list holds.
  furnished("look-emerald", "living", (add, F) => {
    F.print(add, 8, 40, 24, 58);
    F.rug(add, 14, 24, 106, 92, true);
    F.plant(add, 9, 16, 1.3);
    F.floorLamp(add, 110, 9);
    F.sofa(add, 22, 3, 76, "hi");
    F.pedestal(add, 60, 62, 12);
  });
  furnished("look-warm", "bedroom", (add, F) => {
    F.sideTable(add, 19, 9, 6, 20);
    F.tableLamp(add, 19, 9, 20);
    F.bed(add, 34, 0, 52, 66, "hi");
    F.plant(add, 104, 16, 1.2);
    F.pendant(add, 60, 52, 66);
  });
  furnished("look-gallery", "studio", (add, F) => {
    F.mirror(add, 62, 78, 60);
    F.bookshelf(add, 92, 0, 24, 62);
    F.rug(add, 18, 36, 100, 96, false);
    F.sofa(add, 26, 26, 40, "hi");
    F.sideTable(add, 76, 46, 5.5, 18);
    F.pendant(add, 48, 54, 66);
  });
  furnished("look-first", "listing", (add, F) => {
    F.print(add, 54, 44, 70, 60);
    F.dresser(add, 42, 0, 40, 32, "hi");
    F.tableLamp(add, 77, 7, 32);
    F.plant(add, 18, 72, 1.2);
    F.swivel(add, 94, 62);
  });
  furnished("look-savannah", "listing", (add, F) => {
    F.print(add, 45, 40, 61, 58);
    F.rug(add, 30, 24, 110, 90, true);
    F.floorLamp(add, 113, 9);
    F.sofa(add, 38, 2, 66, "hi");
    F.sofa(add, 4, 46, 36);
    F.ottoman(add, 70, 60, 24, 18);
    F.plant(add, 110, 80, 1.2);
  });

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
