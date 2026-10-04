import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { B, BRAND, C } from '../../../kit/config';
import { Camera, Cursor, clamp, ease } from '../../../kit/motion';
import { Window } from '../../../kit/surfaces';
import { Stream, Typed } from '../../../kit/type';
import { Composer, Confidence, Reply, Thoughts, UserBubble } from '../../../kit/ui';
import { AT } from '../timeline';

// ── beats ────────────────────────────────────────────────────────────────────────────────────────
const K = (beats: number) => B(AT.chat + beats);
export const CLICK = K(0.6);
export const TYPE: [number, number] = [K(0.8), K(2.2)];
export const SEND = K(2.5);
export const STEPS = [K(2.9), K(3.25), K(3.6)];
const FOLD = K(4);
export const ANSWER = K(4.05);
/** The run trace inside the answer: steps + arrows build, then one run travels through it. */
export const TRACE = K(5.6);
const RUN = TRACE + 40;
export const HIT = RUN + 50;
const CONF = HIT + 40;

const Q = 'Why did the nightly sync fail?';
const A = "The partner API sent an empty response at 02:10, so the import stopped after 0 rows. It's the third Tuesday in a row.";

// ── geometry ─────────────────────────────────────────────────────────────────────────────────────
const WIN = { x: 240, y: 120, w: 1440, h: 860 };
const PAD = 110;
const COMPOSER = { top: 700, h: 130 };
const BOX = { x: WIN.x + PAD + 300, y: WIN.y + COMPOSER.top + 40 };
const SEND_AT = { x: WIN.x + WIN.w - PAD - 43, y: WIN.y + COMPOSER.top + COMPOSER.h - 41 };

// ── the run trace: Fetch → Transform → Import; the run arrives empty and the import stops ─────────
const STEPS_TRACE = ['Fetch · Partner API', 'Transform', 'Import'];
const TX = (i: number) => 150 + i * 400;
const TY = 150;

const Trace: React.FC = () => {
  const f = useCurrentFrame();
  const legs: [number, number][] = [[RUN, RUN + 20], [RUN + 28, HIT]];
  let px = TX(0);
  legs.forEach(([a, b], k) => {
    if (f >= a) px = interpolate(f, [a, b], [TX(k), TX(k + 1)], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  });
  const empty = f >= RUN + 4;
  const broke = f >= HIT;
  const shake = broke ? Math.sin((f - HIT) * 1.6) * 6 * (1 - ease(f, [HIT, HIT + 18], [0, 1])) : 0;
  const tag = (x: number, from: number, text: string, color: string) => {
    const p = ease(f, [from, from + 14], [0, 1], Easing.out(Easing.back(1.6)));
    return f >= from && <div style={{ position: 'absolute', left: x, top: TY - 92, transform: `translateX(-50%) scale(${p})`, padding: '5px 12px', borderRadius: 999, background: C.surface, boxShadow: `0 8px 22px -10px ${color}, 0 0 0 1px ${color}55`, fontSize: 17, fontWeight: 700, color, whiteSpace: 'nowrap' }}>{text}</div>;
  };
  return (
    <div style={{ position: 'relative', width: 1100, height: 262, marginTop: 18, borderRadius: 22, background: C.canvas, border: `1px solid ${C.line}`, opacity: ease(f, [TRACE - 10, TRACE + 6], [0, 1]) }}>
      <div style={{ position: 'absolute', left: 24, top: 18, fontSize: 17, fontWeight: 650, color: C.ink2 }}>Run trace · nightly-sync · 02:10</div>
      <svg width={1100} height={262} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <defs>
          <marker id="trace-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto">
            <path d="M0 0L10 5L0 10z" fill={C.secondary} />
          </marker>
        </defs>
        {[0, 1].map((i) => {
          const p = ease(f, [TRACE + i * 12 + 6, TRACE + i * 12 + 18], [0, 1]);
          const x1 = TX(i) + 52, x2 = TX(i + 1) - 58;
          return p > 0 && <line key={i} x1={x1} y1={TY} x2={x1 + (x2 - x1) * p} y2={TY} stroke={C.secondary} strokeWidth={3.5} strokeLinecap="round" markerEnd={p > 0.95 ? 'url(#trace-arrow)' : undefined} />;
        })}
      </svg>
      {STEPS_TRACE.map((n, i) => {
        const p = ease(f, [TRACE + i * 12, TRACE + i * 12 + 14], [0, 1], Easing.out(Easing.back(1.8)));
        const bad = i === 2 && broke;
        return (
          <div key={n} style={{ position: 'absolute', left: TX(i) - 110, top: TY - 44, width: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transform: `scale(${p}) translateX(${i === 2 ? shake : 0}px)` }}>
            <div style={{ width: 88, height: 88, borderRadius: 22, background: bad ? `linear-gradient(135deg, ${C.danger}, ${C.pink})` : C.surface, border: `2px solid ${bad ? 'transparent' : C.tintLine}`, boxShadow: bad ? `0 0 34px ${C.danger}99` : `0 12px 26px -16px ${C.primary}80`, display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 800, color: bad ? '#fff' : C.primary }}>{['⇣', '{ }', '⇡'][i]}</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: bad ? C.danger : C.ink2, whiteSpace: 'nowrap' }}>{n}</div>
          </div>
        );
      })}
      {f >= RUN && !broke && <div style={{ position: 'absolute', left: px - 11, top: TY - 11, width: 22, height: 22, borderRadius: '50%', boxSizing: 'border-box', background: empty ? C.surface : C.primary, border: `3px solid ${C.secondary}`, boxShadow: `0 0 18px ${C.secondary}` }} />}
      {tag(TX(0), RUN + 4, '200 · empty body', C.warn)}
      {tag(TX(2), HIT, '0 rows · stopped', C.danger)}
    </div>
  );
};

