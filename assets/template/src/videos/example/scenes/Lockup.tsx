import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { B, BRAND, C } from '../../../kit/config';
import { MarkAt } from '../../../kit/mark';
import { clamp, ease } from '../../../kit/motion';
import { Grad, type } from '../../../kit/type';
import { AT } from '../timeline';

export const LOCK = B(AT.lockup);

/** The lockup (the mark sways, never spins far — a turned sparkle reads as a square): the mark pops in the middle, the name opens out beside it (the row stays centred), the tagline rises. Hold it. */
export const Lockup: React.FC = () => {
  const f = useCurrentFrame();
  const pop = ease(f, [LOCK, LOCK + 26], [0, 1], Easing.out(Easing.back(1.8)));
  const open = ease(f, [LOCK + 30, LOCK + 70], [0, 1], Easing.inOut(Easing.cubic));
  const tag = ease(f, [B(AT.lockup + 2), B(AT.lockup + 2) + 26], [0, 1]);
  const push = interpolate(f, [LOCK, LOCK + 400], [1, 1.05], clamp);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', transform: `scale(${push})` }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
        <div style={{ display: 'flex', alignItems: 'center', ...type(150) }}>
          <span style={{ position: 'relative', width: 170, height: '1em' }}>
            <span style={{ position: 'absolute', left: '50%', top: '50%' }}>
              <MarkAt id="lock-mark" size={150 * pop} rot={8 * Math.sin((f - LOCK) / 60)} glow={1.2} />
            </span>
          </span>
          {/* max-width opens the name; the flex row re-centres as it grows, so the mark slides left by itself */}
          <span style={{ display: 'inline-block', overflow: 'hidden', maxWidth: open * 1200, paddingBottom: '0.1em' }}>
            <Grad>{BRAND.name}</Grad>
          </span>
        </div>
        <div style={{ ...type(44, 400, C.muted), opacity: tag, transform: `translateY(${(1 - tag) * 24}px)` }}>{BRAND.tagline}</div>
      </div>
    </div>
  );
};
