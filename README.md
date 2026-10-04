# video-generator — a Claude Code skill

Turns a one-line brief into a finished product video: Claude researches the product, plans the story on
the music's beat grid, builds the scenes in [Remotion](https://www.remotion.dev), checks every window
with still frames, renders a 1080p60 MP4, checks the mix and delivers a share copy — in one go.

The house style is baked in: bright, clean UI recreations; a centred line, then the UI doing it; smooth
transitions (slide, zoom-through, liquid melt, shared elements); the brand mark's grow / collapse
reveals; music-driven timing with low/high-tune, silences before reveals and synthesized sound design.

## Install

Personal (all your projects):

```bash
git clone https://github.com/driftal-lokesh/video-generator-skill.git ~/.claude/skills/video-generator
```

Or for one repo (shared with everyone who clones it):

```bash
git clone https://github.com/driftal-lokesh/video-generator-skill.git .claude/skills/video-generator
```

Requirements: Node 18+, Python 3 with Pillow (`pip install pillow`). Remotion fetches its own headless
Chrome on first render.

## Use

Just ask Claude Code, e.g.

- "Make a 60-second launch video for our dashboard feature."
- "Create a 20-second vertical teaser for the mobile app, use public/track.mp3."
- "Re-cut the demo video: slower in the middle, keep the ending as is."

Claude picks the skill up automatically (or run `/video-generator`). Give it your music file if you have
one — the skill never downloads music or sound; without a track the video uses synthesized effects only.

## What's inside

| Path | What |
|---|---|
| `SKILL.md` | The end-to-end pipeline, defaults, the quality bar |
| `references/craft.md` | Story, pacing numbers, copy, look, the mark, privacy, failed patterns, self-review checklist |
| `references/motion.md` | The kit, transition grammar, UI-demo moves, signature reveals, measuring positions |
| `references/audio.md` | Beat grid, stems, silences, slow-downs, repeating bars, effect volumes, fixing the mix |
| `references/pipeline.md` | Setup, commands, versions for follow-up edits, gotchas |
| `references/plan-template.md` | The plan format with a filled example |
| `assets/template/` | A working Remotion project: `src/kit/` (reusable components), `src/videos/example/` (a complete ~40 s example), `scripts/` (sound synthesis, music stems, beat grid, stills, contact sheets, audio check, remux, share copy), `video.config.json` (brand + music in one place) |

Try the template on its own:

```bash
cp -R ~/.claude/skills/video-generator/assets/template my-video && cd my-video
npm install && npm run example        # → out/example.mp4 and out/example-share.mp4
```