/** Ask in plain words → Thoughts → a streamed answer with the run trace inside it → a confidence chip. */
export const Chat: React.FC = () => {
  const f = useCurrentFrame();
  const asked = f >= SEND + 4;
  const leave = ease(f, [SEND + 4, SEND + 26], [0, 1]);
  const scroll = ease(f, [TRACE - 14, TRACE + 24], [0, 1]) * 150;
  /** While the trace plays the camera leans in on it, so its labels read at full size. */
  const lean = ease(f, [TRACE - 6, TRACE + 40], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <Camera clicks={[{ at: CLICK, ...BOX }, { at: SEND, ...SEND_AT }]}>
      <Window {...WIN} style={{ transformOrigin: '660px 330px', transform: `scale(${1 + 0.25 * lean})` }}>
        {leave < 1 && (
          <div style={{ opacity: 1 - leave, transform: `translateY(${-leave * 40}px)` }}>
            <div style={{ position: 'absolute', left: PAD, top: 110, fontSize: 64, fontWeight: 650, letterSpacing: '-0.035em', color: C.ink }}>Good morning, {BRAND.user}</div>
            <div style={{ position: 'absolute', left: PAD, top: 198, fontSize: 26, color: C.muted }}>What should we look at first?</div>
          </div>
        )}
        {asked && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: COMPOSER.top - 14, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 40px)', maskImage: 'linear-gradient(180deg, transparent 0, #000 40px)' }}>
            <div style={{ position: 'absolute', left: PAD, right: PAD, top: 60 - scroll, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <UserBubble style={{ alignSelf: 'flex-end', opacity: ease(f, [SEND + 6, SEND + 22], [0, 1]) }}>{Q}</UserBubble>
              <Thoughts items={["Read last night's run log", 'Compared it with the last 30 runs', 'Found the empty response']} steps={STEPS} fold={FOLD} />
              {f >= ANSWER - 8 && (
                <Reply note="just now" style={{ opacity: ease(f, [ANSWER - 8, ANSWER + 6], [0, 1]) }}>
                  <Stream text={A} at={ANSWER} step={1.6} hot={['empty', 'response', '0', 'rows', 'third', 'Tuesday']} />
                  {f >= TRACE - 10 && <Trace />}
                  <div style={{ marginTop: 16 }}>{f >= CONF && <Confidence at={CONF} score={92} label="Grounded in run logs" />}</div>
                </Reply>
              )}
            </div>
          </div>
        )}
        <Composer sendAt={SEND} style={{ left: PAD, right: PAD, top: COMPOSER.top, height: COMPOSER.h }}>
          {!asked && f >= TYPE[0] - 20 ? <Typed text={Q} from={TYPE[0]} cpf={Q.length / (TYPE[1] - TYPE[0])} /> : undefined}
        </Composer>
      </Window>
      <Cursor clicks={[CLICK, SEND]} path={[{ f: CLICK - 34, x: 1300, y: 1120 }, { f: CLICK - 3, x: BOX.x + 4, y: BOX.y + 6 }, { f: SEND - 28, x: BOX.x + 4, y: BOX.y + 6 }, { f: SEND - 3, x: SEND_AT.x + 4, y: SEND_AT.y + 6 }]} />
    </Camera>
  );
};
