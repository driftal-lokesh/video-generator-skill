// Find a track's beat grid: node scripts/beatgrid.mjs public/track.mp3 [--phase=<bar line, s>]
// Prints the tempo (reliable), a guessed bar line, a kick map to check that guess by eye, and loudness
// per bar — the map you cut the video to (intro, drop, breakdown, build, return).
// The bar-line guess can land a 16th early on syncopated beats (an 808 that anticipates beat 2):
// look at the kick map — the drop's first hit should sit right on a '|' — and re-run with --phase.
// Then LISTEN: out/beatgrid-click.wav is the track with a tick on every beat (high on bar lines).
// If the ticks feel early/late against the groove, nudge --phase until they lock.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const input = process.argv[2];
if (!input) throw new Error('usage: node scripts/beatgrid.mjs <track.mp3> [--phase=<s>]');
const forced = process.argv.find((a) => a.startsWith('--phase='));
const SR = 22050, HOP = 256, WIN = 1024;
mkdirSync(new URL('../out/', import.meta.url).pathname, { recursive: true });
const tmp = new URL('../out/.beatgrid.wav', import.meta.url).pathname;
execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-v', 'error', '-i', input, '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', tmp]);
const b = readFileSync(tmp);
rmSync(tmp);
let p = 12;
while (b.toString('ascii', p, p + 4) !== 'data') p += 8 + b.readUInt32LE(p + 4);
const n = b.readUInt32LE(p + 4) / 2;
const x = new Float32Array(n);
for (let i = 0; i < n; i++) x[i] = b.readInt16LE(p + 8 + i * 2) / 32768;
const raw = x.slice();

// onset strength from the kick/bass band (a 150 Hz low-pass): hats and shakers would otherwise pull
// the grid onto off-beats (e.g. 4/3 of the real tempo)
{
  const w = (2 * Math.PI * 150) / SR, al = Math.sin(w) / (2 * 0.707), c = Math.cos(w);
  const b0 = (1 - c) / 2 / (1 + al), b1 = (1 - c) / (1 + al), a1 = (-2 * c) / (1 + al), a2 = (1 - al) / (1 + al);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const y = b0 * x[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y; x[i] = y;
  }
}
// onset strength: rise in log energy, frame by frame
const frames = Math.floor((n - WIN) / HOP);
const loud = new Float32Array(frames), flux = new Float32Array(frames);
for (let f = 0; f < frames; f++) {
  let e = 0;
  for (let i = f * HOP; i < f * HOP + WIN; i++) e += x[i] * x[i];
  loud[f] = Math.log(1e-9 + e);
  flux[f] = f ? Math.max(0, loud[f] - loud[f - 1]) : 0;
}
// flux[f] is the rise as the newest HOP samples enter the window, i.e. around f·HOP + WIN − HOP/2
const at = (sec) => {
  const fr = (sec * SR - WIN + HOP / 2) / HOP, k = Math.floor(fr);
  return k + 1 < frames && k >= 0 ? flux[k] * (1 - (fr - k)) + flux[k + 1] * (fr - k) : 0;
};

// tempo candidates: autocorrelation peaks between 70 and 160 BPM
const acs = [];
for (let lag = Math.floor((60 / 160) * (SR / HOP)); lag <= Math.ceil((60 / 70) * (SR / HOP)); lag++) {
  let s = 0;
  for (let f = 0; f + lag < frames; f++) s += flux[f] * flux[f + lag];
  acs.push({ lag, s });
}
const peaks = acs.filter((a, i) => i > 0 && i < acs.length - 1 && a.s >= acs[i - 1].s && a.s >= acs[i + 1].s).sort((a, b) => b.s - a.s).slice(0, 4);
// each candidate refined to 0.01 BPM + phase by the comb of beats that lands on the most onsets;
// the winner is the best comb, mildly preferring ~100 BPM so half/double time don't win by accident
const dur = n / SR;
let fine = { score: -1, bpm: 0, phase: 0 };
for (const pk of peaks) {
  const c0 = 60 / ((pk.lag * HOP) / SR);
  for (let bpm = c0 * 0.97; bpm <= c0 * 1.03; bpm += 0.01) {
    const beat = 60 / bpm;
    for (let ph = 0; ph < beat; ph += beat / 48) {
      let s = 0, c = 0;
      for (let t = ph; t < dur; t += beat) { s += at(t); c++; }
      const score = (s / c) * Math.exp(-0.5 * (Math.log2(bpm / 100) / 1.2) ** 2);
      if (score > fine.score) fine = { score, bpm, phase: ph };
    }
  }
}
const beat = 60 / fine.bpm;
// phase from the bar line: syncopated kicks smear a per-beat comb, but the downbeat hit repeats every
// bar — so slide a one-per-bar comb across a whole bar and keep the strongest
let down = 0, top = -1;
for (let ph = 0; ph < 4 * beat; ph += beat / 96) {
  let s = 0;
  for (let t = ph; t < dur; t += 4 * beat) s += at(t);
  if (s > top) { top = s; down = ph; }
}
if (forced) down = Number(forced.split('=')[1]);
fine.phase = down % beat;

