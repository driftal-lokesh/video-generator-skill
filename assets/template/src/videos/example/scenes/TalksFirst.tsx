import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { B, BRAND, C } from '../../../kit/config';
import { TeamsLogo } from '../../../kit/logos';
import { BigMark, Mark, MarkAt, MarkReveal, growMark } from '../../../kit/mark';
import { Camera, Cursor, clamp, ease } from '../../../kit/motion';
import { Window } from '../../../kit/surfaces';
import { Grad, type } from '../../../kit/type';
import { Chip, Dot, LiquidButton, Reply, TypingDots } from '../../../kit/ui';
import { AT } from '../timeline';

const F = (beats: number) => B(AT.first + beats);
const F0 = B(AT.first);
/** Where the mark sits in the line, in frame pixels — measured from a render (scripts/findred.py). Re-measure if the line changes. */
const MARK = { x: 454, y: 540, size: 96 };
export const GROW: [number, number] = [F(1.4), F(1.4) + 50];
export const TYPING = F(2.8);
export const MESSAGE = F(3.3);
export const CARD = F(4.4);
export const APPROVE = F(6);
export const DONE = F(6.6);

const WIN = { x: 160, y: 140, w: 1600, h: 820 };
const BTN = { x: WIN.x + 80 + 40 + 120, y: WIN.y + 330 + 26 + 40 + 30 + 36 };

const Line: React.FC<{ at: number; color: string; children: React.ReactNode }> = ({ at, color, children }) => {
  const f = useCurrentFrame();
  const p = ease(f, [at, at + 18], [0, 1]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, opacity: p, transform: `translateX(${(1 - p) * 24}px)`, fontSize: 26 }}>
      <Dot color={color} />
      {children}
    </div>
  );
};

/** The product's home, where it has already written to you. */
const Home: React.FC = () => {
  const f = useCurrentFrame();
  const card = ease(f, [CARD, CARD + 20], [0, 1]);
  return (
    <Window {...WIN}>
      <div style={{ position: 'absolute', left: 40, top: 30, display: 'flex', alignItems: 'center', gap: 10, fontSize: 21, fontWeight: 600, color: C.ink }}>
        <Dot color={C.primary} size={9} /> New chat
      </div>
      {f >= TYPING && (
        <div style={{ position: 'absolute', left: 80, top: 100, display: 'flex', alignItems: 'center', gap: 10, fontSize: 19, fontWeight: 600, color: C.primary, opacity: ease(f, [TYPING, TYPING + 14], [0, 1]) }}>
          <Dot color={C.primary} size={8} /> {BRAND.name} messaged you · 08:59
        </div>
      )}
      {f >= TYPING && f < MESSAGE && (
        <span style={{ position: 'absolute', left: 80, top: 160, padding: '14px 22px', borderRadius: '22px 22px 22px 6px', background: C.tint }}>
          <TypingDots />
        </span>
      )}
      {f >= MESSAGE && (
        <Reply note="automatically" style={{ position: 'absolute', left: 80, right: 80, top: 150, opacity: ease(f, [MESSAGE, MESSAGE + 12], [0, 1]) }}>
          <span style={{ color: C.ink, fontWeight: 500 }}>Good morning, {BRAND.user}. While you were away:</span>
          <Line at={MESSAGE + 10} color={C.primary}>
            <b style={{ color: C.ink, fontWeight: 600 }}>Nightly sync failed at 02:10</b> — retried automatically ✓
          </Line>
          <Line at={F(3.8)} color={C.warn}>
            <b style={{ color: C.ink, fontWeight: 600 }}>1 thing needs you</b> — the partner API token expires Friday
          </Line>
        </Reply>
      )}
      {f >= CARD && (
        <div style={{ position: 'absolute', left: 80, top: 330, width: 1080, padding: '26px 40px', borderRadius: 24, background: C.surface, boxShadow: `0 30px 70px -36px ${C.primary}88, 0 0 0 1px ${C.line}`, opacity: card, transform: `translateY(${(1 - card) * 30}px)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Mark size={40} />
            <span style={{ fontSize: 27, color: C.ink }}>Renew the partner API token now?</span>
            <Chip style={{ marginLeft: 'auto', background: C.canvas, color: C.ink2, fontWeight: 600 }}>
              <TeamsLogo size={24} /> Also in Teams
            </Chip>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 30 }}>
            <LiquidButton at={APPROVE} x={120} y={36} w={240} h={72} label="Approve" done="✓ Approved" />
            <span style={{ width: 170, height: 72, borderRadius: 18, border: `1.5px solid ${C.line}`, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontSize: 25, fontWeight: 600, color: C.muted }}>Not now</span>
            {f >= DONE && <span style={{ marginLeft: 20, fontSize: 24, fontWeight: 600, color: C.primary, whiteSpace: 'nowrap', opacity: ease(f, [DONE, DONE + 16], [0, 1]) }}>Token renewed · next sync is healthy</span>}
          </div>
        </div>
      )}
    </Window>
  );
};

/** "✦ Name talks first." slams in on the hit; its mark grows into the home, where the product already wrote. */
export const TalksFirst: React.FC = () => {
  const f = useCurrentFrame();
  const slam = ease(f, [F0, F0 + 14], [0, 1]);
  const rot = (f - F0) * 0.3; // lands upright, then a slow turn
  const size = f < GROW[0] ? MARK.size : growMark(f, GROW, MARK.size);
  const move = interpolate(f, GROW, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cx = MARK.x + (960 - MARK.x) * move;
  const cy = MARK.y + (540 - MARK.y) * move;
  const textOut = ease(f, [GROW[0], GROW[0] + 14], [0, 1]);
  return (
    <Camera clicks={[{ at: APPROVE, ...BTN }]}>
      {textOut < 1 && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: 1 - textOut, transform: `scale(${(1.12 - 0.12 * slam) * (1 + textOut * 0.06)})`, filter: slam < 1 ? `blur(${(1 - slam) * 10}px)` : undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.26em', ...type(130) }}>
            <span style={{ position: 'relative', width: 112, height: '1em' }}>
              <span style={{ position: 'absolute', left: '50%', top: '50%' }}>{f < GROW[0] && <MarkAt id="first-mark" size={MARK.size * (0.6 + 0.4 * slam)} rot={rot} />}</span>
            </span>
            <Grad>{BRAND.name}</Grad>
            <span>talks</span>
            <span>first.</span>
          </div>
        </div>
      )}
      {f >= GROW[0] &&
        (size < 9000 ? (
          <>
            <MarkReveal id="first-clip" cx={cx} cy={cy} size={size} rot={rot}>
              <Home />
            </MarkReveal>
            <BigMark id="first-fade" cx={cx} cy={cy} size={size} rot={rot} glow={0} opacity={1 - ease(f, [GROW[0], GROW[0] + 18], [0, 1])} />
          </>
        ) : (
          <Home />
        ))}
      <Cursor clicks={[APPROVE]} path={[{ f: APPROVE - 44, x: 1500, y: 1120 }, { f: APPROVE - 3, x: BTN.x + 4, y: BTN.y + 6 }]} />
    </Camera>
  );
};
