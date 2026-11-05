# ENVEE

Clickable look-and-feel prototype of ENVEE. ENVEE lets new grads and renters decorate a photo of their room, or a rental listing, with "stickers" of real furniture pasted from shopping links. Then they buy what they like on the retailer's site.

**This is a visual mockup only.** It has no backend, AI or accounts. Room photos can be picked from the phone, but nothing is uploaded or saved.

- **Real furniture:** Amazon Best Sellers for sofas, accent chairs, floor lamps and coffee tables, read from a local cache (`data/catalog/amazon-bestsellers.json`) filled from the [Canopy API](https://docs.canopyapi.co/). Rugs are cached too but left out of the app for now, since their stickers came out badly. The app never calls the API. Each product's Shop button opens its plain Amazon page.
- **Stickers:** each cached product's main photo, with its background removed on this machine by [rembg](https://github.com/danielgatis/rembg) (`assets/stickers/<ASIN>.webp`). Stickers that failed review are listed in `data/catalog/sticker-rejects.json`; a product without a sticker shows its photo.
- **Illustrated placeholders:** lamps, rugs, decor, beds and other pieces from invented stores are generated illustrations (`assets/art`).
- **Line art:** the app's chrome is drawn in the welcome room's Hairline style (`assets/line`): the sample rooms behind spaces and looks, empty states, and the new-space options. Photos and product cut-outs are never drawn over. The sample spaces and looks start with line-art furniture drawn into the room, in the room's own view; pasted pieces go on top as photos.

Built with Expo SDK 58, TypeScript and Expo Router.

## Screens

| Route | Screen |
| --- | --- |
| `/` | Welcome |
| `/home` | Spaces (tab): your rooms and listings |
| `/discover` | Discover (tab): editorial looks and a product grid |
| `/saved` | Saved (tab): saved pieces and looks |
| `/profile` | You (tab): move-in budget and settings |
| `/new-space` | Start a space from a photo or a rental listing (modal) |
| `/room/[id]` | Room editor: drag stickers, resize them, bring to front, remove, compare with the original photo |
| `/paste?space=` | Paste a product link: fake read, then background removal, then add to the room (modal) |
| `/room/[id]/shop` | Shop this room |
| `/product/[id]` | Product detail |
| `/look/[id]` | Look detail |

## Run

```bash
npm install
npx expo start            # scan the QR code with Expo Go
npx expo start --tunnel   # if your phone is on a different network
npm run build:web-inline  # single self-contained dist-inline/index.html
npm run typecheck
```

`scripts/build-web-inline.mjs` inlines all JS, images and fonts into one HTML file, so it can be hosted anywhere.

Catalog and stickers (cache-first, see `CLAUDE.md`):
- `npm run catalog:usage` shows this month's Canopy requests (capped at 100/month in `scripts/canopy/client.mjs`).
- `npm run catalog:fetch` fetches only categories missing from the cache (one request each). `-- --refresh <category>` refetches one; `-- --dry-run` spends nothing. Needs `CANOPY_API_KEY` in `.env`.
- `npm run stickers` makes a sticker for every cached product that lacks one, then regenerates `src/theme/assets.ts`. One-time setup: `py -m venv .venv` then `.venv/Scripts/python -m pip install "rembg[cpu]" pillow` (the model, ~170 MB, downloads on first run).

Other scripts:
- `node scripts/gen-assets.mjs` regenerates `src/theme/assets.ts` after adding images to `assets/art`, `assets/catalog`, `assets/line` or `assets/stickers`.
- `npm run build:line-art` renders the line art in `hairline/art/scenes.js` to `assets/line/*.svg` (needs Playwright), then runs `gen-assets.mjs`.
- `node scripts/generate-art.js assets/art` redraws the illustrated product placeholders (needs Playwright).
