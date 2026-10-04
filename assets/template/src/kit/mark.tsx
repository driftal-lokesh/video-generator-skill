// The brand mark (BRAND.markPath, drawn in a 0–100 box) — a glowing white shape with a thin gradient
// rim. Default path: a four-point sparkle, the usual "AI" mark. Nothing ever sits behind it (no tile).
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { BRAND, C } from './config';
import { clamp } from './motion';

const PATH = BRAND.markPath;

const MarkDefs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <radialGradient id={`${id}-body`} cx="50%" cy="50%" r="50%">
      <stop offset="0" stopColor="#FFFFFF" />
      <stop offset="0.55" stopColor="#FCFBFF" />
      <stop offset="0.8" stopColor={C.tint} />
      <stop offset="1" stopColor={C.tintLine} />
    </radialGradient>
    <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={C.sky} />
      <stop offset="0.5" stopColor={C.secondary} />
      <stop offset="1" stopColor={C.pink} />
    </linearGradient>
  </defs>
);

const glowFilter = (s: number, glow: number) =>
  `drop-shadow(0 0 ${Math.max(3, s * 0.05) * glow}px ${C.primary}) drop-shadow(0 0 ${Math.max(9, s * 0.16) * glow}px ${C.secondary}bb) drop-shadow(0 0 ${Math.max(16, s * 0.34) * glow}px ${C.pink}88)`;

/**
 * The mark inline (icons, card headers, the lockup). Upright by default — a turned concave star reads as
 * a hollow square at small sizes. `spin` only for a hero mark on its own.
 */
export const Mark: React.FC<{ size: number; glow?: number; spin?: boolean; id?: string; style?: React.CSSProperties }> = ({ size, glow = 1, spin = false, id = 'mark', style }) => {
  const f = useCurrentFrame();
  const tw = 1 + 0.05 * Math.sin(f / 14);
  return (
    <span style={{ display: 'inline-grid', placeItems: 'center', width: size, height: size, flexShrink: 0, ...style }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible', transform: `rotate(${spin ? f * 0.2 : 0}deg) scale(${tw})`, filter: glowFilter(size, glow) }}>
        <MarkDefs id={id} />
        <path d={PATH} fill={`url(#${id}-body)`} stroke={`url(#${id}-rim)`} strokeWidth={1.4} />
      </svg>
    </span>
  );
};

/** The mark centred on its parent's origin at any size (e.g. inside a slot in a line of text). Glow drops off past screen size. */
export const MarkAt: React.FC<{ id: string; size: number; rot: number; glow?: number }> = ({ id, size, rot, glow = 1 }) => {
  const f = useCurrentFrame();
  const s = size * (1 + 0.05 * Math.sin(f / 14));
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ position: 'absolute', left: -s / 2, top: -s / 2, overflow: 'visible', transform: `rotate(${rot}deg)`, filter: size < 1600 && glow > 0 ? glowFilter(s, glow) : undefined }}>
      <MarkDefs id={id} />
      <path d={PATH} fill={`url(#${id}-body)`} stroke={`url(#${id}-rim)`} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

/** The mark on a full-frame layer at any position/size — cheap even when it covers the screen. */
export const BigMark: React.FC<{ id: string; cx: number; cy: number; size: number; rot: number; glow?: number; opacity?: number }> = ({ id, cx, cy, size, rot, glow = 1, opacity = 1 }) => {
  const f = useCurrentFrame();
  const s = (size / 100) * (1 + 0.04 * Math.sin(f / 14));
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', left: 0, top: 0, opacity, overflow: 'visible', filter: glow > 0 && size < 1600 ? `drop-shadow(0 0 ${size * 0.05 * glow}px ${C.primary}) drop-shadow(0 0 ${size * 0.15 * glow}px ${C.secondary}bb) drop-shadow(0 0 ${size * 0.32 * glow}px ${C.pink}99)` : undefined }}>
      <MarkDefs id={id} />
      <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s}) translate(-50 -50)`}>
        <path d={PATH} fill={`url(#${id}-body)`} stroke={`url(#${id}-rim)`} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
};

/** Whatever is in `children` shows only inside the mark, with its gradient rim riding the edge. */
export const MarkReveal: React.FC<{ id: string; cx: number; cy: number; size: number; rot: number; children: React.ReactNode }> = ({ id, cx, cy, size, rot, children }) => {
  const tf = `translate(${cx} ${cy}) rotate(${rot}) scale(${size / 100}) translate(-50 -50)`;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={PATH} transform={tf} />
        </clipPath>
      </svg>
      <AbsoluteFill style={{ clipPath: `url(#${id})` }}>{children}</AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <MarkDefs id={`${id}-r`} />
        <path d={PATH} transform={tf} fill="none" stroke={`url(#${id}-r-rim)`} strokeWidth={5} vectorEffect="non-scaling-stroke" />
      </svg>
    </AbsoluteFill>
  );
};

/** Size of a mark growing from `from` px past the screen edges over [a, b] — exponential, so it reads as constant speed. */
export const growMark = (f: number, [a, b]: [number, number], from: number, to = 14000) => {
  const p = interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return from * Math.pow(to / from, p);
};

/** The reverse: a screen-filling mark (14000 px) shrinking to `to` px over [a, b], landing with a small overshoot. */
export const shrinkMark = (f: number, [a, b]: [number, number], to: number, from = 14000) => {
  const p = interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.25)) });
  return from * Math.pow(to / from, p);
};
