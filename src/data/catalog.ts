import type { ArtKey } from '@/theme/assets';
import type { RoomKey } from '@/theme/rooms';

import { paulaDeenProducts } from './paulaDeen';

// Real products from the Paula Deen Home catalog (see paulaDeen.ts), plus illustrated
// placeholder pieces (lamps, rugs, decor) from invented retailers.
export type Product = {
  id: string;
  name: string;
  retailer: string;
  domain: string;
  price: number;
  was?: number;
  sticker: ArtKey;
  photo: ArtKey;
  category: 'Sofas' | 'Chairs' | 'Ottomans' | 'Living' | 'Bedroom' | 'Lighting' | 'Decor' | 'Storage';
  colors: string[];
  dims: string;
  blurb: string;
  rating: number;
  reviews: number;
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
  sticker: `s_${key}` as ArtKey,
  photo: `p_${key}` as ArtKey,
  category,
  colors,
  dims,
  blurb,
  rating: 4.6,
  reviews: 212,
  ...extra,
});

const illustrated: Product[] = [
  p('floorlamp', 'floorlamp', 'Arc Floor Lamp, Brass', 'Studio Nord', 289, 'Lighting', ['#C9A35A', '#1A1A1A'], '72" H × 48" reach', 'A sweeping brass arc on a marble base. Lights a reading corner without a ceiling fixture.', { rating: 4.5, reviews: 528 }),
  p('tablelamp', 'tablelamp', 'Gourd Ceramic Table Lamp', 'Maison Verde', 148, 'Lighting', ['#F3EDE2', '#0F5B45'], '24" H × 14" shade', 'Hand-glazed stoneware base with a pleated linen shade.', { rating: 4.6, reviews: 194 }),
  p('plant', 'plant', 'Faux Fiddle Leaf Fig, 5 ft', 'Greenroom', 119, 'Decor', ['#3E8350'], '60" H, 12" pot', 'All of the drama, none of the watering schedule. Ships in a stone-look planter.', { was: 149, rating: 4.4, reviews: 902 }),
  p('rug', 'rug', 'Oval Wool Rug, Oat', 'Loom House', 340, 'Decor', ['#EFE7DA', '#B9A88E'], "6' × 9'", 'Hand-tufted New Zealand wool with a soft, low pile and a tonal border.', { rating: 4.7, reviews: 311 }),
  p('coffeetable', 'coffeetable', 'Round Oak Pedestal Table', 'Oakline', 420, 'Living', ['#D2B184', '#5A3620'], '36" Ø × 16" H', 'Solid white oak with a sculpted pedestal. Round edges for small rooms.', { rating: 4.8, reviews: 267 }),
  p('sidetable', 'sidetable', 'Travertine Drum Side Table', 'Maison Verde', 210, 'Living', ['#E3D6C1'], '16" Ø × 20" H', 'Honed travertine with natural veining. No two are quite the same.', { rating: 4.6, reviews: 143 }),
  p('mirror', 'mirror', 'Arched Brass Floor Mirror', 'Studio Nord', 265, 'Decor', ['#C9A35A', '#1A1A1A'], '28" W × 68" H', 'A thin brass frame and an arched top that makes any wall look taller.', { rating: 4.7, reviews: 655 }),
  p('artprint', 'artprint', 'Sun & Hill Print, Framed', 'Paper Atelier', 85, 'Decor', ['#0F5B45', '#C8693F'], '18" × 24"', 'Archival giclée print in a slim black oak frame. Ready to hang.', { rating: 4.9, reviews: 88 }),
  p('bed', 'bed', 'Linen Upholstered Bed, Queen', 'Hearth & Field', 980, 'Bedroom', ['#D8CCBB', '#5F5A54'], '64" W × 86" D × 48" H', 'A channel-tufted headboard in washed linen. Assembles in 20 minutes, no tools.', { was: 1180, rating: 4.7, reviews: 774 }),
  p('dresser', 'dresser', 'Walnut Six-Drawer Dresser', 'Oakline', 720, 'Storage', ['#6B4228'], '58" W × 18" D × 32" H', 'Dovetailed drawers, soft-close runners and solid brass knobs.', { rating: 4.6, reviews: 205 }),
  p('pendant', 'pendant', 'Opal Globe Pendant', 'Studio Nord', 96, 'Lighting', ['#F3E7CC'], '12" Ø, 6 ft cord', 'Hand-blown opal glass with a brushed brass canopy. Plug-in friendly for renters.', { rating: 4.5, reviews: 417 }),
  p('bookshelf', 'bookshelf', 'Oak Open Bookshelf', 'Oakline', 260, 'Storage', ['#D2B184'], '32" W × 12" D × 64" H', 'Four deep shelves in solid oak. Anchors to the wall with a renter-safe kit.', { rating: 4.5, reviews: 132 }),
];

