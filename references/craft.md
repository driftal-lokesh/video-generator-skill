# Craft — story, pacing, copy, look

The standards behind every video. Each rule here came from a real review note on a shipped video.

## Contents
- Story
- Pacing (numbers)
- Copy
- Look
- The mark
- Privacy and brand safety
- Patterns that failed review
- Self-review checklist (run it on every contact sheet)

## Story

- **Arc**: the problem (a repeated, felt pain) → meet the product → 3–5 things it does, each one moment →
  **the turn** (what makes it different, set up by a contrast line) → proof (trust, reach) → a short
  recap → the lockup (mark + name + tagline). Short cuts keep: hook → one moment → the turn → lockup.
- **Solve something on screen.** Each UI window answers a question the viewer has; the next line asks
  the next one.
- **One scenario** for the whole video: one user (Alex), one team, one system, numbers that add up and
  repeat correctly across scenes (the failure in the chat is the one on the dashboard and the one the
  product later fixes).
- **Plausible domain detail**: real error text, real step names, realistic volumes. An invented
  "insight" must make sense (a weekly job failing right after the weekly backup — not certificates that
  expire every week). If you explain a technical cause, it must be correct.
- **Show the real product.** Read its components and tokens and rebuild them — same layout, labels,
  controls, empty states. A generic mock reads as fake.
- **Features live where they live in the product.** If the product answers in a chat, the chart, the
  trace or the screenshot analysis appears *inside that answer*, not as a separate titled section.
- **Shared elements carry the story** between moments (a card shrinks into a dot that seeds the next
  scene; a line in a message stretches into the notification card) — see motion.md.

## Pacing (numbers)

Work in beats of the music (`B(beat)`), 4 beats a bar.

| Thing | Length |
|---|---|
| A line slide (incl. its 24-frame slide-in) | 2 beats (~1.3 s at 92 BPM) |
| A quiet set-up line before a turn | 2.5–3.5 beats, ending in a short silence |
| A UI window | 4–14 beats, **one focus**; rich moments get more, confirmations less |
| Micro-steps (thought steps, tiles, list items, connects) | ≥ 0.35 beats apart (never 3 in 0.4 s) |
| Stillness after the last element lands | ≥ 0.5 s before the transition starts |
| Hold after a reveal | ~1 s |
| Reading time | ≥ 0.25 s per word on screen at once |
| Lockup hold | ≥ 3 s, ending the video |

- Big moments on bar lines (multiples of 4 beats): the name reveal, the turn, the lockup.
- At most 2–3 "silence → hit" moments per video, or they stop landing.
- If something feels "too fast here, too slow there", tabulate each window's beats and events and fix
  the outliers — never scale everything.
- The ending breathes more than the middle.

## Copy

- Lines: 3–6 words, one idea, one gradient keyword (`*word*`): "Ask for a *dashboard.*", "Pin it.
  *Share* it.", "Connect your *tools.*"
- Hero lines name the product: "Every message teaches *Acme.*", "✦ Acme talks first." — not "it".
- Set up the turn by contrast: "Most tools wait for you." (quiet, muted) → silence → the turn on the hit.
- **No headings or captions over UI.** A line is its own slide; the UI that follows is wordless except
  for its own labels.
- UI copy is real product copy: short, specific, plain.

## Look

- **Bright and clean** unless the brand is dark-first. Canvas near-white, surfaces white, the colour in
  the edges (`Aurora`, a palette per act, a bloom on each big hit); keep the centre calm.
- **Brand colours only** — from `video.config.json` (`C.*` tokens). Status colours (`warn`, `danger`)
  only for status. Don't introduce a success-green the brand doesn't use; "done" is the brand gradient.
- **Type** (Inter by default; swap the import in `src/kit/type.tsx` for the brand font):

| Use | Size / weight |
|---|---|
| Hero name ("Meet ✦ Acme") | 150 / 650 |
| Hero line ("✦ Acme talks first.") | 130 / 650 |
| Line slide (`Title`) | 112 / 650 |
| Quiet line (`Title quiet`) | 84 / 400, muted |
| UI body / replies | 22–28 |
| UI labels, chips | 16–21 — nothing under ~15 px at 1080p |

