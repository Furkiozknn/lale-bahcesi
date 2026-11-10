# tools/gate.mjs: bot regression gate

`tools/smoke.mjs` answers "does the page load with 0 errors". `tools/gate.mjs` answers "does the game still play as
well as before, and can a phone reach its buttons". It exists because on 9 Nov an unreviewed commit made arrows do
0 damage to armoured enemies: the bot fell from wave 15 to wave 8 and smoke stayed green.

## What it checks

1. **sim**: loads the build in headless Chromium with `?auto&debug`, holds `requestAnimationFrame` so wall-clock
   frames cannot advance the game, calls the game's own fast-forward hook (`hisarSim(1260)`) and reads the metrics.
   The candidate runs twice; different numbers mean the sim is not deterministic and the gate fails (a comparison
   would be meaningless). The base runs once (skipped when it is byte-identical to the candidate). Each metric is
   compared with its tolerance (`abs` units or `rel` fraction it may drop, `max` ceiling, `info` not gated).
2. **layout**: at 390×844, 360×740 and 412×915 with `isMobile` + `hasTouch`, every visible element matching
   `GAME.layout.selectors` must be inside the viewport and be what `elementFromPoint` returns at its centre.
3. **console**: every run (sim and layout) must have 0 page errors, 0 console errors and 0 failed requests.
   Analytics and Google Fonts are answered with an empty 200, as in smoke.

Output: `ok` / `FAIL` / `KNOWN` / `note` lines, then `RESULT OK|FAIL`, exit 1 on FAIL. `GATE_JSON=<file>` also writes
a JSON report.

## Running

```sh
node tools/gate.mjs                       # base = origin/main:index.html, candidate = working tree
node tools/gate.mjs --base <ref>          # any git ref
node tools/gate.mjs --baseline            # base = tools/gate-baseline.json (no git base needed)
node tools/gate.mjs --record              # write tools/gate-baseline.json from the working tree (main only)
node tools/gate.mjs --candidate x.html    # test a scratch build without touching index.html
node tools/gate.mjs --only sim|layout
node tools/gate.mjs --strict-layout       # KNOWN layout offenders fail too
SMOKE_CDN_DIR=<npm package dir> ...       # serve three.js from a local copy (no CDN access)
```

Assets (models, images) always come from the working tree; only the entry HTML differs between base and candidate.
Runtime here (4 cores, shared, load average 25-35): 40-80 s per sim run; a full gate is about 4.5 min when the base is
identical (2 sim runs) and up to 9 min with a different base (3 sim runs); `--baseline --only sim` about 3 min.
Timeouts are generous and print as `infra: … timed out` (still a FAIL, never a pass); a whole-run watchdog stops at
15 min. CI runs it as the `gate` job in `.github/workflows/smoke.yml` (PR: base = `HEAD^1`, the base
branch; manual run: `--baseline`).

## This game (lale-bahcesi)

Copied from kale-savunmasi's `tools/gate.mjs` (via the cay-ocagi port, which added an optional `GAME.sim.init`
script run before the page's own scripts). Only the `GAME` block differs. The sections above describe the
kale-savunmasi original (`hisarSim`, its timings); for lale-bahcesi:

- **sim**: `?auto` starts a garden with the bot; `run` is the game's own `laleSim(4000)` (fixed 1/30 s steps, the bot
  every 0.25 s) until the bot sees the end screen (4 seasons, about 12 s here).
- **the game is not seeded**: outside the daily mode the soil, the sim dice (`rnd()` falls back to `Math.random`),
  aphids, breeding and the bot's choices all use `Math.random`. Two plain loads ended 26 vs 19 varieties (won vs
  lost). `init` therefore (1) replaces `Math.random` with a fixed-seed generator and (2) removes `AudioContext`:
  `newGame()` starts a music scheduler on a 120 ms `setInterval` that draws from `Math.random`, so a wall-clock
  number of draws landed before the sim (one build gave 39 and then 45 hybrid seeds). With both, every build is
  reproducible (`ok sim determinism` on every run here).
