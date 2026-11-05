// Fills the product cache (data/catalog/amazon-bestsellers.json) from Amazon Best Sellers via Canopy.
// Cache-first: a category already in the cache is never fetched again unless you pass --refresh.
// One Canopy request per category; images are not fetched here (see scripts/stickers).
//
//   npm run catalog:fetch                         fetch only the categories missing from the cache
//   npm run catalog:fetch -- --refresh sofas      refetch one category (spends 1 request)
//   npm run catalog:fetch -- --dry-run            show what would be fetched, spend nothing
import fs from 'node:fs';
import path from 'node:path';

import { MONTHLY_LIMIT, canopyGet, readUsage, root } from './client.mjs';

const CATALOG_FILE = path.join(root, 'data/catalog/amazon-bestsellers.json');

// Amazon US Best Sellers pages, checked by hand against each page's title.
const CATEGORIES = {
  sofas: { label: 'Sofas & Couches', url: 'https://www.amazon.com/Best-Sellers-Home-Kitchen-Sofas-Couches/zgbs/home-garden/3733551' },
  'accent-chairs': { label: 'Living Room Chairs', url: 'https://www.amazon.com/Best-Sellers-Home-Kitchen-Living-Room-Chairs/zgbs/home-garden/3733491' },
  'floor-lamps': { label: 'Floor Lamps', url: 'https://www.amazon.com/Best-Sellers-Tools-Home-Improvement-Floor-Lamps/zgbs/hi/1063294' },
  rugs: { label: 'Area Rugs', url: 'https://www.amazon.com/Best-Sellers-Home-Kitchen-Area-Rugs/zgbs/home-garden/684541011' },
  'coffee-tables': { label: 'Coffee Tables', url: 'https://www.amazon.com/Best-Sellers-Home-Kitchen-Coffee-Tables/zgbs/home-garden/3733631' },
};

function readCatalog() {
  try {
    return JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
  } catch {
    return { source: 'Canopy API /api/amazon/bestsellers (US)', categories: {} };
  }
}

/** Amazon serves any size of a product image by its URL; drop the thumbnail size for a 1000 px one. */
const fullSizeImage = (url) => (url ? url.replace(/\._[^/]*_\.(jpg|jpeg|png|webp)$/i, '._AC_SL1000_.$1') : url);

const toProduct = (r, category) => ({
  asin: r.asin,
  name: r.title,
  price: r.price?.value ?? null,
  priceDisplay: r.price?.display ?? null,
  imageUrl: fullSizeImage(r.mainImageUrl),
  productUrl: `https://www.amazon.com/dp/${r.asin}`,
  category,
  rank: r.bestSellersRank ?? null,
  rating: r.rating ?? null,
  ratingsTotal: r.ratingsTotal ?? null,
});

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run');
  const ri = args.indexOf('--refresh');
  const refresh = ri >= 0 ? args[ri + 1] : null;
  if (refresh && !CATEGORIES[refresh]) throw new Error(`Unknown category "${refresh}". One of: ${Object.keys(CATEGORIES).join(', ')}`);

  const catalog = readCatalog();
  const todo = Object.keys(CATEGORIES).filter((k) => k === refresh || !catalog.categories[k]);
  const usage = readUsage();
  console.log(`Canopy usage ${usage.month}: ${usage.count}/${MONTHLY_LIMIT}`);
  if (!todo.length) return console.log('Every category is cached. Nothing to fetch.');
  console.log(`${dry ? 'Would fetch' : 'Fetching'} ${todo.length} categor${todo.length === 1 ? 'y' : 'ies'} (${todo.length} request${todo.length === 1 ? '' : 's'}): ${todo.join(', ')}`);
  if (dry) return;

  for (const key of todo) {
    const { label, url } = CATEGORIES[key];
    const json = await canopyGet('/api/amazon/bestsellers', { url }, `bestsellers ${key}`);
    const raw = path.join(root, '.cache/canopy-raw', `bestsellers-${key}.json`);
    fs.mkdirSync(path.dirname(raw), { recursive: true });
    fs.writeFileSync(raw, JSON.stringify(json, null, 2));

    const results = json?.data?.amazonBestSellers?.productResults?.results ?? [];
    const seen = new Set();
    const products = results.filter((r) => r.asin && !seen.has(r.asin) && seen.add(r.asin)).map((r) => toProduct(r, key));
    catalog.categories[key] = { label, url, fetchedAt: new Date().toISOString(), products };
    catalog.updatedAt = new Date().toISOString();
    // Save after each category, so a failure later never throws away a request already paid for.
    fs.mkdirSync(path.dirname(CATALOG_FILE), { recursive: true });
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2) + '\n');
    console.log(`  ${key}: ${products.length} products`);
  }
  console.log(`Canopy usage ${readUsage().month}: ${readUsage().count}/${MONTHLY_LIMIT}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
