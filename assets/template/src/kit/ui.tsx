// UI building blocks for product demos. Rebuild the product's real UI with these (match its layout,
// labels and tokens) — never a generic mock. Every animated block takes absolute frames.
import React from 'react';
import { Easing, useCurrentFrame } from 'remotion';
import { BRAND, BTN, C, DONE_FILL } from './config';
import { ease, lift, press } from './motion';

/** A status dot with a soft halo. */
export const Dot: React.FC<{ color: string; size?: number }> = ({ color, size = 12 }) => (
  <span style={{ width: size, height: size, borderRadius: '50%', background: color, boxShadow: `0 0 0 4px ${color}22`, flexShrink: 0, display: 'inline-block' }} />
);

/** A soft pill: tags, sources, "Live". */
export const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: C.tint, fontSize: 19, fontWeight: 650, color: C.primary, whiteSpace: 'nowrap', ...style }}>{children}</span>
);

/** The user's message. */
export const UserBubble: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 26, style }) => (
  <div style={{ padding: `${size * 0.58}px ${size}px`, borderRadius: `${size}px ${size}px ${size * 0.25}px ${size}px`, background: `linear-gradient(135deg, ${C.secondary} 0%, ${C.primary} 60%)`, color: '#fff', fontSize: size, fontWeight: 500, whiteSpace: 'nowrap', boxShadow: `0 16px 36px -18px ${C.primary}`, ...style }}>{children}</div>
);

/** The product speaking: its name + an "AI" tag + a note, then the message. No mark next to the name in a chat. */
export const Reply: React.FC<{ children: React.ReactNode; note?: string; style?: React.CSSProperties }> = ({ children, note, style }) => (
  <div style={style}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 700, color: C.ink }}>
      {BRAND.name}
      <span style={{ fontSize: 13, fontWeight: 800, color: C.primary, background: C.tint, padding: '2px 8px', borderRadius: 6, letterSpacing: '0.04em' }}>AI</span>
      {note && <span style={{ fontSize: 17, fontWeight: 500, color: C.faint }}>{note}</span>}
    </div>
    <div style={{ marginTop: 6, fontSize: 27, lineHeight: 1.5, color: C.ink2 }}>{children}</div>
  </div>
);

/** The message box: placeholder or typed content, round send button that presses on `sendAt`. */
export const Composer: React.FC<{ children?: React.ReactNode; sendAt?: number; style?: React.CSSProperties }> = ({ children, sendAt = -999, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', borderRadius: 26, border: `1.5px solid ${C.line}`, background: C.surface, boxShadow: `0 18px 40px -26px ${C.primary}59`, boxSizing: 'border-box', ...style }}>
      <div style={{ position: 'absolute', left: 30, top: 26, right: 90, fontSize: 26, color: children ? C.ink : C.faint, whiteSpace: 'nowrap', overflow: 'hidden' }}>{children ?? `Message ${BRAND.name}…`}</div>
      <span style={{ position: 'absolute', right: 16, bottom: 14, width: 54, height: 54, borderRadius: '50%', background: BTN, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 25, fontWeight: 800, boxShadow: `0 10px 22px -8px ${C.primary}`, transform: `translateY(${lift(f, sendAt)}px) scale(${press(f, sendAt)})` }}>↑</span>
    </div>
  );
};

