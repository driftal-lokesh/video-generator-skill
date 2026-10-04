// Audio check for a render: node scripts/audiocheck.mjs out/video.mp4 [fromSec toSec]
// Prints clipped samples (|x| > 0.98) grouped by 0.1 s and loudness (dB RMS) per 0.5 s, so you can
// see the silences, dips and drops you meant to make — and which cue clips.
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';

const [input, from = '0', to = '9999'] = process.argv.slice(2);
if (!input) throw new Error('usage: node scripts/audiocheck.mjs <file.mp4|wav> [fromSec toSec]');
const tmp = new URL('../out/.audiocheck.wav', import.meta.url).pathname;
execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-v', 'error', '-i', input, '-vn', '-ac', '2', '-ar', '44100', '-c:a', 'pcm_s16le', tmp]);
const b = readFileSync(tmp);
rmSync(tmp);
let p = 12;
while (b.toString('ascii', p, p + 4) !== 'data') p += 8 + b.readUInt32LE(p + 4);
const n = b.readUInt32LE(p + 4) / 4, SR = 44100;
const sample = (i, c) => b.readInt16LE(p + 8 + i * 4 + c * 2) / 32768;
const clips = {};
let total = 0;
for (let i = 0; i < n; i++) {
  if (Math.abs(sample(i, 0)) > 0.98 || Math.abs(sample(i, 1)) > 0.98) {
    const k = (i / SR).toFixed(1);
    clips[k] = (clips[k] || 0) + 1;
    total++;
  }
}
console.log(`duration ${(n / SR).toFixed(2)} s · clipped samples ${total}`, total ? JSON.stringify(clips) : '');
const rows = [];
for (let s = Math.max(0, +from); s < Math.min(n / SR, +to); s += 0.5) {
  let t = 0;
  const a = Math.floor(s * SR), e = Math.min(n, a + SR / 2);
  for (let i = a; i < e; i++) t += sample(i, 0) ** 2 + sample(i, 1) ** 2;
  rows.push(`${s.toFixed(1)}:${(10 * Math.log10(t / (2 * (e - a)) + 1e-12)).toFixed(0)}`);
}
console.log('dB per 0.5 s →', rows.join(' '));
