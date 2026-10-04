// The example video, end to end: a list of items (line → UI → line → UI…), the music under envelopes,
// and the sound cues. Copy this folder to start a new video; keep the shape, change the content.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { B, C } from '../../kit/config';
import { type Cue, Cues, Music, env } from '../../kit/sound';
import { Aurora, LiquidDefs, type Act } from '../../kit/surfaces';
import { Timeline, type Item } from '../../kit/timeline';
import { toLine, toUi } from '../../kit/transitions';
import { FONT, Title } from '../../kit/type';
import { CLICK, Chat, HIT, SEND, STEPS, TRACE, TYPE } from './scenes/Chat';
import { CHART, Dashboard, TILES } from './scenes/Dashboard';
import { LOCK, Lockup } from './scenes/Lockup';
import { MARK_IN, NAME, Reveal } from './scenes/Reveal';
import { APPROVE, CARD, DONE, GROW, MESSAGE, TalksFirst, TYPING } from './scenes/TalksFirst';
import { CONNECTS, Tools } from './scenes/Tools';
import { AT, DURATION } from './timeline';

/** A centred line slide; its words start rising as the slide starts. */
const line = (text: string, at: number, quiet?: boolean, lead = 24): React.FC => {
  const L: React.FC = () => <Title text={text} at={B(at) - lead} quiet={quiet} />;
  return L;
};

const ITEMS: Item[] = [
  { at: AT.hook, C: line('Same checks. *Every* morning.', AT.hook, false, -6) },
  { at: AT.reveal, C: Reveal, enter: toLine },
  { at: AT.chat, C: Chat, enter: toUi },
  { at: AT.tDash, C: line('Ask for a *dashboard.*', AT.tDash), enter: toLine },
  { at: AT.dash, C: Dashboard, enter: toUi },
  { at: AT.tTools, C: line('Connect your *tools.*', AT.tTools), enter: toLine },
  { at: AT.tools, C: Tools, enter: toUi },
  { at: AT.tWait, C: line('Most tools wait for you.', AT.tWait, true), enter: toLine },
  { at: AT.first, C: TalksFirst }, // hard cut on the hit, after a silence
  { at: AT.lockup, C: Lockup }, // hard cut on the hit, after a silence
];

// ── music: muffled intro that opens before the name; a short silence before each hit ─────────────
const TOP = 0.7;
const silence = (beat: number): [number, number][] => [[B(beat) - 19, TOP], [B(beat) - 18, 0], [B(beat) - 1, 0], [B(beat), TOP]];
const gain = env([[0, 0], [14, 0.55], [B(AT.reveal), 0.6], ...silence(12), ...silence(AT.first), ...silence(AT.lockup), [DURATION - 30, TOP], [DURATION, 0]]);
const muffle = env([[0, 1], [B(AT.reveal + 2), 1], [B(11), 0]]);

// ── sound: one cue per meaningful event ──────────────────────────────────────────────────────────
const LINES = ITEMS.filter((x) => x.enter === toLine).map((x) => B(x.at) - 24);
const RISER = 150; // riser.wav is 2.5 s; it ends where the silence starts
const CUES: Cue[] = [
  ...LINES.map((f): Cue => [f, 'swipe', 0.16]),
  [MARK_IN, 'shimmer', 0.3],
  [B(12) - 18 - RISER, 'riser', 0.3, RISER],
  [NAME, 'impact', 0.45],
  [NAME + 2, 'shing', 0.3],
  [CLICK, 'click', 0.5],
  [TYPE[0], 'typing', 0.3, TYPE[1] - TYPE[0]],
  [SEND, 'click', 0.5],
  ...STEPS.map((s, i): Cue => [s, i === 0 ? 'pip1' : i === 1 ? 'pip2' : 'pip3', 0.2]),
  [TRACE, 'shimmer', 0.22],
  [HIT, 'bloop', 0.3],
  ...TILES.map((t): Cue => [t, 'tick', 0.26]),
  [CHART[0], 'shimmer', 0.28],
  ...CONNECTS.flatMap((c): Cue[] => [[c, 'click', 0.5], [c + 24, 'tick', 0.3]]),
  [B(AT.first), 'impact', 0.3],
  [GROW[0], 'shing', 0.3],
  [TYPING, 'bloop', 0.22],
  [MESSAGE, 'ping', 0.34],
  [CARD, 'notify', 0.3],
  [APPROVE, 'click', 0.55],
  [APPROVE + 4, 'bloop', 0.34],
  [DONE, 'ping', 0.3],
  [B(AT.lockup) - 18 - RISER, 'riser', 0.26, RISER],
  [LOCK, 'impact', 0.28],
  [LOCK + 2, 'shing', 0.32],
];

// ── edge colour per act; the light blooms on the three hits ──────────────────────────────────────
const ACTS: Act[] = [
  [0, ['#BFDDFF', '#D6DEF0', '#C7D2FE', '#DCE7FF', '#C9E6FF'], 0.55],
  [B(12), [C.primary, C.secondary, C.sky, '#F0ABFC', '#A5B4FC'], 0.7],
  [B(AT.tTools), [C.sky, C.secondary, '#A5B4FC', '#F0ABFC', C.primary], 0.68],
  [B(AT.first), [C.pink, C.peach, '#F0ABFC', C.secondary, '#FDA4AF'], 0.75],
  [B(AT.lockup), [C.primary, C.pink, C.peach, C.sky, C.secondary], 0.88],
  [DURATION, [C.primary, C.pink, C.peach, C.sky, C.secondary], 0.88],
];

export const Example: React.FC = () => (
  <AbsoluteFill style={{ background: C.canvas, fontFamily: FONT }}>
    <LiquidDefs />
    <Aurora acts={ACTS} blooms={[NAME, B(AT.first), LOCK]} />
    <Timeline items={ITEMS} duration={DURATION} />
    <Music gain={gain} muffle={muffle} />
    <Cues cues={CUES} />
  </AbsoluteFill>
);
