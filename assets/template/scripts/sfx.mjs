// Synthesizes every sound effect into public/sfx/*.wav. Deterministic: same code, same files.
// Nothing is downloaded — the only recorded audio in a video is the music the user supplies.
import { mkdirSync } from 'node:fs';
import { OUT, SR, TAU, bus, master, noise, put, rnd, svf, withReverb, writeWav } from './dsp.mjs';

function bell(b, t0, freq, g, pan, decay, send = 0.4) {
  const s0 = Math.round(t0 * SR);
  for (let k = 0; k < SR * decay * 4; k++) {
    const t = k / SR;
    const v = Math.sin(TAU * freq * t) * Math.exp(-t / decay) + 0.25 * Math.sin(TAU * freq * 2.76 * t) * Math.exp(-t / (decay * 0.3));
    put(b, s0 + k, v * g * Math.min(1, t / 0.002), pan, send);
  }
}

const SFX = {
  /** Transition air: band-passed noise swelling through, panned left → right. */
  whoosh() {
    const b = bus(1.2), f = svf(), d = 0.6;
    for (let k = 0; k < SR * d; k++) {
      const p = k / (SR * d);
      put(b, k, f.run(noise(), 300 + 2600 * Math.sin(Math.PI * p) ** 2, 0.5).bp * 1.8 * Math.sin(Math.PI * p) ** 2, -0.7 + 1.4 * p, 0.25);
    }
    return withReverb(b, 1.3);
  },
  /** Short, brighter air for UI moving in. */
  swipe() {
    const b = bus(0.6), f = svf(), d = 0.28;
    for (let k = 0; k < SR * d; k++) {
      const p = k / (SR * d);
      put(b, k, f.run(noise(), 1200 + 4000 * p, 0.5).bp * 1.6 * Math.sin(Math.PI * p) ** 1.5, -0.4 + 0.8 * p, 0.2);
    }
    return withReverb(b, 1.1);
  },
  /** A bright glint for a reveal — high shimmer noise plus three soft partials, long tail. */
  shing() {
    const b = bus(2.2), f = svf();
    for (let k = 0; k < SR * 0.5; k++) {
      const t = k / SR;
      put(b, k, f.run(noise(), 9000, 0.45).hp * Math.exp(-t / 0.09) * 0.5 * Math.min(1, t / 0.004), Math.sin(t * 40) * 0.4, 0.5);
    }
    [2637, 3520, 4699].forEach((fr, i) => bell(b, i * 0.018, fr, 0.22, (i - 1) * 0.5, 0.45, 0.6));
    return withReverb(b, 2.2);
  },
  /** UI card landing: a soft, short tap. */
  tick() {
    const b = bus(0.4), f = svf();
    for (let k = 0; k < SR * 0.06; k++) {
      const t = k / SR;
      put(b, k, (Math.sin(TAU * 1800 * t) * 0.45 + f.run(noise(), 3500, 0.6).bp * 0.6) * Math.exp(-t / 0.011), 0, 0.12);
    }
    return withReverb(b, 0.9);
  },
  typing() {
    const b = bus(1.8);
    for (let t = 0.01; t < 1.25; t += 0.045 + rnd() * 0.035) {
      const s0 = Math.round(t * SR), f = svf(), g = 0.5 + rnd() * 0.5, fc = 1800 + rnd() * 900;
      for (let k = 0; k < SR * 0.035; k++) {
        const u = k / SR;
        put(b, s0 + k, (f.run(noise(), fc, 0.6).bp * 1.4 * Math.exp(-u / 0.005) + Math.sin(TAU * 140 * u) * Math.exp(-u / 0.01) * 0.4) * g, (rnd() - 0.5) * 0.4, 0.04);
      }
    }
    return withReverb(b, 0.6);
  },
  notify() {
    const b = bus(1.6);
    bell(b, 0, 1318.5, 0.5, -0.2, 0.3);
    bell(b, 0.11, 1760, 0.5, 0.2, 0.42);
    return withReverb(b, 1.6);
  },
  click() {
    const b = bus(0.3), f = svf();
    for (let k = 0; k < SR * 0.03; k++) {
      const t = k / SR;
      put(b, k, (f.run(noise(), 2500, 0.7).bp * 1.6 + Math.sin(TAU * 900 * t) * 0.3) * Math.exp(-t / 0.004));
    }
    return b;
  },

  /** Two-and-a-half-second build: noise sweeping up through a band-pass, a tone gliding under it. Stops dead. */
  riser() {
    const d = 2.5, b = bus(d + 0.05), f = svf();
    let ph = 0;
    for (let k = 0; k < SR * d; k++) {
      const p = k / (SR * d);
      ph += (180 + 900 * p * p) / SR;
      const v = f.run(noise(), 250 + 9000 * p ** 2.2, 0.35).bp * 1.4 + Math.sin(TAU * ph) * 0.18 * p;
      put(b, k, v * p ** 2.2, Math.sin(p * 9) * 0.5 * p, 0.3 * p);
    }
    return withReverb(b, 0.8);
  },
  /** Reveal hit: sub drop, a soft transient, a long airy tail. */
  impact() {
    const b = bus(3), f = svf();
    let ph = 0;
    for (let k = 0; k < SR * 1.6; k++) {
      const t = k / SR;
      ph += (32 + 40 * Math.exp(-t / 0.08)) / SR;
      put(b, k, Math.sin(TAU * ph) * Math.exp(-t / 0.55) * Math.min(1, t / 0.003) * 1.1, 0, 0.15);
      if (t < 0.12) put(b, k, f.run(noise(), 1800 - 1500 * (t / 0.12), 0.6).lp * Math.exp(-t / 0.03) * 0.9, 0, 0.8);
    }
    return withReverb(b, 2.6);
  },
  /** A message arriving: two glassy partials. */
  ping() {
    const b = bus(1.6);
    bell(b, 0, 1567.98, 0.5, -0.15, 0.35, 0.5);
    bell(b, 0.07, 2349.32, 0.4, 0.15, 0.5, 0.5);
    return withReverb(b, 1.8);
  },
  /** The scan line: high air sweeping across, with tiny glints. */
  shimmer() {
    const d = 1, b = bus(1.6), f = svf();
    for (let k = 0; k < SR * d; k++) {
      const p = k / (SR * d);
      put(b, k, f.run(noise(), 5000 + 6000 * p, 0.5).hp * Math.sin(Math.PI * p) ** 2 * 0.5, -0.8 + 1.6 * p, 0.4);
    }
    [3136, 3951, 4699, 5274].forEach((fr, i) => bell(b, 0.12 + i * 0.18, fr, 0.08, -0.6 + i * 0.4, 0.2, 0.7));
    return withReverb(b, 2);
  },
  /** A liquid drop: a sine that glides up fast and dies. */
  bloop() {
    const b = bus(0.7);
    let ph = 0;
    for (let k = 0; k < SR * 0.18; k++) {
      const t = k / SR;
      ph += (380 + 1100 * (1 - Math.exp(-t / 0.025))) / SR;
      put(b, k, Math.sin(TAU * ph) * Math.exp(-t / 0.045) * Math.min(1, t / 0.002) * 0.9, 0, 0.35);
    }
    return withReverb(b, 1.2);
  },
};
/** A soft heartbeat, lub-dub — for anything "always on" (monitors, watchers). */
SFX.heart = () => {
  const b = bus(1.2);
  [0, 0.2].forEach((t0, j) => {
    let ph = 0;
    const s0 = Math.round(t0 * SR);
    for (let k = 0; k < SR * 0.25; k++) {
      const t = k / SR;
      ph += (58 - 18 * (t / 0.25)) / SR;
      put(b, s0 + k, Math.sin(TAU * ph) * Math.exp(-t / 0.07) * Math.min(1, t / 0.004) * (j ? 0.7 : 1), 0, 0.2);
    }
  });
  return withReverb(b, 1);
};
// rising pips for steps, facts, list items: A5, C6, E6, G6
[880, 1046.5, 1318.5, 1568].forEach((fr, i) => {
  SFX[`pip${i + 1}`] = () => {
    const b = bus(1);
    bell(b, 0, fr, 0.55, (i - 1.5) * 0.25, 0.12, 0.45);
    return withReverb(b, 1.4);
  };
});


mkdirSync(OUT + 'sfx', { recursive: true });
for (const [name, make] of Object.entries(SFX)) writeWav(`sfx/${name}.wav`, master(make(), 0.9, 1.1));
console.log('wrote', Object.keys(SFX).length, 'sound effects → public/sfx/');
