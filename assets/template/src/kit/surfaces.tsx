// Surfaces: colour at the edges (Aurora), app windows, frosted glass, the goo filter.
import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { C, SHADOW } from './config';
import { clamp } from './motion';

/** An act of edge colour: from this frame, these five blob colours at this strength. */
export type Act = [number, string[], number];

const BLOBS = [
  { x: -140, y: -180, r: 920 },
  { x: 2060, y: -140, r: 880 },
  { x: -180, y: 1240, r: 940 },
  { x: 2080, y: 1220, r: 980 },
  { x: 960, y: 1400, r: 820 },
];

/**
 * Five soft blobs drifting at the corners and the bottom; the centre stays clean for content.
 * Give each act its own colours; `blooms` = frames of big hits, where the light swells for ~2 s.
 */
export const Aurora: React.FC<{ acts: Act[]; blooms?: number[] }> = ({ acts, blooms = [] }) => {
  const f = useCurrentFrame();
  const at = acts.map((a) => a[0]);
  const base = interpolate(f, at, acts.map((a) => a[2]), clamp);
  const bloom = Math.max(0, ...blooms.map((b) => interpolate(f, [b - 2, b + 10, b + 110], [0, 1, 0], clamp)));
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {BLOBS.map((b, i) => {
        const c = interpolateColors(f, at, acts.map((a) => a[1][i]));
        const r = b.r * (1 + 0.28 * bloom);
        const x = b.x + Math.sin(f / 95 + i * 1.7) * 110;
        const y = b.y + Math.cos(f / 120 + i * 1.1) * 80;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: `radial-gradient(closest-side, ${c}, transparent)`,
              opacity: Math.min(1, base + 0.35 * bloom),
              transform: `scale(${1 + 0.16 * Math.sin(f / 70 + i * 2.1)}, ${1 + 0.16 * Math.cos(f / 83 + i * 1.3)}) rotate(${f * 0.05 + i * 40}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** An app window: white, rounded, soft brand shadow, a light rim on top. Children are positioned inside. */
export const Window: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 30, background: C.surface, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), ${SHADOW}`, overflow: 'hidden', ...style }}>{children}</div>
);

/** Frosted glass for floating panels and cards over colour. */
export const glass = (radius = 24): React.CSSProperties => ({
  borderRadius: radius,
  background: 'linear-gradient(150deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.64) 100%)',
  backdropFilter: 'blur(22px) saturate(1.7)',
  WebkitBackdropFilter: 'blur(22px) saturate(1.7)',
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(255,255,255,0.6), inset 0 -18px 30px -24px ${C.secondary}59, 0 30px 70px -34px ${C.primary}73`,
});

/** Mount once per video: `filter: url(#goo)` melts nearby shapes into one another (typing dots, drops). */
export const LiquidDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      <filter id="goo" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="b" />
        <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="g" />
        <feComposite in="SourceGraphic" in2="g" operator="atop" />
      </filter>
    </defs>
  </svg>
);