console.log(`tempo  ${fine.bpm.toFixed(2)} BPM · beat ${beat.toFixed(5)} s · bar ${(4 * beat).toFixed(4)} s`);
console.log(`beats  at ${fine.phase.toFixed(3)} s + k·beat · bar lines at ${down.toFixed(3)} s + k·bar (check by ear: the drop should start on one)`);
console.log('bars   (start s → dB RMS) — look for the drop, the breakdown and the return:');
const rows = [], db = [];
for (let t = down, i = 0; t + 4 * beat < dur; t += 4 * beat, i++) {
  let e = 0;
  const a = Math.floor(t * SR), z = Math.floor((t + 4 * beat) * SR);
  for (let k = a; k < z; k++) e += raw[k] * raw[k];
  db.push(10 * Math.log10(e / (z - a) + 1e-12));
  rows.push(`#${i} ${t.toFixed(2)}s ${db[i].toFixed(1)}`);
}
for (let i = 0; i < rows.length; i += 6) console.log('      ' + rows.slice(i, i + 6).join(' | '));
// kick map of the first loud bars after the biggest jump in loudness (usually the drop): one char per
// 16th, '|' on each beat. A good grid puts the drop's first hit right on the first '|'.
let jump = 1;
for (let i = 1; i < db.length; i++) if (db[i] - db[i - 1] > db[jump] - db[jump - 1]) jump = i;
const env = (t) => { const a = Math.floor(t * SR); let e = 0; for (let k = a; k < a + 220; k++) e += x[k] * x[k]; return Math.sqrt(e / 220); };
const maps = [], peak = [0];
for (let i = jump; i < Math.min(db.length, jump + 3); i++) {
  const t0 = down + i * 4 * beat;
  const v = Array.from({ length: 16 }, (_, s) => env(t0 + (s * beat) / 4));
  peak[0] = Math.max(peak[0], ...v);
  maps.push({ i, v });
}
console.log(`kick map (bars from #${jump}, the biggest jump):`);
for (const { i, v } of maps) console.log(`      #${String(i).padEnd(3)} ` + v.map((e, s) => (s % 4 ? '' : '|') + (e > 0.5 * peak[0] ? '#' : e > 0.25 * peak[0] ? '+' : e > 0.12 * peak[0] ? '.' : ' ')).join(''));

// the click track: the music, a short tick on every beat (1.6 kHz on bar lines, 1 kHz otherwise)
const mix = new Int16Array(n);
for (let i = 0; i < n; i++) mix[i] = Math.round(raw[i] * 0.7 * 32767);
for (let t = fine.phase, k = Math.round((fine.phase - down) / beat); t < dur; t += beat, k++) {
  const bar = ((k % 4) + 4) % 4 === 0, s0 = Math.floor(t * SR);
  for (let i = 0; i < 0.03 * SR && s0 + i < n; i++) {
    const v = Math.sin((2 * Math.PI * (bar ? 1600 : 1000) * i) / SR) * Math.exp(-i / (0.008 * SR)) * 0.5;
    mix[s0 + i] = Math.max(-32767, Math.min(32767, mix[s0 + i] + v * 32767));
  }
}
const wav = Buffer.alloc(44 + n * 2);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + n * 2, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 2, 28);
wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(n * 2, 40);
Buffer.from(mix.buffer).copy(wav, 44);
writeFileSync(new URL('../out/beatgrid-click.wav', import.meta.url).pathname, wav);
console.log('listen  out/beatgrid-click.wav — ticks on the beat? then in video.config.json: music.bpm, music.start = a bar line (+ k·bar) where the video begins');
