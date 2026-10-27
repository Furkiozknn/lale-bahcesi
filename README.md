# Lale Bahçesi (Tulip Garden) · Claude Game Arena

**Play online:** https://furkiozknn.github.io/lale-bahcesi/ (desktop and phone, no install)
![Lale Bahçesi gameplay: tulips blooming around the fountain](docs/gameplay.gif)

A 3D cosy garden builder set in the Ottoman Tulip Era. Plant tulip bulbs on a walled palace terrace by the Bosphorus, water them, cut the blooms, breed new varieties, sell at the bazaar and win the Sultan's tulip festival with three stars.

Turkish by default, English via the TR / EN toggle. Single file, no build step.

## How to play

1. Click a bed tile to select it. Plant a bulb from the list, water it (the tile panel's Water button or the fountain range does it for you), and wait for the bud.
2. Click a blooming tulip's **Cut** button to take a flower. Lift the bulb afterwards with **Lift bulb**.
3. Two blooming tulips on neighbouring tiles can breed a hybrid seed. Its colour, petal shape and pattern mix the parents'.
4. Sell bulbs and flowers at the bazaar (B). Buy bulb packs there. Prices rise and crash, especially during a tulip mania.
5. Build paths, beds, a pool with turtles, cypress and plane trees, lanterns and benches from the build bar.
6. At the end of each 30-day season a festival scores the garden on variety, colour harmony, fountain symmetry and decoration. Win the final festival with three stars and at least 20 varieties to win the game. Endless mode continues afterwards.

## Controls

| Action | Key |
|---|---|
| Pause / back | P or Esc |
| Music on/off | M |
| Sound effects on/off | X |
| Language | L |
| Fullscreen | F |
| Speed 1x / 2x / 4x | T |
| Catalogue | C |
| Bazaar | B |
| Rotate decoration | Q / E |
| Pan | drag (no build tool) |
| Zoom | wheel / pinch |
| Camera yaw, zoom | arrow keys |
| Place or erase with a build tool | click or drag |

## Flags

- `?auto`: the built-in bot plays the whole game (same actions a player can take).
- `?debug`: shows fps, draw calls, triangles and JS errors on screen.
- `?sim=N`: fast-forwards N game seconds before the first frame.
- `?low`: shadows off, low quality.
- `?lang=en`: starts in English.
- `window.lale` and `window.laleSim(seconds)` expose the state and the fast-forward for tests.

## Assets

None. The game is fully procedural (Three.js geometry, Canvas gradient sprite, Web Audio synthesis). Nothing is loaded except Three.js r170 from jsDelivr.

## How it was made

Built by Claude Haiku 5.5 with Claude Code from one prompt: prompts/lale-bahcesi.md

Footer: Claude Game Arena · built by Claude Haiku 5.5 · https://furkiozknn.github.io/
