---
name: video-generator
description: Generate a finished, polished product video — demo, promo, launch, teaser, explainer, feature walkthrough or social cut — end to end with Remotion, from a one-line brief to a rendered 1080p60 MP4 with beat-synced music, sound design, smooth transitions and a faithful recreation of the product's UI. Use this whenever the user asks to make, create, generate, edit, re-cut, extend, shorten or re-time a video, animation, promo, trailer, demo reel or motion graphics for a product, app or feature, or mentions Remotion — even if they never say "skill".
---

# Video generator

**One request → one finished video.** Run the whole pipeline yourself — brief, research, plan, build,
check, render, mix, deliver — without stopping for approval. Ask only when you truly cannot proceed
(below). Everything learned from many review rounds is baked into the references and the template, so
the first render should already meet the bar.

## The pipeline

1. **Brief.** From the request (and the repo, if there is one) settle: subject, audience, length,
   format, the moments that must appear, tone, brand, music, names that must not appear. Fill gaps with
   the defaults below and list your assumptions in the final report.
2. **Research the product.** Read what it really does and how it really looks: README/docs, routes and
   UI components, design tokens (CSS variables, Tailwind theme), logo files, screenshots the user gave.
   Pick one plausible scenario (one user, one problem, real-sounding data) and keep it consistent across
   every scene. → references/craft.md
3. **Story and plan.** Build the arc (problem → product → 3–5 things it does → the turn → proof →
   lockup), place every window on the music's beat grid, and write the plan to
   `video/plans/<slug>.md` (template: references/plan-template.md). Don't wait for approval unless the
   user asked to review a plan first.
4. **Project.** If there's no Remotion project, copy `assets/template/` to `video/` (or the folder the
   user names), `npm install`, and set `video.config.json`: brand name, colours from the product's
   tokens, the mark (`markPath`), music. → references/pipeline.md
5. **Music.** If the user supplied a track: `node scripts/beatgrid.mjs public/<track>`, choose the start
   bar, read the loudness map for the drop / breakdown / return, and land the story's turns on bar
   lines. No track → sound effects only (say so in the report). → references/audio.md
6. **Build.** Copy `src/videos/example/` to `src/videos/<slug>/`, keep its shape (a `timeline.ts` of
   beats, one scene file per window, `Video.tsx` with the item list, music envelopes and cues), replace
   the content, register the composition in `src/Root.tsx`. Build from the kit (`src/kit/`) — don't
   reinvent cursor, typing, transitions, the mark, buttons. → references/motion.md
7. **Check with stills, fix, repeat.** `npm run typecheck`; render a still in every window and in the
   middle of every transition; build contact sheets; read them against the checklist in
   references/craft.md; fix and re-check until a pass finds nothing (usually 2–3 passes). Never render
   the full video to find layout bugs — stills take seconds.
8. **Render and mix.** Full render in the background; `audiocheck` (silences, dips, clipping ≤ ~15
   samples); fix a clipping cue's volume and `remux` (audio only); make the share copy.
9. **Deliver.** Send the share copy (and keep the full-quality file), then report: length and format,
   a timestamped list of what's in it, assumptions you made, how you verified it, the files, the
   re-render command, and the two or three things most worth tweaking.

**Follow-up edits** ("make the middle slower", "swap the music", "remove X"): copy the video folder to
a new version (`<slug>-v2`), change only what was asked, keep everything else frame-identical — use the
music repeat to make room (references/audio.md) — then stills → render → deliver as above.

## Ask only when

- you can't tell what product or feature the video is about, or
- the video needs something only the user can supply (their licensed music, a private screenshot)
  and it isn't attached — then ask once, in one message, and offer to proceed without it.

Everything else — length, wording, which features, colours, scenario — decide yourself and state it.

## Defaults

| Item | Default |
|---|---|
| Length | demo/promo 60–90 s · single feature 30–45 s · social 15–30 s |
| Format | 1920×1080, 60 fps, H.264 (vertical social: 1080×1920 — set `width`/`height` in the config) |
| Look | bright and clean, brand colours glowing at the edges, the centre left for content |
| Rhythm | a centred line (2 beats) → the UI doing it (4–14 beats) → the next line |
| Music | the user's track; none supplied → sound effects only. Never download music or sound |
| People | demo user "Alex", colleagues "Priya", "Sam" — never real names, emails or IDs |
| Mark | the product's logo mark as an SVG path; none → the four-point sparkle in the template |

## The bar (every video)

- **A centred line, then the UI that does it.** No headings or captions over UI. Lines are 3–6 words
  with one gradient keyword; the product's name is the subject of hero lines.
- **Real product, real behaviour.** Rebuild the actual UI (layout, labels, components) with the kit;
  show features inside the real surface (a chart or trace inside the chat answer), not as a montage of
  separate sections. Data is plausible and consistent everywhere.
- **Even pacing.** One focus per window; micro-steps ≥ 0.35 beats apart; ≥ 0.5 s of stillness after the
  last thing lands; ~1 s hold after a reveal; the lockup holds ≥ 3 s.
- **Music is the clock.** Every event on `B(beat)`; big moments on bar lines; a short silence before
  each of the 2–3 big reveals; muffle the music while "searching", open it on "found"; sound effects
  are sparse and synthesized.
- **Brand-safe.** Only the brand's colours (no stock success-green unless the brand has it); the mark
  never sits in a tile; small marks stay upright; third-party app marks drawn as SVG; nothing
  downloaded; real names, emails, IDs and tokens never shown (blur them into any image you ship).

## References

| Read when | File |
|---|---|
| Planning the story, pacing, copy, look, privacy, the self-review checklist, past failures | references/craft.md |
| Writing the plan | references/plan-template.md |
| Building scenes: the kit, transitions, UI-demo moves, the mark's signature moves, measuring positions | references/motion.md |
| Music grid, stems, silences, repeats, slow-downs, effects and their volumes, fixing the mix | references/audio.md |
| Setting up, the build/check/render/deliver commands, follow-up versions, gotchas | references/pipeline.md |

The template (`assets/template/`) is a working Remotion project: the kit in `src/kit/`, a complete
~40 s example in `src/videos/example/` that shows every pattern, and the tools in `scripts/`
(`stills`, `sheet.py`, `findred.py`, `audiocheck`, `remux`, `share`, `beatgrid`, `sfx`, `music`).
