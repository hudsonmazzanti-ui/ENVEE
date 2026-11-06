/**
 * The cached Amazon Best Sellers that have a sticker (assets/stickers), drawn as Hairline assets.
 * Shapes and proportions are read off each product's main photo; dims are in inches.
 * dimsFrom: 'name' when the product title states the size, otherwise 'estimate' (typical for the kind) until
 * real dimensions are fetched. The build fills in the name and the source photo from the cache.
 */
(() => {
  const { B } = window.ENVEE_KIT;
  const base = (cx, cy, r) => ({ x0: cx - r, y0: cy - r, x1: cx + r, y1: cy + r, shape: 'ellipse' });
  const L = [];
  const item = (id, dims, dimsFrom, draw, foot) => L.push({ id, productId: id, dims, dimsFrom, draw, foot });

  // ---------------------------------------------------------------- sofas
  item('B0DDTCQGTR', { w: 30, d: 32, h: 28 }, 'estimate', (add) => B.floorChair(add, { w: 30, d: 32, h: 28, layers: 2, layerH: 8, backT: 9, bolster: true }));
  item('B0FFZ78881', { w: 100, d: 62, h: 28 }, 'estimate', (add) => B.sofa(add, { w: 100, d: 62, depth: 36, h: 28, seatZ: 17, armW: 9, armH: 23, seats: 2, backCushions: 3, chaise: { side: 'left', w: 30 } }));
  item('B0GM7QHVMP', { w: 30, d: 30, h: 32 }, 'estimate', (add) => B.floorChair(add, { w: 30, d: 30, h: 32, layers: 3, layerH: 6.5, backT: 8 }));
  item('B0GMWKDNBC', { w: 112, d: 66, h: 30 }, 'estimate', (add) => B.sofa(add, { w: 112, d: 66, depth: 38, h: 30, armW: 10, armH: 24, seats: 2, backCushions: 3, chaise: { side: 'right', w: 34 } }));
  item('B0HKDCYMFF', { w: 96, d: 60, h: 28 }, 'name', (add) => B.sofa(add, { w: 96, d: 60, depth: 36, h: 28, armW: 9, armH: 23, seats: 2, backCushions: 3, chaise: { side: 'right', w: 30 } }));
  item('B0GGPQJ3LQ', { w: 110, d: 66, h: 29 }, 'name', (add) => B.sofa(add, { w: 110, d: 66, depth: 37, h: 29, armW: 9, armH: 24, seats: 2, backCushions: 3, arms: 'left', chaise: { side: 'right', w: 34 } }));

  // ---------------------------------------------------------------- accent chairs
  item('B0F1CPLNHT', { w: 23, d: 22, h: 34 }, 'estimate', (add) => B.swivelChair(add, { w: 23, d: 22, h: 34, seatZ: 19 }));
  item('B0BG8B89BP', { w: 30, d: 50, h: 36 }, 'estimate', (add) => { B.lounge(add, { w: 30, d: 30, h: 36, seatZ: 16, lean: 0.4, armH: 24, armW: 6 }); B.ottoman(add, 5, 34, 20, 16, 15, 'x'); });
  item('B0B1TCSXVM', { w: 26, d: 49, h: 40 }, 'estimate', (add) => { B.glider(add, { w: 26, d: 30, h: 40 }); B.ottoman(add, 3, 34, 20, 15, 14, 'taper', 2); });
  item('B07MGZTLDB', { w: 33, d: 36, h: 41 }, 'estimate', (add) => B.recliner(add, { w: 33, d: 36, h: 41, tiers: 3 }));
  item('B07882V1YZ', { w: 34, d: 38, h: 41 }, 'estimate', (add) => B.recliner(add, { w: 34, d: 38, h: 41, tiers: 2 }));
  item('B0F7LRGGRY', { w: 26, d: 31, h: 30 }, 'estimate', (add) => B.sling(add, { w: 26, d: 31, h: 30, armH: 22 }));
  item('B0HNK19C4X', { w: 34, d: 36, h: 40 }, 'estimate', (add) => B.recliner(add, { w: 34, d: 36, h: 40, base: 'rocker', tiers: 3 }));
  item('B0FNCSGJVK', { w: 24, d: 52, h: 30 }, 'estimate', (add) => B.rockerLounger(add, { w: 24, d: 52, h: 30, chairD: 32 }));
  item('B0FJL9N76F', { w: 30, d: 33, h: 39 }, 'estimate', (add) => B.recliner(add, { w: 30, d: 33, h: 39, base: 'swivel', armW: 6, tiers: 3 }));

  // ---------------------------------------------------------------- floor lamps (the footprint is the base)
  item('B07Z5NQPDS', { w: 12, d: 12, h: 60 }, 'name', (add) => B.stickLamp(add, { h: 60, baseR: 5, shadeR: 5.5, shadeH: 9, cx: 6, cy: 6 }), base(6, 6, 5));
  item('B07R9FZHLQ', { w: 20, d: 15, h: 72 }, 'name', (add) => B.torchiere(add, { h: 72, baseR: 5.5, bowlR: 6, bowlH: 5, reading: true }), base(7.5, 7.5, 5.5));
  item('B086ZLGLV3', { w: 27, d: 13, h: 64 }, 'estimate', (add) => B.hookLamp(add, { h: 64, reach: 14, baseR: 5.5, shadeR: 6.5, shadeH: 8, drop: 12, cx: 6.5, cy: 6.5 }), base(6.5, 6.5, 5.5));
  item('B08T1N86Q5', { w: 16, d: 16, h: 69 }, 'estimate', (add) => B.torchiere(add, { h: 69, baseR: 5, bowlR: 8, bowlH: 7, cx: 8, cy: 8 }), base(8, 8, 5));
  item('B07R43W6L1', { w: 20, d: 15, h: 72 }, 'name', (add) => B.torchiere(add, { h: 72, baseR: 5.5, bowlR: 6, bowlH: 5, reading: true }), base(7.5, 7.5, 5.5));

  // ---------------------------------------------------------------- coffee tables (lift tops drawn closed)
  item('B0HHCXJBS4', { w: 39, d: 20, h: 19 }, 'estimate', (add) => B.caseTable(add, { w: 39, d: 20, h: 19, legH: 5, cubby: 'left' }));
  item('B0GTTJGXFP', { w: 39, d: 20, h: 19 }, 'estimate', (add) => B.caseTable(add, { w: 39, d: 20, h: 19, legH: 4.5, shelf: true }));
  item('B0D3CF6B38', { w: 31.5, d: 31.5, h: 18 }, 'name', (add) => B.caseTable(add, { w: 31.5, d: 31.5, h: 18, legs: 'none', door: 'barn' }));
  item('B0F64KYP45', { w: 31.5, d: 31.5, h: 18 }, 'name', (add) => B.drumTable(add, { w: 31.5, h: 18 }), base(15.75, 15.75, 15.75));
  item('B003VOZE6M', { w: 35.5, d: 17.7, h: 15.6 }, 'estimate', (add) => B.panelTable(add, { w: 35.5, d: 17.7, h: 15.6 }));
  item('B0DNDLLSM8', { w: 39, d: 20, h: 19 }, 'estimate', (add) => B.caseTable(add, { w: 39, d: 20, h: 19, legH: 6, cubby: 'left' }));
  item('B0DZX77VQ9', { w: 40, d: 26, h: 16 }, 'estimate', (add) => B.glassTable(add, { w: 40, d: 26, h: 16 }));
  item('B0D31M71SB', { w: 31.5, d: 31.5, h: 17.7 }, 'estimate', (add) => B.twoTier(add, { w: 31.5, d: 31.5, h: 17.7, shape: 'round' }), base(15.75, 15.75, 15.75));
  item('B0F3J6PW1C', { w: 39.4, d: 19.7, h: 17.7 }, 'estimate', (add) => B.twoTier(add, { w: 39.4, d: 19.7, h: 17.7, shape: 'oval', legs: 'frame', inset: 5 }));
  item('B0DRHQ2KLG', { w: 39.4, d: 21.7, h: 17.7 }, 'estimate', (add) => B.twoTier(add, { w: 39.4, d: 21.7, h: 17.7 }));

  window.ENVEE_ITEMS = (window.ENVEE_ITEMS || []).concat(L);
})();
