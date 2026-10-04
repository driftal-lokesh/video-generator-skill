// Sound: the music stems (open / muffled / slowed, from scripts/music.mjs) under envelopes, and cues.
import React from 'react';
import { Audio, Sequence, interpolate, staticFile } from 'remotion';
import { CONFIG, S } from './config';
import { clamp } from './motion';

/** A piecewise-linear envelope from [frame, value] points. */
export const env = (pts: [number, number][]) => (f: number) => interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[1]), clamp);

/** Every effect scripts/sfx.mjs renders. */
export const SFX = {
  click: 'click', tick: 'tick', typing: 'typing', swipe: 'swipe', whoosh: 'whoosh', notify: 'notify', shing: 'shing',
  riser: 'riser', impact: 'impact', ping: 'ping', shimmer: 'shimmer', bloop: 'bloop', heart: 'heart',
  pip1: 'pip1', pip2: 'pip2', pip3: 'pip3', pip4: 'pip4',
} as const;
export type Sfx = keyof typeof SFX;
/** [frame, effect, volume, frames?] — `frames` cuts a long effect (typing) to the action's length. */
export type Cue = [number, Sfx, number, number?];

export const Cues: React.FC<{ cues: Cue[] }> = ({ cues }) => (
  <>
    {cues.map(([from, name, volume, frames], i) => (
      <Sequence key={i} from={from} durationInFrames={frames} layout="none">
        <Audio src={staticFile(`sfx/${SFX[name]}.wav`)} volume={volume} />
      </Sequence>
    ))}
  </>
);

/**
 * The track. `gain` = overall level (0 for a silence before a reveal), `muffle` = 0 open … 1 muffled
 * ("low tune"). `slow` = the frame window where the tape wind-down takes over (needs music.slow).
 * Renders nothing when video.config.json has no music file.
 */
export const Music: React.FC<{ gain: (f: number) => number; muffle?: (f: number) => number; slow?: { from: number; to: number; level?: number } }> = ({ gain, muffle = () => 0, slow }) => {
  if (!CONFIG.music.file) return null;
  const start = S(CONFIG.music.start);
  const away = (f: number) => (slow ? interpolate(f, [slow.from, slow.from + 8, slow.to, slow.to + 24], [1, 0, 0, 1], clamp) : 1);
  return (
    <>
      <Audio src={staticFile('sfx/music-dry.wav')} trimBefore={start} volume={(f) => gain(f) * away(f) * (1 - muffle(f))} />
      {/* the muffled stem keeps all the bass, so it plays lower to read as a dip, not a boost */}
      <Audio src={staticFile('sfx/music-muffled.wav')} trimBefore={start} volume={(f) => gain(f) * away(f) * muffle(f) * 0.55} />
      {slow && CONFIG.music.slow && (
        <Sequence from={slow.from} durationInFrames={slow.to + 30 - slow.from} layout="none">
          <Audio src={staticFile('sfx/music-slow.wav')} volume={(f) => interpolate(f, [0, 8, 90, slow.to - slow.from, slow.to - slow.from + 24], [0, 1, 0.8, 0.8, 0], clamp) * (slow.level ?? 0.7)} />
        </Sequence>
      )}
    </>
  );
};
