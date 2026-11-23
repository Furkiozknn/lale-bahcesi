# Credits

## 3D chibi style (stil-3d, 24.11.2026)

The garden now looks like the game's own song video ("Turkish is easy… in a garden?"). The figures, tulips and ground
textures in `assets/3d/` were generated for this game with the Gemini app (Nano Banana image model), described after the
video's main frame (the palace gardener girl with the red felt cap and the Dutch tulip-bulb mascot). Each request
asked for an item sheet on a plain white background; the sheets were cut out and keyed locally with PIL
(`atolye/oyun-stil/lale-bahcesi/kes.py`). Adobe Firefly was tried first but had no credits left.

| File | Tool | Content |
|---|---|---|
| `3d/lale.webp`, `3d/lale-m.webp`, `3d/ui-lale*.webp` | Gemini (Nano Banana), 1 request | 3x3 tulip sheet: round, almond and needle blooms, bud, sprout, young leaves, wilted tulip, bulb, bouquet. The red cups were turned grey locally so the game paints every variety's colour; `lale-m` holds the cup, edged and flamed masks |
| `3d/chibi.webp`, `3d/ui-bahcivan/sevinc/uzgun/lale-tutan/sogan*.webp` | Gemini (Nano Banana), 1 request | gardener (standing, walking, watering, cheering, sad, holding a tulip) and the onion-bulb mascot (standing, walking, jumping) |
| `3d/juri.webp`, `3d/ui-juri-*.webp`, `3d/ui-servi/cinar/fener/bank.webp` | Gemini (Nano Banana), 1 request | festival jury (miniature painter, tulip connoisseur, architect, head gardener), cypress, plane tree, lantern, bench, kiosk |
| `3d/zemin-*.webp` | Gemini (Nano Banana), 1 request | lawn, soil, flagstone and marble clay textures (seams blended locally) |
| `3d/gok.webp` | song video plate `teras.jpg` (FLUX.1-dev via NVIDIA, made for the video on 20.11.2026) | the Bosphorus terrace behind the floating garden |

Three.js (MIT) is loaded from jsDelivr. The music and sound effects are synthesised in code.
