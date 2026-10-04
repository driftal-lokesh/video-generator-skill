// One source of truth: video.config.json (also read by scripts/music.mjs). Brand, size, music grid.
import cfg from '../../video.config.json';

export const CONFIG = cfg;
export const FPS = cfg.fps;
export const W = cfg.width;
export const H = cfg.height;
export const BRAND = cfg.brand;
/** Brand colours — use these tokens, never new hex values in scenes. */
export const C = cfg.brand.colors;

/** Seconds → frames. */
export const S = (sec: number) => Math.round(sec * FPS);
export const BEAT_S = 60 / cfg.music.bpm;
/** Absolute frame of a beat on the music grid (4 beats a bar). Place every event with this. */
export const B = (beat: number) => Math.round(beat * BEAT_S * FPS);

export const GRAD = `linear-gradient(100deg, ${C.primary} 0%, ${C.secondary} 55%, ${C.accent} 100%)`;
export const BTN = `linear-gradient(180deg, ${C.secondary} 0%, ${C.primary} 60%, ${C.primary} 100%)`;
/** The "done" flood — brand colours, not a stock success green. */
export const DONE_FILL = `linear-gradient(160deg, ${C.secondary} 0%, ${C.primary} 100%)`;
export const SHADOW = `0 30px 80px -30px ${C.primary}52, 0 10px 30px -14px rgba(10, 13, 20, 0.12), 0 0 0 1px ${C.line}`;
