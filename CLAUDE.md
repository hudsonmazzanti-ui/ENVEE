@AGENTS.md

## Product data is cache-first: minimize Canopy API calls

ENVEE's real products come from the Canopy API (Amazon data), which allows **100 requests a month**. Treat every request as expensive.

- The app reads products only from the committed cache, `data/catalog/amazon-bestsellers.json`. App code must never call Canopy (and the API key must never be bundled into the app).
- `scripts/canopy/client.mjs` is the only code allowed to call Canopy. It counts every request, including failed ones, in `data/canopy-usage.json` (committed) and refuses once 100 are used in the month. Never bypass it, raise the limit, or reset the counter.
- Check the cache and `npm run catalog:usage` before anything that might fetch. `npm run catalog:fetch` only fetches what isn't cached; use `-- --dry-run` to see what it would spend.
- Don't run `--refresh`, add categories, page through results, or call per-product endpoints (details, variants, reviews, extra image angles) without asking the user first and telling them how many requests it will cost.
- Product photos are downloaded from Amazon's image servers, not through Canopy, and don't count against the limit.

## Stickers

- `npm run stickers` cuts out each cached product's **main photo only** with rembg, a free local library (no paid APIs), into `assets/stickers/<ASIN>.webp`. These are committed. It skips products that already have one. Rugs are skipped (`SKIP_CATEGORIES`) and left out of the app for now: their main photos are room scenes and the cut-outs failed.
- Many Amazon main photos are room scenes or promo collages, so some cut-outs fail. Review new stickers by eye. Failed ones go in `data/catalog/sticker-rejects.json` (ASIN → reason), are deleted, and are never remade; those products show their photo. `-- --per-category N` limits a run to each category's top N.
- Downloaded photos and raw API responses go to `.cache/` (not committed). The Python venv is `.venv/` (not committed).
- After adding products, run `npm run stickers`; it regenerates `src/theme/assets.ts`.
