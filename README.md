# ENVEE

Clickable look-and-feel prototype of ENVEE. ENVEE lets new grads and renters decorate a photo of their room, or a rental listing, with "stickers" of real furniture pasted from shopping links. Then they buy what they like on the retailer's site, through affiliate links.

**This is a visual mockup only.** It has no backend, AI or accounts. Room photos can be picked from the phone, but nothing is uploaded or saved.

- **Real furniture (coming):** affiliate products go in `src/data/catalog.ts` with a `shopUrl`; their cut-outs go in `assets/catalog`. A product with a `shopUrl` gets a Shop button that opens the retailer's page.
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

Other scripts:
- `node scripts/gen-assets.mjs` regenerates `src/theme/assets.ts` after adding images to `assets/art`, `assets/catalog` or `assets/line`.
- `npm run build:line-art` renders the line art in `hairline/art/scenes.js` to `assets/line/*.svg` (needs Playwright), then runs `gen-assets.mjs`.
- `node scripts/generate-art.js assets/art` redraws the illustrated product placeholders (needs Playwright).