- **limit**: a fixed seed makes one build reproducible, not two builds comparable call for call. Any change that
  draws one more random number shifts the stream and the garden. Spread on main over 8 fixed seeds (audio off) and
  2 plain loads: stars 3 and beauty 87-88 always, hybrid seeds (`bred`) 71-98, `rep` (jury points) 102-116,
  varieties 16-29, won 7 of 10 (a garden under 20 varieties loses). So `stars` abs 0, `beauty` abs 3, `bred` rel 30 %
  and `rep` rel 20 % are gated (they cover the whole spread); `varieties`, `won`, `blooms`, `season`, `ended`,
  `botDone` are info; `gameErrors` max 0. The seed (`47514`) gives a median garden: 21 varieties, won, bred 92,
  rep 108. This gate catches large regressions (breeding halved: bred 92 -> 44, FAIL), not a few per cent. A real
  fix is a seed for every garden (as the daily mode already has, `S.seed`) and the bot drawing from `rnd()`; then
  `init` can go and the tolerances can tighten.
- **layout**: `?auto`: every `#hud` button (speed, pause, catalogue, bazaar, sound, language) and every `#build`
  button, each on its own. Until 8f29723 `#build` was a horizontal scroller with a hidden scrollbar (7e52007, UI
  rebirth): on phones Bench and Erase (and Lantern at 360 px) started off-screen, reachable only by swiping, and the
  gate checked the bar as one element. 8f29723 makes it two rows of four below 600 px; with `#build button` the
  previous main fails (3 buttons off-screen at 360, 2 at 390 and 412) and the fix passes (14 buttons per phone).
  `layout.known` is empty.
- **runtime here**: about 12 s per sim run; full gate with an identical base under a minute.

## Porting to another game

Copy `tools/gate.mjs` and edit only the `GAME` block at the top:

- `entry`, `cdn.match` / `cdn.pkg` (import-map CDN URL and the part before the path inside the npm package),
  `ignored` (requests answered empty).
- `sim.query`: URL flags that start the bot and expose the hook (`?auto&debug`, `?auto&sim`, …).
- `sim.ready` / `sim.run` / `sim.metrics`: in-page functions. `run` must be synchronous (or return a promise) and
  deterministic: fixed time step, seeded RNG, bot on. If the game only has a `?sim=N` URL flag that runs before the
  first frame, put it in `query` and make `run` a no-op. If the core runs in Node, a Node runner is cheaper, but keep
  the same output format.
- `sim.tolerance`: which metrics gate and how much they may drop. Prefer the bot's progress measure (wave, level,
  stars, day), a volume measure (kills, score) and an economy measure (gold, cash). Add the game's own error count
  with `max: 0`.
- `sim.holdFrames`: keep `true` unless the hook needs the render loop.
- `layout.query` / `layout.selectors`: a URL that shows the in-game HUD with no overlay, and the HUD's buttons.
- `layout.known`: only real, already-reported offenders, with the commit and the reason. Never add one to make a
  run green.

Checklist per game:

1. Find the hook (`grep -n "Sim\b\|?sim\|?auto\|selftest" index.html`) and check in the code that it uses a fixed step
   and a seeded RNG (no `Math.random`/`Date.now` in the update path).
2. Run `--only sim` twice on main: the determinism line must say `identical`.
3. Check the numbers against the game's README/report claims; if they differ, write down which is right.
4. `--record` on main and commit `tools/gate-baseline.json`.
5. Prove it fails: a scratch `--candidate` with a known regression (e.g. a revert of a bad relay commit, or damage × 0)
   must give `RESULT FAIL` on a sim metric. Keep the scratch file out of git.
6. Run the layout part; list existing offenders in `layout.known` with their source commit, or fix them first.
7. Add the `gate` job to the game's workflow (chromium only, `timeout-minutes`, `permissions: contents: read`,
   the already pinned `actions/checkout` and `actions/setup-node` SHAs, `fetch-depth: 2`).
