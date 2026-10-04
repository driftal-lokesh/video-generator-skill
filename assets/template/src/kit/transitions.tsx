// Transition grammar: into a line → slide; into the UI → through; between big sections → liquid;
// after a silence → hard cut (no transition); a continuing story → a shared element (no transition).
import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { linearTiming, springTiming } from '@remotion/transitions';
import type { TransitionPresentation, TransitionPresentationComponentProps, TransitionTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { OUT_EXPO } from './motion';

const IN = Easing.in(Easing.cubic);

/** Line → UI: the words rush past the camera and blur away; the UI rises out of depth. */
const Through: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({ children, presentationDirection: dir, presentationProgress: t }) => {
  if (dir === 'exiting') {
    const p = IN(Math.min(1, t / 0.6));
    return <AbsoluteFill style={{ opacity: 1 - p, transform: `scale(${1 + 0.45 * p})`, filter: p > 0.001 ? `blur(${p * 18}px)` : undefined }}>{children}</AbsoluteFill>;
  }
  const p = OUT_EXPO(Math.max(0, (t - 0.25) / 0.75));
  return <AbsoluteFill style={{ opacity: p, transform: `translateY(${(1 - p) * 50}px) scale(${0.9 + 0.1 * p})`, filter: p < 0.999 ? `blur(${(1 - p) * 12}px)` : undefined }}>{children}</AbsoluteFill>;
};
export const through = (): TransitionPresentation<Record<string, never>> => ({ component: Through, props: {} });

/** A liquid melt (turbulence displacement + blur) for a change of place. */
const Liquid: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({ children, presentationDirection: dir, presentationProgress: t }) => {
  const out = IN(Math.min(1, t / 0.6));
  const inn = OUT_EXPO(Math.max(0, (t - 0.38) / 0.62));
  const k = dir === 'exiting' ? out : 1 - inn;
  const id = `liq-${dir}`;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency={`${0.003 + 0.005 * k} ${0.006 + 0.012 * k}`} numOctaves={2} seed={9} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={260 * k} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: k > 0.002 ? `url(#${id}) blur(${k * 5}px)` : undefined, opacity: dir === 'exiting' ? 1 - out : inn, transform: dir === 'exiting' ? `scale(${1 + 0.05 * out})` : `scale(${1.05 - 0.05 * inn})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
export const liquid = (): TransitionPresentation<Record<string, never>> => ({ component: Liquid, props: {} });

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- presentations have different prop shapes
export type Enter = { presentation: TransitionPresentation<any>; timing: TransitionTiming };
/** Into a line slide: the next slide pushes in from the right (24 frames, spring). */
export const toLine: Enter = { presentation: slide({ direction: 'from-right' }), timing: springTiming({ config: { damping: 200 }, durationInFrames: 24 }) };
/** Into the UI after a line (22 frames). */
export const toUi: Enter = { presentation: through(), timing: linearTiming({ durationInFrames: 22 }) };
/** Into a new section (24 frames). */
export const melt: Enter = { presentation: liquid(), timing: linearTiming({ durationInFrames: 24 }) };
