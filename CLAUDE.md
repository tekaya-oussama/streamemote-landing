# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

StreamEmote's marketing landing page. StreamEmote is a pitched product that reads
heart rate, breathing rate, HRV and stress from a plain webcam (rPPG) and renders
them as a live OBS overlay for streamers.

This repo is **the landing page only** — there is no product code, no backend, no
API. Everything on the page is a simulation for demo purposes.

## Structure

```
index.html          the entire site — markup, CSS and JS in one file (~2,600 lines)
assets/
  logo-dark.png     shown in dark mode
  logo-light.png    shown in light mode
.claude/launch.json dev server config
README.md           title only
```

There is no build step, no package manager, no dependencies to install. Google
Fonts (Archivo, Karla, Martian Mono) load from CDN; everything else is inline.

## Running it

```bash
python -m http.server 5173 --bind 127.0.0.1
```

Then open http://127.0.0.1:5173. Open the file directly with `file://` and it
mostly works, but serve it to keep asset paths and canvas behaviour honest.

## Layout of index.html

The file is one document in three parts. Section banners (`/* ==== NAME ==== */`)
mark boundaries — keep using them when adding code.

**CSS (`<style>`, ~line 13–1490)** in this order:

| Section | Purpose |
|---|---|
| TOKENS | CSS custom properties (see theming below) |
| BASE | reset, typography, `.wrap` container |
| NAV / BUTTONS | chrome and `.btn` variants |
| SECTION SCAFFOLD | `.band`, `.band-alt`, `.shead` — the repeating section frame |
| HERO, LIVE DEMO | above the fold + the animated overlay mock |
| TRUST STRIP, SIGNALS, PRIVACY, STEPS, REACTIONS, FEATURES, RECAP, PRICING, WAITLIST, FOOTER | page sections, in DOM order |
| RESPONSIVE | all media queries, collected at the end |

**Markup (~line 1440–2270):** an inline SVG sprite of emote glyphs (`#g-happy`,
`#g-angry`, `#g-shocked`, `#g-laughing`, `#g-sad`), then `<nav>`, `<header
id="top">`, a run of `<section class="band">` alternating with `band-alt`, then
`<footer>`. Anchor targets in use: `#top`, `#signals`, `#privacy`, `#reactions`,
`#pricing`.

**JS (`<script>`, ~line 2270–end):** one IIFE in strict mode, no libraries. Blocks:

- **Scene switching** — `SCENES` (`calm` / `clutch` / `rage`) drives every number,
  colour, glyph, tint and confidence level in the demo overlay at once.
- **Emote pack picker** — a `role="radiogroup"` swapping the sprite `<use href>`.
- **Canvas setup + animation loop** — hand-drawn pulse waveform (systolic peak,
  dicrotic notch) on `#pulse` and a breathing wave on `#breathWave`, both DPR-aware.
- **Pricing toggle** — monthly/annual, rewrites the amount and billing strings.
- **Waitlist form** — client-side validation, then a local success state. It
  posts nowhere.

## Conventions

**Theming.** Dark-first: bare `:root` *is* the dark palette. Light is layered on
top twice — once under `@media (prefers-color-scheme: light)` for the automatic
case, once under `:root[data-theme="light"]` for the explicit toggle. Any new
colour needs a token in both places. Never hardcode a hex outside the TOKENS
block.

**Colour semantics.** `--hr` red, `--breath` cyan, `--ok`/`--warn`/`--crit` for
stress states, `--brand` violet. Emote packs get a `--p-<name>` pair (glyph
colour + background disc).

**Type.** `--fd` Archivo for display, `--fb` Karla for body, `--fm` Martian Mono
for labels and data. The `.mono` and `.tnum` (tabular figures) helpers exist —
use them rather than restating font properties.

**JS reads the tokens, not the other way round.** Canvas trace colours are pulled
from computed styles so the waveforms follow the theme. A `MutationObserver` on
`data-theme` re-reads them on switch. Preserve that if you touch drawing code.

**Motion.** `prefers-reduced-motion` is checked once at the top of the IIFE into
`reduce`; animation paths branch on it. Honour it in anything new.

**Accessibility.** Interactive demo controls carry real ARIA — `aria-pressed` on
scene and pricing toggles, `role="radio"` + `aria-checked` on packs, `aria-hidden`
on decorative SVG, visually-hidden labels on inputs. Keep it.

## Voice

Product copy is plainspoken and specific, and it admits limits rather than
overclaiming — the `rage` scene deliberately degrades signal confidence because
movement genuinely breaks rPPG. Don't replace that honesty with marketing gloss.
No exclamation marks, no "revolutionary".

## Editing notes

- Everything is one file on purpose. Don't split into separate CSS/JS files
  unless asked.
- Add new media queries to the RESPONSIVE block at the end, not inline.
- Numbers, plans, testimonials and stats on the page are illustrative. Treat any
  figure as placeholder unless told otherwise.
- No tests and no linter. Verify changes by loading the page and exercising the
  scene buttons, pack picker, pricing toggle, waitlist form, and both themes.
