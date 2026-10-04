// Music stems from the track in video.config.json → public/sfx/:
//   music-dry.wav      the track (with the optional repeat spliced in)
//   music-muffled.wav  the same, low-passed — crossfade to it for "low tune", back for "high tune"
//   music-slow.wav     optional tape wind-down for a quiet moment (music.slow)
// All three are sample-aligned with video frame 0 = song time `music.start`, so the Music component
// plays them with the same offset. No track configured → nothing to do (the video uses sfx only).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { OUT, SR, TAU, writeWav } from './dsp.mjs';

const cfg = JSON.parse(readFileSync(new URL('../video.config.json', import.meta.url), 'utf8'));
const m = cfg.music;
if (!m.file) {
  console.log('music.file is null in video.config.json — no music stems (sound effects only).');
  process.exit(0);
}
mkdirSync(OUT + 'sfx', { recursive: true });
const BEAT = 60 / m.bpm;

// one decode, so every stem stays sample-aligned
const tmp = OUT + 'sfx/.music-decode.wav';
execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-v', 'error', '-i', OUT + m.file, '-ac', '2', '-ar', String(SR), '-c:a', 'pcm_s16le', tmp], { stdio: 'inherit' });
function readWav(path) {
  const buf = readFileSync(path);
  let p = 12;
  while (buf.toString('ascii', p, p + 4) !== 'data') p += 8 + buf.readUInt32LE(p + 4);
  const len = buf.readUInt32LE(p + 4) / 4;
  const b = { n: len, L: new Float32Array(len), R: new Float32Array(len), send: new Float32Array(0) };
  for (let i = 0; i < len; i++) { b.L[i] = buf.readInt16LE(p + 8 + i * 4) / 32768; b.R[i] = buf.readInt16LE(p + 10 + i * 4) / 32768; }
  return b;
}

/** RBJ low-pass biquad (Remotion's ffmpeg has no lowpass filter). */
function lowpass(x, fc, passes = 1) {
  const w = (TAU * fc) / SR, a = Math.sin(w) / (2 * 0.707), c = Math.cos(w);
  const b0 = (1 - c) / 2 / (1 + a), b1 = (1 - c) / (1 + a), a1 = (-2 * c) / (1 + a), a2 = (1 - a) / (1 + a);
  for (let pass = 0; pass < passes; pass++) {
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) {
      const y = b0 * x[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x[i]; y2 = y1; y1 = y; x[i] = y;
    }
  }
}

/**
 * music.repeat = { atBeat, beats }: at video beat `atBeat` the song jumps back `beats` beats, so the
 * video gets that much more groove and every later landmark of the song moves `beats` beats later.
 * Use whole phrases (8 or 16 beats) inside a steady groove; the cut sits 12 ms before the bar line
 * with a 10 ms equal-power fade.
 */
function repeat(b) {
  if (!m.repeat) return b;
  const cut = Math.round((m.start + m.repeat.atBeat * BEAT - 0.012) * SR);
  const back = Math.round(m.repeat.beats * BEAT * SR);
  const fade = Math.round(0.01 * SR);
  const o = { n: b.n + back, L: new Float32Array(b.n + back), R: new Float32Array(b.n + back), send: new Float32Array(0) };
  for (const ch of ['L', 'R']) {
    o[ch].set(b[ch].subarray(0, cut));
    o[ch].set(b[ch].subarray(cut - back), cut);
    for (let k = 0; k < fade; k++) {
      const t = k / fade;
      o[ch][cut + k] = b[ch][cut + k] * Math.cos((t * Math.PI) / 2) + b[ch][cut - back + k] * Math.sin((t * Math.PI) / 2);
    }
  }
  return o;
}

const dry = repeat(readWav(tmp));
rmSync(tmp);
writeWav('sfx/music-dry.wav', dry);

const muffled = { n: dry.n, L: dry.L.slice(), R: dry.R.slice(), send: new Float32Array(0) };
lowpass(muffled.L, m.muffleHz ?? 420, 2);
lowpass(muffled.R, m.muffleHz ?? 420, 2);
for (let i = 0; i < muffled.n; i++) { muffled.L[i] *= 1.5; muffled.R[i] *= 1.5; }
writeWav('sfx/music-muffled.wav', muffled);

/**
 * music.slow = { atBeat, seconds, rate }: from video beat `atBeat` the track winds down like a tape
 * (speed 1 → rate over 0.9 s, pitch falls with it) and dulls. Starts on the exact sample the dry stem
 * is at, so the crossfade into it is seamless.
 */
if (m.slow) {
  const from = (m.start + m.slow.atBeat * BEAT) * SR;
  const len = Math.round((m.slow.seconds ?? 7) * SR);
  const end = m.slow.rate ?? 0.62;
  const slow = { n: len, L: new Float32Array(len), R: new Float32Array(len), send: new Float32Array(0) };
  let pos = from;
  for (let i = 0; i < len && pos + 1 < dry.n; i++) {
    const t = Math.min(1, i / (0.9 * SR));
    const rate = 1 - (1 - end) * (1 - (1 - t) ** 3);
    const k = Math.floor(pos), fr = pos - k;
    slow.L[i] = dry.L[k] * (1 - fr) + dry.L[k + 1] * fr;
    slow.R[i] = dry.R[k] * (1 - fr) + dry.R[k + 1] * fr;
    pos += rate;
  }
  lowpass(slow.L, 1400);
  lowpass(slow.R, 1400);
  writeWav('sfx/music-slow.wav', slow);
}
console.log(`music stems → public/sfx/ (${m.file}, ${m.bpm} BPM, start ${m.start}s${m.repeat ? `, +${m.repeat.beats} beats at ${m.repeat.atBeat}` : ''}${m.slow ? `, slow at beat ${m.slow.atBeat}` : ''})`);
