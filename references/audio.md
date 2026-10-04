# Sound — music as the clock, effects in code

## Contents
- Rules
- Finding the grid of a track
- Low tune / high tune
- Silence before a reveal
- Slowing the music under a quiet moment
- Making a section longer without breaking the music
- Effects and volumes
- Checking and fixing the mix

## Rules

- **Music comes from the user** (a licensed file in `public/`). Never download music or sound effects.
  No track → the video runs on synthesized effects alone; say so in the report.
- **Everything else is synthesized** (`scripts/sfx.mjs`, deterministic) — clicks, ticks, typing,
  swipes, whooshes, pings, pips, riser, impact, shimmer, heartbeat.
- **One sound per meaningful event**, never one per animation; nothing without a visual cause.

## Finding the grid of a track

```bash
node scripts/beatgrid.mjs public/music.mp3            # tempo, bar-line guess, kick map, loudness per bar
node scripts/beatgrid.mjs public/music.mp3 --phase=0.625   # re-check with a chosen bar line
```

- **Tempo** is reliable (comb over the whole track, refined to 0.01 BPM).
- **The bar line** can come out a 16th early on syncopated beats (an 808 that anticipates beat 2). Read
  the kick map: the drop's first hit should sit on a `|`. The tool also writes
  `out/beatgrid-click.wav` (the track + a tick per beat, high on bar lines) for a human to listen to —
  mention it in the report when you couldn't confirm the phase by eye.
- Set `music.bpm` and `music.start` (= a bar line, in song seconds, where the video starts) in
  `video.config.json`. Video beat 0 then lands on that bar line, and `B(beat)` follows the music.
- From the loudness table mark the landmarks in video beats (intro, drop, breakdown, build, return) and
  put the story on them: the product's name on the drop, the turn on a hit, calm content in the
  breakdown, the lockup on the full return.

## Low tune / high tune

`scripts/music.mjs` decodes the track once into two sample-aligned stems: **dry** and **muffled**
(low-pass at `music.muffleHz`, default 420 Hz, ×2, gain ×1.5). `Music` crossfades them with a `muffle`
envelope (0 open … 1 muffled); the muffled stem plays at ×0.55 so a dip reads as a dip.
- Muffled intro → open before the name reveal.
- Muffle (~0.85) during "searching" moments, open again on "found" / approve.
- Overall level `TOP ≈ 0.7`.

## Silence before a reveal

`gain` drops to 0 for ~18 frames right before the hit; a 2.5 s `riser` ends exactly where the silence
starts; on the hit an `impact` (0.28–0.45) and a `shing` 2 frames later; an Aurora bloom on the same
frame. Two or three per video.

## Slowing the music under a quiet moment

For a calm "always on" moment (monitors, a heartbeat): `music.slow = { atBeat, seconds, rate }` renders
`music-slow.wav` — the track winding down like a tape (speed 1 → 0.62 over 0.9 s, pitch falling,
dulled) starting on the exact sample the dry stem is at. Pass `slow={{ from, to }}` (frames) to
`Music`: the main stems fade out over 8 frames as it takes over, and come back over the next transition.
Put only a lub-dub (`heart`) on top.

## Making a section longer without breaking the music

When the front of a video must grow but a later section has to stay on its beats (a follow-up edit:
"keep everything after 0:45 as is"), repeat whole groove bars: `music.repeat = { atBeat, beats }` — at
video beat `atBeat` the song jumps back `beats` beats (8 or 16 — whole phrases; choose a point inside a
steady groove). Every later song landmark moves `beats` later, so shift the later items by the same
number of beats. Check a candidate by ear on the click track, or compare the loudness of the bar before
and after.

## Effects and volumes

| Effect | Use | Volume |
|---|---|---|
| `click` | every cursor click | 0.42–0.6 |
| `tick` | KPI tiles, list items, a connect completing | 0.2–0.35 |
| `typing` | under `Typed`, cut to its length | 0.3 |
| `swipe` | each line slide | 0.16 |
| `whoosh` | rare — a card flying, a big section move | 0.2–0.4 |
| `pip1–4` | rising notes for steps, facts, pattern hits | 0.14–0.48 |
| `bloop` | a message / a drop arriving, a failure landing | 0.22–0.38 |
| `ping` | the product messaging the user | 0.3–0.36 |
| `notify` | a notification card arriving | 0.2–0.34 |
| `shimmer` | the mark appearing, a chart drawing, a scan | 0.22–0.35 |
| `riser` / `impact` / `shing` | reveals (above) | 0.26–0.4 / 0.28–0.45 / 0.3 |
| `heart` | monitors, "always on" | 0.4–0.5 |

## Checking and fixing the mix

1. `node scripts/audiocheck.mjs out/<video>.mp4 [from to]` → clipped samples by time and dB per 0.5 s.
   Confirm the silences (≈ −60 dB windows), the dips, the drop.
2. Budget ≲ 15 clipped samples. Fix by lowering **the cue at that timestamp** (riser + impact + music
   stack on loud bars), not the music.
3. Sound-only changes: `node scripts/remux.mjs <Id> out/<video>.mp4` re-renders just the soundtrack,
   swaps it in and refreshes the share copy (minutes, not a full render).
