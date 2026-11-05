import type { ImageSource } from 'expo-image';

import bestsellers from '../../data/catalog/amazon-bestsellers.json';
import { art, type ArtKey } from '@/theme/assets';
import type { RoomKey } from '@/theme/rooms';

// Real products: Amazon Best Sellers, read from the local cache in data/catalog/ (filled by
// `npm run catalog:fetch`; the app never calls the Canopy API). Stickers are local cut-outs in
// assets/stickers (made by `npm run stickers`); a product without one shows its Amazon photo instead.
// Illustrated placeholder pieces from invented retailers fill the categories Amazon doesn't cover yet.
export type ImageSrc = ImageSource | number;

export type Product = {
  id: string;
  name: string;
  retailer: string;
  domain: string;
  price: number;
  was?: number;
  /** What's placed in a room: a transparent cut-out (or, until one is made, the product photo). */
  sticker: ImageSrc;
  photo: ImageSrc;
  category: 'Sofas' | 'Chairs' | 'Living' | 'Bedroom' | 'Lighting' | 'Decor' | 'Storage';
  /** The kind of piece, for its starting size in a room. */
  kind?: 'sofa' | 'chair' | 'lamp' | 'table';
  colors: string[];
  /** Unknown for Amazon products; the product page hides empty fields. */
  dims?: string;
  blurb?: string;
  rating: number;
  reviews: number;
  /** A plain link to buy the piece on its retailer's site. When set, the product page's main button is Shop and opens it. */
  shopUrl?: string;
};

const p = (
  id: string,
  key: string,
  name: string,
  retailer: string,
  price: number,
  category: Product['category'],
  colors: string[],
  dims: string,
  blurb: string,
  extra: Partial<Product> = {},
): Product => ({
  id,
  name,
  retailer,
  domain: retailer.toLowerCase().replace('&', 'and').replace(/[^a-z]/g, '') + '.com',
  price,
  sticker: art[`s_${key}` as ArtKey],
  photo: art[`p_${key}` as ArtKey],
  category,
  colors,
  dims,
  blurb,
  rating: 4.6,
  reviews: 212,
  ...extra,
});

const illustrated: Product[] = [
  p('chair', 'chair', 'Oak Spindle Chair', 'Oakline', 210, 'Chairs', ['#D2B184'], '20" W × 21" D × 33" H', 'Solid oak with a spindle back. Works at a desk or a small dining table.', { rating: 4.5, reviews: 158 }),
  p('tablelamp', 'tablelamp', 'Gourd Ceramic Table Lamp', 'Maison Verde', 148, 'Lighting', ['#F3EDE2', '#0F5B45'], '24" H × 14" shade', 'Hand-glazed stoneware base with a pleated linen shade.', { rating: 4.6, reviews: 194 }),
  p('plant', 'plant', 'Faux Fiddle Leaf Fig, 5 ft', 'Greenroom', 119, 'Decor', ['#3E8350'], '60" H, 12" pot', 'All of the drama, none of the watering schedule. Ships in a stone-look planter.', { was: 149, rating: 4.4, reviews: 902 }),
  p('sidetable', 'sidetable', 'Travertine Drum Side Table', 'Maison Verde', 210, 'Living', ['#E3D6C1'], '16" Ø × 20" H', 'Honed travertine with natural veining. No two are quite the same.', { rating: 4.6, reviews: 143 }),
  p('mirror', 'mirror', 'Arched Brass Floor Mirror', 'Studio Nord', 265, 'Decor', ['#C9A35A', '#1A1A1A'], '28" W × 68" H', 'A thin brass frame and an arched top that makes any wall look taller.', { rating: 4.7, reviews: 655 }),
  p('artprint', 'artprint', 'Sun & Hill Print, Framed', 'Paper Atelier', 85, 'Decor', ['#0F5B45', '#C8693F'], '18" × 24"', 'Archival giclée print in a slim black oak frame. Ready to hang.', { rating: 4.9, reviews: 88 }),
  p('bed', 'bed', 'Linen Upholstered Bed, Queen', 'Hearth & Field', 980, 'Bedroom', ['#D8CCBB', '#5F5A54'], '64" W × 86" D × 48" H', 'A channel-tufted headboard in washed linen. Assembles in 20 minutes, no tools.', { was: 1180, rating: 4.7, reviews: 774 }),
  p('dresser', 'dresser', 'Walnut Six-Drawer Dresser', 'Oakline', 720, 'Storage', ['#6B4228'], '58" W × 18" D × 32" H', 'Dovetailed drawers, soft-close runners and solid brass knobs.', { rating: 4.6, reviews: 205 }),
  p('pendant', 'pendant', 'Opal Globe Pendant', 'Studio Nord', 96, 'Lighting', ['#F3E7CC'], '12" Ø, 6 ft cord', 'Hand-blown opal glass with a brushed brass canopy. Plug-in friendly for renters.', { rating: 4.5, reviews: 417 }),
  p('bookshelf', 'bookshelf', 'Oak Open Bookshelf', 'Oakline', 260, 'Storage', ['#D2B184'], '32" W × 12" D × 64" H', 'Four deep shelves in solid oak. Anchors to the wall with a renter-safe kit.', { rating: 4.5, reviews: 132 }),
];

