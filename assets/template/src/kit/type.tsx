// Type: the font, the type scale, the one-gradient-word lines, typing and streaming text.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
// To use the brand's font, swap this import for another @remotion/google-fonts family.
import { loadFont } from '@remotion/google-fonts/Inter';
import { C, GRAD } from './config';
import { clamp, ease } from './motion';

export const { fontFamily: FONT } = loadFont('normal', { weights: ['400', '500', '600', '700', '800'], subsets: ['latin'] });

/** Display type: tight tracking, nowrap. Sizes: hero 130–150 / 650, line 112 / 650, quiet 84 / 400. */
export const type = (size: number, weight = 650, color: string = C.ink): React.CSSProperties => ({ fontSize: size, fontWeight: weight, letterSpacing: '-0.035em', lineHeight: 1.15, whiteSpace: 'nowrap', color });

const GRAD_TEXT = { backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } as const;
/** The brand gradient on a word. One per line, at most. */
export const Grad: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={GRAD_TEXT}>{children}</span>;

const parse = (s: string) => s.split('*').map((t, i) => ({ t, g: i % 2 === 1 }));
/** A line of copy where `*word*` takes the gradient. One span with white-space: pre (flex would eat the spaces). */
export const Line: React.FC<{ text: string }> = ({ text }) => (
  <span style={{ whiteSpace: 'pre' }}>{parse(text).map((p, i) => (p.g ? <Grad key={i}>{p.t}</Grad> : <React.Fragment key={i}>{p.t}</React.Fragment>))}</span>
);

/**
 * A line slide: centred, the words rise out of a mask one after another (4-frame stagger), a slow push.
 * Pass `at` = the frame its slide-in starts, so the words arrive while the slide lands.
 */
export const Title: React.FC<{ text: string; at: number; quiet?: boolean }> = ({ text, at, quiet }) => {
  const f = useCurrentFrame();
  const push = interpolate(f, [at, at + 160], [1, 1.04], clamp);
  return (
    <AbsoluteFill style={{ display: 'grid', placeItems: 'center' }}>
      <div style={{ ...type(quiet ? 84 : 112, quiet ? 400 : 650, quiet ? C.muted : C.ink), display: 'flex', gap: '0.26em', transform: `scale(${push})` }}>
        {text.split(' ').map((w, i) => {
          const p = ease(f, [at + i * 4, at + i * 4 + 24], [0, 1]);
          const t = w.replaceAll('*', '');
          return (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: '0.1em' }}>
              <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`, filter: `blur(${(1 - p) * 6}px)` }}>{w.includes('*') ? <Grad>{t}</Grad> : t}</span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Typewriter with a blinking caret. `cpf` = characters per frame (text.length / frames you have). */
export const Typed: React.FC<{ text: string; from: number; cpf?: number; caret?: boolean; style?: React.CSSProperties }> = ({ text, from, cpf = 0.45, caret = true, style }) => {
  const f = useCurrentFrame();
  const parts = parse(text);
  const total = parts.reduce((n, p) => n + p.t.length, 0);
  let left = Math.max(0, Math.floor((f - from) * cpf));
  const done = left >= total;
  const blinkOn = !done || Math.floor((f - from) / 18) % 2 === 0;
  return (
    <span style={{ whiteSpace: 'pre', ...style }}>
      {parts.map((p, i) => {
        const shown = p.t.slice(0, Math.max(0, left));
        left -= p.t.length;
        return p.g ? <Grad key={i}>{shown}</Grad> : <React.Fragment key={i}>{shown}</React.Fragment>;
      })}
      {caret && f >= from - 20 && <span style={{ display: 'inline-block', width: '0.06em', height: '1em', marginLeft: '0.04em', verticalAlign: '-0.12em', background: C.primary, opacity: blinkOn ? 1 : 0 }} />}
    </span>
  );
};

/** A streamed answer: words arrive `step` frames apart, blur lifting off; `hot` words in the brand colour. */
export const Stream: React.FC<{ text: string; at: number; step?: number; hot?: string[] }> = ({ text, at, step = 2, hot = [] }) => {
  const f = useCurrentFrame();
  return (
    <>
      {text.split(' ').map((w, i) => {
        const p = ease(f, [at + i * step, at + i * step + 14], [0, 1]);
        const h = hot.includes(w.replace(/[.,:;!?]/g, ''));
        return (
          <span key={i} style={{ display: 'inline-block', marginRight: '0.3em', opacity: p, filter: `blur(${(1 - p) * 6}px)`, fontWeight: h ? 650 : 400, color: h ? C.primary : undefined }}>
            {w}
          </span>
        );
      })}
    </>
  );
};
