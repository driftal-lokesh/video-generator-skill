import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { B, BRAND } from '../../../kit/config';
import { BigMark, MarkAt, growMark, shrinkMark } from '../../../kit/mark';
import { clamp, ease } from '../../../kit/motion';
import { Grad, type } from '../../../kit/type';
import { AT } from '../timeline';

const R0 = B(AT.reveal);
export const MARK_IN = B(AT.reveal + 1);
const GROW: [number, number] = [B(AT.reveal + 2), B(12) - 18];
export const NAME = B(12);

/** "Meet", the mark appears and grows until it is the screen; on the hit it collapses into "Meet ✦ Name". */
export const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const land = ease(f, [R0, R0 + 32], [0, 1]);
  const up = ease(f, [MARK_IN, MARK_IN + 40], [0, 1]);
  const gone = ease(f, [GROW[0] + 30, GROW[0] + 100], [0, 1]);
  const born = ease(f, [MARK_IN, MARK_IN + 50], [0, 1], Easing.out(Easing.back(1.6)));
  const size = f < GROW[0] ? 150 * born : growMark(f, GROW, 150);
  const cy = interpolate(f, GROW, [610, 540], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  if (f < NAME) {
    return (
      <>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 455 - up * 170, textAlign: 'center', ...type(150), opacity: land * (1 - gone), filter: `blur(${(1 - land) * 18 + gone * 10}px)`, transform: `scale(${(4 - 3 * land) * (1 + gone * 0.2)})` }}>Meet</div>
        {f >= MARK_IN && <BigMark id="reveal-mark" cx={960} cy={cy} size={size} rot={f * 0.3} glow={1.1} />}
      </>
    );
  }
  // the switch is invisible: the growing mark already covers the frame
  const mark = shrinkMark(f, [NAME, NAME + 36], 124);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `scale(${interpolate(f, [NAME, NAME + 120], [1, 1.035], clamp)})` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', alignItems: 'center', ...type(150) }}>
        <span>Meet</span>
        <span style={{ position: 'relative', width: 196, height: '1em' }}>
          <span style={{ position: 'absolute', left: '50%', top: '50%' }}>
            <MarkAt id="reveal-slot" size={mark} rot={(f - NAME) * 0.3} glow={1.1} />
          </span>
        </span>
        <Grad>{BRAND.name}</Grad>
      </div>
    </div>
  );
};
