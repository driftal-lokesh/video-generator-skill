// The example's plan in beats (92 BPM → 1 beat = 0.652 s, a bar = 4 beats). Big moments on bar lines:
// the name at 12, the turn at 44, the lockup at 52 — each after a short silence.
import { B, S } from '../../kit/config';

export const AT = {
  hook: 0,
  reveal: 6,
  chat: 14,
  tDash: 25,
  dash: 27,
  tTools: 33,
  tools: 35,
  tWait: 40,
  first: 44,
  lockup: 52,
  end: 60,
} as const;

export const DURATION = B(AT.end) + S(0.6);