export const products: Product[] = [...paulaDeenProducts, ...illustrated];

export const productById = (id: string) => products.find((x) => x.id === id) ?? products[0];

/** A piece placed in a room: centre x and y as fractions of the room, size as a fraction of its width. */
export type Placement = { productId: string; x: number; y: number; size: number };

export type Look = {
  id: string;
  title: string;
  author: string;
  room: string;
  /** The line-art room the look is composed on. Its pieces are the real product cut-outs, placed live. */
  backdrop: RoomKey;
  pieces: Placement[];
};

// Placements as [productId, x, y, size] in a 900 x 1200 room, converted to fractions below.
const look = (id: string, title: string, author: string, room: string, backdrop: RoomKey, items: [string, number, number, number][]): Look => ({
  id,
  title,
  author,
  room,
  backdrop,
  pieces: items.map(([productId, x, y, size]) => ({ productId, x: x / 900, y: y / 1200, size: size / 900 })),
});

export const looks: Look[] = [
  look('emerald', 'The Emerald Edit', '@nora.lives', 'Living room · 540 sq ft', 'room_living', [
    ['rug', 450, 1010, 640], ['mallory-sofa', 450, 840, 620], ['floorlamp', 760, 640, 420],
    ['coffeetable', 450, 1010, 300], ['plant', 140, 800, 300], ['artprint', 450, 470, 200],
  ]),
  look('warm', 'Soft Landing', '@theo.firstplace', 'Bedroom · 120 sq ft', 'room_bedroom', [
    ['bed', 450, 840, 640], ['pendant', 450, 220, 230], ['sidetable', 110, 900, 170], ['tablelamp', 110, 760, 170], ['plant', 800, 860, 260],
  ]),
  look('gallery', 'The Reading Corner', '@jules.at.home', 'Studio · 410 sq ft', 'room_studio', [
    ['rug', 450, 1020, 600], ['hazel-chair', 310, 880, 330], ['sidetable', 540, 950, 150],
    ['mirror', 730, 700, 330], ['bookshelf', 150, 640, 380], ['pendant', 480, 210, 200],
  ]),
  look('first', 'First Place, Done Right', '@sam.rents', 'Bedroom · 140 sq ft', 'room_listing', [
    ['dresser', 450, 780, 420], ['artprint', 450, 430, 200], ['tablelamp', 360, 560, 140], ['bridget-swivel-chair', 740, 910, 300], ['plant', 150, 860, 280],
  ]),
  look('savannah', 'Savannah Sunday', '@ellie.unpacks', 'Living room · 480 sq ft', 'room_listing', [
    ['blair-sofa', 450, 845, 640], ['lowell-ottoman-green', 450, 1035, 340], ['della-chair-rosella', 790, 905, 300],
    ['floorlamp', 120, 700, 380], ['plant', 870, 760, 260], ['artprint', 450, 470, 200],
  ]),
];

/** The products in a look, in the order they were placed. */
export const lookProducts = (l: Look) => l.pieces.map((x) => productById(x.productId));

export const lookById = (id: string) => looks.find((x) => x.id === id) ?? looks[0];

// Sample links the "paste" flow pretends to read.
export const sampleLinks = [
  { url: 'https://cmfurniture.com/paula-deen/mallory-sofa', productId: 'mallory-sofa' },
  { url: 'https://cmfurniture.com/paula-deen/estelle-swivel-glider', productId: 'estelle-glider-coral' },
  { url: 'https://studionord.com/lighting/arc-floor-lamp-brass', productId: 'floorlamp' },
  { url: 'https://maisonverde.com/p/travertine-drum-side-table', productId: 'sidetable' },
  { url: 'https://cmfurniture.com/paula-deen/hazel-chair', productId: 'hazel-chair' },
  { url: 'https://cmfurniture.com/paula-deen/lowell-cocktail-ottoman', productId: 'lowell-ottoman-check' },
  { url: 'https://studionord.com/decor/arched-brass-mirror', productId: 'mirror' },
];
