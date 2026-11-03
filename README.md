# ENVEE

Clickable look-and-feel prototype of ENVEE. ENVEE lets new grads and renters decorate a photo of their room, or a rental listing, with "stickers" of real furniture pasted from shopping links. Then they buy what they like.

**This is a visual mockup only.** It has no backend, AI, uploads or accounts. All products, stores and people are made up, and the illustrations are generated placeholders (in `assets/art`).

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
| `/bag`, `/confirmed` | One bag across stores, then a fake order confirmation |

## Run

```bash
npm install
npx expo start            # scan the QR code with Expo Go
npx expo start --tunnel   # if your phone is on a different network
npm run build:web-inline  # single self-contained dist-inline/index.html
npm run typecheck
```

`scripts/build-web-inline.mjs` inlines all JS, images and fonts into one HTML file, so it can be hosted anywhere.
