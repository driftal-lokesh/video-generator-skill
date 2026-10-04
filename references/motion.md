# Motion — the kit and how things move

Build with `src/kit/`; extend it (an optional prop whose default keeps old behaviour) rather than
writing one-off copies in a scene.

## Contents
- The timeline model
- Kit map
- Transition grammar
- Lines
- UI-demo moves
- The mark's signature moves
- Liquid touches
- Measuring a position for an effect

## The timeline model

- `B(beat)` = absolute frame of a beat on the music grid (`src/kit/config.ts`, from `music.bpm`).
  Place **every** event with it; keep a video's beats in its `timeline.ts` (`AT = { chat: 14, … }`).
- A video is a list of items (`Timeline` in `src/kit/timeline.tsx`): `{ at, C, enter }`. `at` = the
  beat the item is fully on screen; its transition starts `lead` frames earlier; each item runs until
  the next one is fully in.
- Scenes work in **absolute frames** (the Timeline wraps each in `Abs`). One scene component can be
  several items — e.g. a chat window that appears, gives way to a line slide, and returns later with its
  state continued — because its constants are absolute.
- Scene-local helper: `const K = (beats: number) => B(AT.chat + beats)`.

## Kit map

| File | What's in it |
|---|---|
| `config.ts` | `CONFIG`, `FPS`, `W`/`H`, `BRAND`, colours `C`, `S(sec)`, `B(beat)`, `GRAD`, `BTN`, `DONE_FILL`, `SHADOW` |
| `motion.tsx` | `ease`, `clamp`, `OUT_EXPO`, `IN_OUT`, `Abs`, `lift`/`press` (hover + press on a target), `Camera` (3 % punch toward clicks), `Cursor` |
| `type.tsx` | `FONT`, `type(size, weight, color)`, `Grad`, `Line`, `Title` (line slide), `Typed` (typewriter), `Stream` (streamed answer) |
| `surfaces.tsx` | `Aurora` (edge colour by act + blooms), `Window`, `glass()`, `LiquidDefs` (goo filter) |
| `mark.tsx` | `Mark` (inline), `MarkAt` (any size at a point), `BigMark` (full-frame), `MarkReveal` (UI inside the mark), `growMark`, `shrinkMark` |
| `ui.tsx` | `Dot`, `Chip`, `UserBubble`, `Reply`, `Composer`, `Thoughts`, `Confidence`, `LiquidButton`, `ConnectButton`, `TypingDots`, `Kpi`, `count` |
| `transitions.tsx` | `through()`, `liquid()`, presets `toLine`, `toUi`, `melt` |
| `sound.tsx` | `env`, `Music` (stems + envelopes + slow-down), `Cues`, `SFX` |
| `logos.tsx` | `TeamsLogo`, `SlackLogo`, `NotionLogo`, `SapLogo` (add more the same way) |
| `timeline.tsx` | `Timeline`, `Item` |

## Transition grammar

| Into | Use | Why |
|---|---|---|
| a line slide | `toLine` — slide from the right, spring, 24 frames | "next slide" |
| UI after a line | `toUi` — `through()`: the words rush past the camera and blur away, the UI rises out of depth; 22 frames | diving into the product |
| a new section / place | `melt` — `liquid()` displacement melt, 24 frames | change of place |
| a reveal after a silence | no transition (hard cut) | the hit does the work |
| a continuing story | a **shared element**, no transition | the eye follows one object |

Shared-element ideas that worked: a card shrinking into a dot that becomes the first cell of the next
scene; a line in a message stretching into a notification card and folding back when it's done; a
dashboard flying from a preview pane into its slot on a full-screen board at the same size; the mark
growing into the next window.

## Lines

`Title` — centred; the words rise out of a mask (translateY 105 % → 0, blur 6 → 0), 4-frame stagger,
24 frames each, a slow push 1 → 1.04. Pass `at` = the frame its slide starts (`B(beat) − 24`) so words
arrive while the slide lands (no empty frame). `quiet` for set-up lines.

## UI-demo moves

- **Cursor**: one per window, enters from off-screen ~35 frames before its first click, arcs between
  targets, press ring on each click, fades after the last. Targets `lift` and `press` on the click frame;
  wrap the window in `Camera clicks` for the 3 % punch-in.
- **Lean in** to make a detail readable: scale the window ~1.25 around the detail while it plays, only
  inside that window (example: the run trace).
- **Typing**: `Typed`, `cpf = text.length / frames`, a sentence in 1–1.5 beats; one `typing` cue cut to
  the same length.
- **Answer**: `Thoughts` (steps tick in ~0.35 beats apart, then fold) → `Reply` with `Stream` (words
  1.6–2.4 frames apart, key words in the brand colour) → a result card inside the reply → `Confidence`.
- **A process/trace/flow** inside an answer: steps pop in as their arrow arrives (SVG markers for
  arrowheads), then one run-dot travels the flow; tags pop above steps; the failing step flashes
  `danger` with a shake and a ring; a downstream arrow dims; a fix callout.
- **Approval**: `LiquidButton` floods with the brand gradient from the click point → "✓ Approved".
- **Connect**: `ConnectButton` → spinner (24 frames) → "✓ Connected" pill; connect 2–3 in turn.
- **Numbers & charts**: values `count` up over 40 frames; charts draw left → right through a clip rect;
  rows slide in 6 frames apart; KPI tiles rise in ~0.35 beats apart.
- **Chat growth**: when content outgrows the window, scroll the column up under a top mask-fade.
- **Files dragged in**: big and readable while moving, shrink into a composer chip; the composer shows a
  dashed drop zone meanwhile.
- **Heartbeat / monitors**: all traces share one phase so a single lub-dub lands on every spike; a
  glowing dot rides the head of each trace.

## The mark's signature moves

- **Grow into the next window**: `growMark(f, [a, b], from)` for the size (exponential, reads as a
  constant speed); `MarkReveal` shows the next UI inside the mark's shape with its gradient rim; a
  white `BigMark` fades over the first 18 frames; move the centre to the screen centre while growing.
- **Collapse into the name**: on the reveal frame swap to a `MarkAt` inside a fixed-width slot beside
  the name, sized `shrinkMark(f, [hit, hit + 36], final)` — 14000 px covers the frame, so the switch from
  the growing mark is invisible.
- `BigMark` is one full-frame SVG scaled inside its viewBox — cheap at any size; glows switch off above
  ~1600 px (a huge drop-shadow is very slow).
- Twinkle: ±4–5 % scale on `sin(f / 14)` (built in).

## Liquid touches

`LiquidDefs` + `filter: url(#goo)` melts shapes into each other (typing dots, drops falling into a bar);
`liquid()` for section changes; `glass()` panels over the aurora. Use liquid moments at the open and at
section changes; the product UI itself stays crisp.

## Measuring a position for an effect

When an effect needs the absolute position of something laid out by text (the mark beside a word that
later grows into a window — `MARK` in the example's `TalksFirst.tsx`):

1. Temporarily render a 6×6 `#FF0000` square at the anchor (`position:absolute; left:-3; top:-3`).
2. `node scripts/stills.mjs <Id> <frame> --png` at a frame after the line has landed.
3. `python3 scripts/findred.py out/stills/f<frame>.png` → `x=… y=…`.
4. Put the marker back, hardcode the numbers with a comment, re-measure if the line or font changes.