type Cached = { asin: string; name: string; price: number | null; imageUrl: string; productUrl: string; rank: number | null; rating: number | null; ratingsTotal: number | null };

// Rugs are cached too, but left out for now: their main photos are room scenes, so their stickers fail.
const AMAZON: Record<string, Pick<Product, 'category' | 'kind'>> = {
  sofas: { category: 'Sofas', kind: 'sofa' },
  'accent-chairs': { category: 'Chairs', kind: 'chair' },
  'floor-lamps': { category: 'Lighting', kind: 'lamp' },
  'coffee-tables': { category: 'Living', kind: 'table' },
};

/** Amazon titles run long ("Brand Sofa, 3 Seater | Foo, Bar"); keep the part before the first " | ", cut at a comma if still long. */
const shortName = (title: string) => {
  const t = title.split(' | ')[0].trim();
  if (t.length <= 64) return t;
  const cut = t.lastIndexOf(',', 64);
  return cut > 24 ? t.slice(0, cut) : t.slice(0, 61).trimEnd() + '…';
};

const stickers = art as Record<string, ImageSrc | undefined>;

const amazon: Product[] = Object.entries(bestsellers.categories as Record<string, { products: Cached[] }>).flatMap(([cat, { products: list }]) =>
  list
    .filter((x) => x.price != null && AMAZON[cat])
    .map((x) => ({
      id: x.asin,
      name: shortName(x.name),
      retailer: 'Amazon',
      domain: 'amazon.com',
      price: x.price!,
      sticker: stickers[`st_${x.asin}`] ?? { uri: x.imageUrl },
      photo: { uri: x.imageUrl },
      ...AMAZON[cat],
      colors: [],
      rating: x.rating ?? 0,
      reviews: x.ratingsTotal ?? 0,
      shopUrl: x.productUrl,
    })),
);

/** The best-selling cached piece of a kind. Looks, saved items and sample links use these. */
const top = (kind: NonNullable<Product['kind']>, nth = 0) => amazon.filter((x) => x.kind === kind)[nth]?.id ?? illustrated[0].id;
export const pick = {
  sofa: top('sofa'),
  sofa2: top('sofa', 1),
  chair: top('chair'),
  chair2: top('chair', 1),
  lamp: top('lamp'),
  table: top('table'),
};

export const products: Product[] = [...amazon, ...illustrated];

export const productById = (id: string) => products.find((x) => x.id === id) ?? products[0];

export type Look = {
  id: string;
  title: string;
  author: string;
  room: string;
  /** The look's line-art room, its furniture drawn in. */
  backdrop: RoomKey;
  productIds: string[];
};

export const looks: Look[] = [
  { id: 'emerald', title: 'The Emerald Edit', author: '@nora.lives', room: 'Living room · 540 sq ft', backdrop: 'look_emerald', productIds: [pick.sofa, pick.lamp, pick.table, 'plant', 'artprint'] },
  { id: 'warm', title: 'Soft Landing', author: '@theo.firstplace', room: 'Bedroom · 120 sq ft', backdrop: 'look_warm', productIds: ['bed', 'pendant', 'sidetable', 'tablelamp', 'plant'] },
  { id: 'gallery', title: 'The Reading Corner', author: '@jules.at.home', room: 'Studio · 410 sq ft', backdrop: 'look_gallery', productIds: [pick.chair, 'sidetable', 'mirror', 'bookshelf', 'pendant'] },
  { id: 'first', title: 'First Place, Done Right', author: '@sam.rents', room: 'Bedroom · 140 sq ft', backdrop: 'look_first', productIds: ['dresser', 'artprint', 'tablelamp', 'chair', 'plant'] },
  { id: 'savannah', title: 'Savannah Sunday', author: '@ellie.unpacks', room: 'Living room · 480 sq ft', backdrop: 'look_savannah', productIds: [pick.sofa2, pick.chair2, pick.lamp, 'plant', 'artprint'] },
];

/** The products in a look. */
export const lookProducts = (l: Look) => l.productIds.map(productById);

export const lookById = (id: string) => looks.find((x) => x.id === id) ?? looks[0];

// Sample links the "paste" flow pretends to read: cached Amazon products, plus two placeholders.
const amazonLink = (id: string) => ({ url: `https://www.amazon.com/dp/${id}`, productId: id });
export const sampleLinks = [
  amazonLink(pick.sofa),
  amazonLink(pick.chair),
  amazonLink(pick.lamp),
  amazonLink(pick.table),
  { url: 'https://maisonverde.com/p/travertine-drum-side-table', productId: 'sidetable' },
  { url: 'https://studionord.com/decor/arched-brass-mirror', productId: 'mirror' },
];
