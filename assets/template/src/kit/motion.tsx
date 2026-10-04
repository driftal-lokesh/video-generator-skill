// Timing helpers and the click language: cursor, press, a small camera punch toward each click.
import React from 'react';
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { C } from './config';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const OUT_EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 (or any output range) over [a, b] frames, eased, clamped. The workhorse. */
export const ease = (frame: number, input: [number, number], output: [number, number], easing = OUT_EXPO) =>
  interpolate(frame, input, output, { ...clamp, easing });

/** Children see the absolute video frame wherever their sequence starts — lets one scene play in several windows. */
export const Abs: React.FC<{ start: number; children: React.ReactNode }> = ({ start, children }) => (
  <Sequence from={-start} layout="none">
    {children}
  </Sequence>
);

/** Hover: the target rises 2px as the cursor arrives and settles after the click. Returns px. */
export const lift = (f: number, at: number) => -2 * interpolate(f, [at - 16, at - 6, at + 8, at + 20], [0, 1, 1, 0], clamp);
/** Press: the target dips to 0.96 on the click frame. Returns a scale. */
export const press = (f: number, at: number) => 1 - 0.04 * interpolate(f, [at - 3, at, at + 9], [0, 1, 0], clamp);

export type Click = { at: number; x: number; y: number };

/** A 3% punch-in toward each click, landing with it. Wrap a UI window in it. */
export const Camera: React.FC<{ clicks: Click[]; children: React.ReactNode }> = ({ clicks, children }) => {
  const f = useCurrentFrame();
  let k = 0;
  let o = { x: 960, y: 540 };
  for (const c of clicks) {
    const b = interpolate(f, [c.at - 2, c.at + 6, c.at + 40], [0, 1, 0], { ...clamp, easing: Easing.inOut(Easing.sin) });
    if (b > k) {
      k = b;
      o = c;
    }
  }
  return <AbsoluteFill style={{ transformOrigin: `${o.x}px ${o.y}px`, transform: `scale(${1 + 0.03 * k})` }}>{children}</AbsoluteFill>;
};

/**
 * The pointer: arcs between points, presses to 0.85 with a ring on each click, fades out 30–50 frames
 * after its last click. Use one per window, entering from off-screen ~35 frames before the first click.
 */
export const Cursor: React.FC<{ path: { f: number; x: number; y: number }[]; clicks?: number[]; ring?: string }> = ({ path, clicks = [], ring = C.primary }) => {
  const f = useCurrentFrame();
  if (f < path[0].f) return null;
  let x = path[path.length - 1].x;
  let y = path[path.length - 1].y;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (f <= b.f) {
      const p = interpolate(f, [a.f, b.f], [0, 1], { ...clamp, easing: IN_OUT });
      x = a.x + (b.x - a.x) * p;
      y = a.y + (b.y - a.y) * p - Math.sin(Math.PI * p) * Math.min(80, Math.abs(b.x - a.x) * 0.12);
      break;
    }
  }
  const last = clicks[clicks.length - 1];
  const fade = last === undefined ? 1 : ease(f, [last + 30, last + 50], [1, 0]);
  const down = clicks.reduce((m, c) => Math.max(m, interpolate(f, [c - 3, c, c + 9], [0, 1, 0], clamp)), 0);
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 50, opacity: fade }}>
      {clicks.map((c) => {
        const r = f - c;
        if (r < 0 || r > 28) return null;
        const k = ease(r, [0, 28], [0, 1]);
        return <div key={c} style={{ position: 'absolute', left: -45 * k, top: -45 * k, width: 90 * k, height: 90 * k, borderRadius: '50%', border: `2.5px solid ${ring}`, opacity: 0.75 * (1 - k) }} />;
      })}
      <svg width={42} height={42} viewBox="0 0 24 24" style={{ transform: `scale(${1 - down * 0.15})`, transformOrigin: '0 0', filter: 'drop-shadow(0 4px 8px rgba(4,8,22,0.3))' }}>
        <path d="M3 2l7.5 19 2.6-7.6L21 11z" fill={C.ink} stroke={C.surface} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
