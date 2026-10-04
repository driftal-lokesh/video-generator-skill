# Pipeline — commands, from nothing to a delivered file

## Contents
- Requirements
- Set up a project
- Configure the brand and music
- Make a new video
- Check with stills
- Render, mix, share
- Deliver and report
- Follow-up edits (versions)
- Gotchas

## Requirements

Node 18+ (Remotion downloads its own headless Chrome on first render), Python 3 with Pillow
(`pip install pillow`) for contact sheets and probes. macOS / Linux shells assumed; on zsh split a list
variable with `${=FR}`.

## Set up a project

If the user's repo has no Remotion project yet:

```bash
cp -R <skill>/assets/template video        # or the folder the user wants
cd video && npm install
npm run audio                              # synthesize sound effects (+ music stems if configured)
npm run typecheck
npm run studio                             # optional: scrub the timeline in Remotion Studio
```

Keep renders out of git (`out/`, `public/sfx/` are in the template's `.gitignore`). If the parent repo
shouldn't track the video project at all, add `video/` to its `.gitignore` and say so.

## Configure the brand and music

`video.config.json` is read by both the React code and the audio scripts — the only place to set:

- `brand.name`, `brand.tagline`, `brand.user` (demo user), `brand.colors` (map the product's real
  tokens: primary, secondary, accent, tint…; keep `warn`/`danger` for status), `brand.markPath` (the
  logo mark as an SVG path in a 0–100 box; keep the sparkle if there's no mark).
- `music.file` (in `public/`), `music.bpm`, `music.start` (song seconds of the bar line where the video
  starts), optional `music.repeat` and `music.slow`. Then `npm run audio` again.
- `width`/`height`/`fps` for other formats (1080×1920 vertical; re-check every layout).
- Font: swap the `@remotion/google-fonts/...` import in `src/kit/type.tsx`.

## Make a new video

```bash
cp -R src/videos/example src/videos/<slug>
```

1. `timeline.ts` — the plan's beats (`AT`) and `DURATION`.
2. One scene file per window, built from `src/kit/`; constants are `B(...)`; keep the example's
   patterns (cursor per window, `Camera` clicks, lean-in for detail, shared elements).
3. `Video.tsx` — the item list (line slides via `line(text, beat)`, scenes with `toLine` / `toUi` /
   `melt` / none), the music envelopes (`gain` with silences, `muffle`), the cue list, the Aurora acts.
4. Register `<Composition id="<Name>" …>` in `src/Root.tsx`.
5. `npm run typecheck` after every few edits.

## Check with stills

```bash
FR=$(node -e "const B=b=>Math.round(b*60/<bpm>*60);console.log([14.5,18,21.5,25.6].map(B).join(' '))")
node scripts/stills.mjs <Name> $FR          # half-size JPEGs → out/stills/   (zsh: ${=FR})
python3 scripts/sheet.py $FR                 # 6 per sheet → out/stills/sheet<N>.jpg
```

Pick, per window: just after it lands, its busiest moment, its last readable moment; plus the middle of
every transition. Open each sheet and run the checklist (craft.md). Fix, re-render those stills, repeat
until a pass is clean. Measure positions with `findred.py` when an effect needs them (motion.md).

## Render, mix, share

```bash
npx remotion render <Name> out/<slug>.mp4      # run in the background; wait for its exit, don't poll
node scripts/audiocheck.mjs out/<slug>.mp4      # clipping by time + dB per 0.5 s
node scripts/remux.mjs <Name> out/<slug>.mp4    # only after sound-only fixes; also refreshes the share copy
node scripts/share.mjs out/<slug>.mp4           # CRF 21 copy → out/<slug>-share.mp4 (~25 MB per 90 s)
```

Render settings live in `remotion.config.ts` (H.264 CRF 14, slow preset, yuv420p, bt709, AAC 320k).

## Deliver and report

- Send the **share copy** (file-sharing to phones/web usually caps around 30 MB); keep the full file.
- Report, leading with the result: length and format; a timestamped list (one line per window); the
  assumptions you made (scenario, length, music); how you verified (stills passes, audio check — don't
  claim you watched it); the files; the re-render command; 2–3 suggested tweaks.
- Keep the plan file (`video/plans/<slug>.md`) in sync with what you built.

## Follow-up edits (versions)

- `cp -R src/videos/<slug> src/videos/<slug>-v2`, register `<Name>V2`; never edit a delivered version's
  files — the user may compare.
- Shared kit changes: add an optional prop whose default keeps old renders identical.
- Change only what was asked. To keep a later section frame-identical while an earlier part changes
  length, offset the later items and use `music.repeat` (audio.md).
- Sound-only change → `remux`. Visual change → stills → render.

## Gotchas

- A CSS `filter`/`transform` makes an element the containing block for its absolute children — a
  zero-size wrapper then collapses them. Give such wrappers `position:absolute; inset:0`.
- Flex children collapse spaces between words → render a line as one `white-space: pre` span (`Line`).
- Rolling/sliding text in and out must share one easing or lines overlap mid-move.
- Two scenes cross-fading double-expose → stagger (exit done by ~60 %, enter after ~40 %).
- `background-clip: text` doesn't reliably clip positioned/transformed children — keep gradient words
  plain spans; lay effects (the mark) in a separate positioned slot.
- Remotion's bundled ffmpeg lacks `lowpass`, `rawvideo`, `hstack`/`vstack`, `drawtext` — DSP is done in
  JS (`dsp.mjs`), sheets and probes in Pillow.
- `remotion render --codec wav` fails on the config's CRF → audio-only renders go through the Node API
  (`remux.mjs` does this).
- Huge SVG drop-shadows (marks > ~1600 px) are very slow → glow off at that size (the kit does).
- Duplicate SVG gradient ids across components are fine only if identical; give unique `id`s to marks
  whose look differs.
- Remotion `Sequence` with a negative `from` is how `Abs` shows a scene from its absolute frame — keep
  scene constants absolute (`B(...)`), never "frames since this item started".
- Always wait for a background render's completion notice; never poll with sleep.
