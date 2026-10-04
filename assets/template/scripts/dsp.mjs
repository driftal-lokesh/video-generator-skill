// Shared DSP for the synthesized audio: oscillators, filter, reverb, mastering, WAV out.
// Deterministic: a fixed seed, so the same script always writes the same samples.
import { writeFileSync } from 'node:fs';

export const SR = 44100;
export const TAU = Math.PI * 2;
export const OUT = new URL('../public/', import.meta.url).pathname;

let seed = 1337;
export const rnd = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const noise = () => rnd() * 2 - 1;
export const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

// ── building blocks ──────────────────────────────────────────────────────────────────────────────

/** Chamberlin state-variable filter; `damp` < 0.7 resonates. */
export function svf() {
  const s = {
    lp: 0, bp: 0, hp: 0,
    run(x, fc, damp = 0.7) {
      const f = 2 * Math.sin((Math.PI * Math.min(Math.max(fc, 20), SR / 6.5)) / SR);
      s.hp = x - s.lp - damp * s.bp;
      s.bp += f * s.hp;
      s.lp += f * s.bp;
      return s;
    },
  };
  return s;
}

export function blep(t, dt) {
  if (t < dt) { t /= dt; return t + t - t * t - 1; }
  if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
  return 0;
}
/** Band-limited saw (polyBLEP). */
export const saw = (phase, dt) => 2 * phase - 1 - blep(phase, dt);

export function bus(sec) {
  const n = Math.ceil(sec * SR);
  return { n, L: new Float32Array(n), R: new Float32Array(n), send: new Float32Array(n) };
}
/** Equal-power pan, plus a reverb send. */
export function put(b, i, v, pan = 0, send = 0) {
  if (i < 0 || i >= b.n) return;
  const a = ((pan + 1) * Math.PI) / 4;
  b.L[i] += v * Math.cos(a);
  b.R[i] += v * Math.sin(a);
  b.send[i] += v * send;
}

export function freeverb(input, offset, room = 0.86, damp = 0.25) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => ({ buf: new Float32Array(d + offset), i: 0, store: 0 }));
  const aps = [556, 441, 341, 225].map((d) => ({ buf: new Float32Array(d + offset), i: 0 }));
  const out = new Float32Array(input.length);
  for (let n = 0; n < input.length; n++) {
    const x = input[n] * 0.015;
    let y = 0;
    for (const c of combs) {
      const o = c.buf[c.i];
      c.store = o * (1 - damp) + c.store * damp;
      c.buf[c.i] = x + c.store * room;
      if (++c.i >= c.buf.length) c.i = 0;
      y += o;
    }
    for (const a of aps) {
      const b = a.buf[a.i];
      a.buf[a.i] = y + b * 0.5;
      y = b - y;
      if (++a.i >= a.buf.length) a.i = 0;
    }
    out[n] = y;
  }
  return out;
}

/** Adds the bus's reverb return onto its dry signal. */
export function withReverb(b, wet = 2.4, room) {
  const wl = freeverb(b.send, 0, room);
  const wr = freeverb(b.send, 23, room);
  for (let i = 0; i < b.n; i++) { b.L[i] += wl[i] * wet; b.R[i] += wr[i] * wet; }
  return b;
}

/** Gain from the 99.8th-percentile level, not the single loudest hit, then a tanh limiter. */
export function master(b, peak = 0.9, drive = 1.4) {
  const sample = [];
  for (let i = 0; i < b.n; i += 7) sample.push(Math.max(Math.abs(b.L[i]), Math.abs(b.R[i])));
  sample.sort((x, y) => x - y);
  const max = sample[Math.floor(sample.length * 0.998)] || 1e-9;
  const k = Math.tanh(drive);
  for (let i = 0; i < b.n; i++) {
    b.L[i] = (Math.tanh((b.L[i] / max) * drive) / k) * peak;
    b.R[i] = (Math.tanh((b.R[i] / max) * drive) / k) * peak;
  }
  return b;
}

export function writeWav(name, b) {
  const n = b.n;
  const data = Buffer.alloc(44 + n * 4);
  data.write('RIFF', 0); data.writeUInt32LE(36 + n * 4, 4); data.write('WAVE', 8);
  data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
  data.write('data', 36); data.writeUInt32LE(n * 4, 40);
  const q = (x) => Math.round(Math.max(-1, Math.min(1, x)) * 32767);
  for (let i = 0; i < n; i++) { data.writeInt16LE(q(b.L[i]), 44 + i * 4); data.writeInt16LE(q(b.R[i]), 46 + i * 4); }
  writeFileSync(OUT + name, data);
}

