import type { ArtKey } from '@/theme/assets';
import type { RoomKey } from '@/theme/rooms';


// Illustrated placeholder pieces from invented retailers, until real affiliate products replace them.
// A real product sets shopUrl (its affiliate link) and uses its retailer's photo.
export type Product = {
  id: string;
  name: string;
  retailer: string;
  domain: string;
  price: number;
  was?: number;
  sticker: ArtKey;
  photo: ArtKey;
  category: 'Sofas' | 'Chairs' | 'Living' | 'Bedroom' | 'Lighting' | 'Decor' | 'Storage';
  colors: string[];
  dims: string;
  blurb: string;
  rating: number;
  reviews: number;
  /** An affiliate link to buy the piece from its retailer. When set, the product page's main button is Shop and opens it. */
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
  p('sofa', 'sofa', 'Emerald Velvet Sofa', 'Hearth & Field', 1490, 'Sofas', ['#1A6A51', '#C9A35A'], '84" W × 36" D × 33" H', 'Deep emerald velvet on tapered brass legs. Two bench cushions, no gap to lose your phone in.', { rating: 4.7, reviews: 386 }),
  p('armchair', 'armchair', 'Rust Bouclé Armchair', 'Loom House', 640, 'Chairs', ['#A25A31'], '32" W × 34" D × 36" H', 'A rounded back and track arms in warm rust bouclé. Sized for small living rooms.', { rating: 4.6, reviews: 241 }),
  p('chair', 'chair', 'Oak Spindle Chair', 'Oakline', 210, 'Chairs', ['#D2B184'], '20" W × 21" D × 33" H', 'Solid oak with a spindle back. Works at a desk or a small dining table.', { rating: 4.5, reviews: 158 }),
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

export const products: Product[] = [...illustrated];

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
  { id: 'emerald', title: 'The Emerald Edit', author: '@nora.lives', room: 'Living room · 540 sq ft', backdrop: 'look_emerald', productIds: ['sofa', 'rug', 'floorlamp', 'coffeetable', 'plant', 'artprint'] },
  { id: 'warm', title: 'Soft Landing', author: '@theo.firstplace', room: 'Bedroom · 120 sq ft', backdrop: 'look_warm', productIds: ['bed', 'pendant', 'sidetable', 'tablelamp', 'plant'] },
  { id: 'gallery', title: 'The Reading Corner', author: '@jules.at.home', room: 'Studio · 410 sq ft', backdrop: 'look_gallery', productIds: ['rug', 'armchair', 'sidetable', 'mirror', 'bookshelf', 'pendant'] },
  { id: 'first', title: 'First Place, Done Right', author: '@sam.rents', room: 'Bedroom · 140 sq ft', backdrop: 'look_first', productIds: ['dresser', 'artprint', 'tablelamp', 'chair', 'plant'] },
  { id: 'savannah', title: 'Savannah Sunday', author: '@ellie.unpacks', room: 'Living room · 480 sq ft', backdrop: 'look_savannah', productIds: ['sofa', 'armchair', 'rug', 'floorlamp', 'plant', 'artprint'] },
];

/** The products in a look. */
export const lookProducts = (l: Look) => l.productIds.map(productById);

export const lookById = (id: string) => looks.find((x) => x.id === id) ?? looks[0];

// Sample links the "paste" flow pretends to read.
export const sampleLinks = [
  { url: 'https://hearthandfield.com/p/emerald-velvet-sofa', productId: 'sofa' },
  { url: 'https://loomhouse.com/p/rust-boucle-armchair', productId: 'armchair' },
  { url: 'https://studionord.com/lighting/arc-floor-lamp-brass', productId: 'floorlamp' },
  { url: 'https://maisonverde.com/p/travertine-drum-side-table', productId: 'sidetable' },
  { url: 'https://oakline.com/p/round-oak-pedestal-table', productId: 'coffeetable' },
  { url: 'https://loomhouse.com/p/oval-wool-rug-oat', productId: 'rug' },
  { url: 'https://studionord.com/decor/arched-brass-mirror', productId: 'mirror' },
];
