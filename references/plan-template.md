# Plan template

Write the plan to `video/plans/<slug>.md` before building. Times come from the beat grid
(`seconds = beat × 60 / bpm`). Keep it in sync with what you build; it goes in the final report.

```markdown
# <Video name> — plan

**Brief**: <what, for whom, where it will be shown>
**Length / format**: <≈ s>, <1920×1080 60 fps>
**Music**: <file, bpm, start bar> — or "sound effects only"
**Scenario**: <user, team, system, the problem; the numbers that recur>
**Assumptions**: <anything decided without asking>

| Time | Beat | Screen | Sound |
|---|---|---|---|
| 0:00 | 0 | Hook line: "<…>" | intro (muffled) |
| 0:04 | 6 | "Meet", the mark grows to fill the screen | riser |
| 0:07.8 | 12 | On the hit the mark collapses into "Meet ✦ <Name>"; holds 1 s | silence → impact |
| 0:09 | 14 | <UI window: what happens, in order> | clicks, typing, pips |
| … | | | |
| 0:34 | 52 | Lockup: ✦ <Name> + "<tagline>", holds ≥ 3 s | silence → impact |

**Unchanged from the last version** (follow-ups only): <what stays frame-identical>
**Not shown** (could add later): <features left out and why>
```

## Filled example — the template's `Example` composition (92 BPM, ~40 s)

| Time | Beat | Screen |
|---|---|---|
| 0:00 | 0 | "Same checks. *Every* morning." |
| 0:04 | 6 | "Meet" + the mark appears, grows until it is the screen |
| 0:07.8 | 12 | Silence → hit: the mark collapses into "Meet ✦ Acme" (1 s hold) |
| 0:09 | 14 | Chat: type "Why did the nightly sync fail?" → Thoughts (3) → streamed answer → run trace inside it (camera leans in; the run arrives empty, Import stops) → "Grounded in run logs · 92" |
| 0:16 | 25 | "Ask for a *dashboard.*" |
| 0:17.6 | 27 | Dashboard: 4 KPI tiles count up, runs-vs-failures chart draws |
| 0:21.5 | 33 | "Connect your *tools.*" |
| 0:22.8 | 35 | Notion, Slack, Teams connect in turn; SAP stays one click away |
| 0:26 | 40 | "Most tools wait for you." (quiet) → silence |
| 0:28.7 | 44 | Hit: "✦ Acme talks first." → the mark grows into Home: Acme's message, an approval card (also in Teams) → Approved → "Token renewed" |
| 0:33.9 | 52 | Silence → hit: lockup "✦ Acme" + "Your assistant. It talks first." (holds ~5 s) |