- Surfaces: `Window` for app windows (white, radius 30, brand-tinted shadow), `glass()` for floating
  panels; full-screen boards when the content is the point (a dashboard is shown big, not as a small
  overlay on a blurred window).
- Third-party apps (Teams, Slack, Notion, SAP…): real marks drawn as SVG in official colours with the
  name beside them (`src/kit/logos.tsx`). Never download logo files.

## The mark

- The product's mark (`brand.markPath`) or the default four-point sparkle: white body, faint tint at the
  tips, a thin gradient rim, a soft brand glow.
- **Nothing behind it** — no tile, button, circle or badge.
- In lockups and hero lines it sits **in front of the name** ("✦ Acme"), not as a letter's dot.
- In a chat UI the product's messages show its **name + "AI" tag only** — no mark beside the name.
- **Small marks stay upright** (`spin` off): a concave star turned ~45° reads as a hollow square. A hero
  mark may turn slowly but should **land upright** (`rot = (f − landFrame) × 0.3`); a held lockup mark
  sways a few degrees, it doesn't spin.
- Signature moves: it grows until it *is* the screen and the next UI appears inside its shape; the
  screen-filling mark collapses into its slot beside the name on the hit (motion.md).

## Privacy and brand safety

- Never show a name the user hasn't approved — their company, customers, real people — nor real emails,
  message/transaction IDs, tokens, tenant URLs. Invent neutral ones (Alex, "Partner API",
  "nightly-sync").
- A screenshot the user gives: show it, but blur IDs/emails **into the pixels** (Pillow `GaussianBlur`
  on the region) before it goes into `public/` — an overlay alone still ships the raw value in the file.
- Don't copy another company's UI or brand beyond integration marks.

## Patterns that failed review (avoid)

| Tried | Why it failed → do instead |
|---|---|
| Captions at the top while the UI plays | crowded, nothing reads → line slide, then wordless UI |
| A separate titled section per feature (screenshot, explainer, montage) | feels like a slideshow → show it inside the real surface |
| Mark inside a tinted tile / button | looks like an app icon, not the brand → bare mark |
| Mark as the dot of a letter | gimmicky, hard to read → mark in front of the name |
| Mark beside the product name in every chat message | noisy → name + "AI" tag |
| Small marks spinning | read as hollow squares → upright |
| Stock green for success | off-brand → brand gradient |
| A whoosh on every transition (esp. into a quiet scene) | cheap → whooshes rare; quiet hand-offs silent |
| Beeps over a heartbeat | busy → just the lub-dub |
| A board shown small over a blurred window | unreadable → full screen |
| An extra explainer line right after the name reveal | slows the open → go straight into the product |
| Dense bursts (3+ things in half a second) and long idle holds | uneven → one focus per window, even rhythm |
| Implausible invented patterns or wrong technical causes | breaks trust with expert viewers → plausible and correct |
| End text cut before it can be read | → hold the lockup ≥ 3 s |

## Self-review checklist (every contact sheet)

- [ ] Each window has one focus; nothing important is clipped, wrapped badly or overlapping.
- [ ] All text ≥ ~15 px at 1080p; each line slide has exactly one gradient keyword.
- [ ] No captions over UI; UI labels are real product copy.
- [ ] Brand colours only; status colours only for status.
- [ ] Marks: no tile, small ones upright, hero ones land upright, none beside the name in chat.
- [ ] No real names / emails / IDs / company names that weren't approved; screenshots blurred in-pixel.
- [ ] Mid-transition frames aren't empty (a line's words start rising as its slide starts).
- [ ] No cursor left parked from a previous window; clicks land on their targets.
- [ ] The scenario's numbers and names match across scenes.
- [ ] Timing: last element + 0.5 s ≤ next transition; reveals hold ~1 s; lockup ≥ 3 s.