/** "Thoughts": steps tick in at `steps[i]`, then the list folds at `fold` to "Thoughts · N steps". */
export const Thoughts: React.FC<{ items: string[]; steps: number[]; fold: number }> = ({ items, steps, fold }) => {
  const f = useCurrentFrame();
  const k = ease(f, [fold, fold + 16], [0, 1]);
  if (f < steps[0] - 8) return null;
  return (
    <div style={{ opacity: ease(f, [steps[0] - 8, steps[0] + 6], [0, 1]) }}>
      <div style={{ fontSize: 20, fontWeight: 600, color: C.muted }}>
        Thoughts {k > 0.5 ? `· ${items.length} steps` : ''} <span style={{ display: 'inline-block', fontSize: 15, transform: `rotate(${k * -90}deg)` }}>▾</span>
      </div>
      <div style={{ height: items.length * 34 * (1 - k), overflow: 'hidden' }}>
        {items.map((s, i) => {
          const p = ease(f, [steps[i], steps[i] + 12], [0, 1]);
          return (
            <div key={s} style={{ height: 34, display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, color: C.ink2, opacity: p, transform: `translateX(${(1 - p) * 16}px)` }}>
              <span style={{ color: C.primary, fontWeight: 800 }}>✓</span> {s}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** A grounding / confidence chip: the ring fills while the number counts. */
export const Confidence: React.FC<{ at: number; score: number; label: string }> = ({ at, score, label }) => {
  const f = useCurrentFrame();
  const p = ease(f, [at, at + 30], [0, 1]);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 16px 7px 8px', borderRadius: 999, background: C.tint, fontSize: 19, fontWeight: 600, color: C.primary, opacity: ease(f, [at, at + 14], [0, 1]) }}>
      <svg width={28} height={28} viewBox="0 0 36 36">
        <circle cx={18} cy={18} r={14} fill="none" stroke={C.tintLine} strokeWidth={4} />
        <circle cx={18} cy={18} r={14} fill="none" stroke={C.primary} strokeWidth={4} strokeLinecap="round" strokeDasharray={`${88 * (score / 100) * p} 88`} transform="rotate(-90 18 18)" />
      </svg>
      {label} · {Math.round(score * p)}
    </span>
  );
};

/** Approve-style button: on `at` it floods with the brand colour from the click point and flips its label. */
export const LiquidButton: React.FC<{ at: number; x: number; y: number; w: number; h: number; label: string; done: string }> = ({ at, x, y, w, h, label, done }) => {
  const f = useCurrentFrame();
  const r = ease(f, [at, at + 26], [0, Math.hypot(w, h)]);
  const wob = Math.sin(f / 3) * 6;
  return (
    <span style={{ position: 'relative', width: w, height: h, borderRadius: 18, overflow: 'hidden', display: 'grid', placeItems: 'center', background: BTN, color: '#fff', fontSize: 26, fontWeight: 700, flexShrink: 0, boxShadow: `0 14px 30px -14px ${C.primary}`, transform: `translateY(${lift(f, at)}px) scale(${press(f, at)})` }}>
      {f >= at && <span style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, background: DONE_FILL, borderRadius: `${48 + wob}% ${52 - wob}% ${50 + wob}% ${50 - wob}%` }} />}
      {f >= at && <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.28), transparent 55%)', opacity: ease(f, [at + 6, at + 20], [0, 1]) }} />}
      <span style={{ position: 'relative' }}>{f >= at + 8 ? done : label}</span>
    </span>
  );
};

/** Connect → spinner (24 frames) → "✓ Connected" pill. `at` undefined = stays "Connect". */
export const ConnectButton: React.FC<{ at?: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const live = at !== undefined && f >= at + 24;
  const spin = at !== undefined && f >= at + 6 && !live;
  const w = at === undefined || f < at + 4 ? 170 : live ? ease(f, [at + 24, at + 38], [62, 210]) : ease(f, [at + 4, at + 14], [170, 62]);
  return (
    <span style={{ width: w, height: 58, borderRadius: 29, boxSizing: 'border-box', border: live ? 'none' : `2px solid ${C.tintLine}`, background: live ? DONE_FILL : C.surface, color: live ? '#fff' : C.primary, display: 'grid', placeItems: 'center', fontSize: 21, fontWeight: 700, overflow: 'hidden', whiteSpace: 'nowrap', flexShrink: 0, transform: at !== undefined ? `translateY(${lift(f, at)}px) scale(${press(f, at)})` : undefined }}>
      {spin ? <span style={{ width: 26, height: 26, borderRadius: '50%', border: `3.5px solid ${C.tint}`, borderTopColor: C.primary, transform: `rotate(${f * 12}deg)` }} /> : live ? '✓ Connected' : 'Connect'}
    </span>
  );
};

/** "Typing…": three dots bouncing inside the goo filter (mount LiquidDefs once). */
export const TypingDots: React.FC<{ color?: string }> = ({ color = C.primary }) => {
  const f = useCurrentFrame();
  return (
    <span style={{ display: 'inline-flex', gap: 6, padding: '6px 4px', filter: 'url(#goo)' }}>
      {[0, 1, 2].map((i) => <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: color, transform: `translateY(${Math.sin(f / 5 - i * 1.1) * 7}px)` }} />)}
    </span>
  );
};

/** A number counting up from 0 to `to` over 40 frames from `at`. */
export const count = (f: number, at: number, to: number) => Math.round(to * ease(f, [at, at + 40], [0, 1]));

/** A KPI tile that rises in at `at`. Put the value (use `count`) and any chip in children. */
export const Kpi: React.FC<{ at: number; dot: string; label: string; children: React.ReactNode }> = ({ at, dot, label, children }) => {
  const f = useCurrentFrame();
  const p = ease(f, [at, at + 22], [0, 1], Easing.out(Easing.cubic));
  return (
    <div style={{ position: 'relative', height: 150, borderRadius: 22, background: C.surface, border: `1px solid ${C.line}`, boxShadow: `0 16px 40px -28px ${C.primary}66`, padding: '22px 26px', boxSizing: 'border-box', opacity: p, transform: `translateY(${(1 - p) * 26}px) scale(${0.96 + 0.04 * p})` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 21, fontWeight: 600, color: C.ink2 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: dot }} /> {label}
      </div>
      {children}
    </div>
  );
};
