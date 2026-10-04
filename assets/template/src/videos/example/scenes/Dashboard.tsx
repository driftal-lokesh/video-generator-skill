import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { B, C } from '../../../kit/config';
import { clamp, ease } from '../../../kit/motion';
import { Window } from '../../../kit/surfaces';
import { Kpi, UserBubble, count } from '../../../kit/ui';
import { AT } from '../timeline';

const K = (beats: number) => B(AT.dash + beats);
export const TILES = [K(0.4), K(0.75), K(1.1), K(1.45)];
export const CHART: [number, number] = [K(1.9), K(3.6)];

const RUNS = [310, 420, 390, 520, 470, 610, 580];
const FAILS = [6, 4, 18, 5, 17, 6, 19];
const fmt = (n: number) => n.toLocaleString('en-US');

/** A dashboard from one sentence: the prompt, four KPI tiles counting up, a chart drawing left → right. */
export const Dashboard: React.FC = () => {
  const f = useCurrentFrame();
  const draw = interpolate(f, CHART, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const W = 1200, H = 240;
  const px = (i: number) => 30 + (i / 6) * (W - 60);
  const ry = (v: number) => H - 10 - (v / 700) * (H - 30);
  const fy = (v: number) => H - 10 - (v / 22) * (H - 30);
  const path = (ys: number[]) => ys.map((y, i) => `${i ? 'L' : 'M'} ${px(i)} ${y}`).join(' ');
  return (
    <Window x={240} y={110} w={1440} h={880}>
      <UserBubble size={22} style={{ position: 'absolute', right: 60, top: 40 }}>Show sync health for the last 30 days</UserBubble>
      <div style={{ position: 'absolute', left: 60, top: 130, fontSize: 30, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em' }}>Sync health · last 30 days</div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 190, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        <Kpi at={TILES[0]} dot={C.primary} label="Runs"><div style={{ marginTop: 18, fontSize: 50, fontWeight: 700, color: C.ink }}>{fmt(count(f, TILES[0], 12480))}</div></Kpi>
        <Kpi at={TILES[1]} dot={C.warn} label="Failure rate"><div style={{ marginTop: 18, fontSize: 50, fontWeight: 700, color: C.ink }}>{(count(f, TILES[1], 320) / 100).toFixed(2)}<span style={{ fontSize: 26, color: C.muted }}> %</span></div></Kpi>
        <Kpi at={TILES[2]} dot={C.danger} label="Failures"><div style={{ marginTop: 18, fontSize: 50, fontWeight: 700, color: C.ink }}>{count(f, TILES[2], 399)}</div></Kpi>
        <Kpi at={TILES[3]} dot={C.warn} label="Partners degraded"><div style={{ marginTop: 18, fontSize: 50, fontWeight: 700, color: C.ink }}>{count(f, TILES[3], 1)}<span style={{ fontSize: 24, color: C.muted }}> of 5</span></div></Kpi>
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 370, borderRadius: 22, background: C.surface, border: `1px solid ${C.line}`, padding: '22px 30px', opacity: ease(f, [CHART[0] - 12, CHART[0] + 8], [0, 1]) }}>
        <div style={{ fontSize: 22, fontWeight: 650, color: C.ink }}>Runs vs failures <span style={{ fontSize: 18, fontWeight: 400, color: C.muted }}>· weekly</span></div>
        <svg width={W} height={H + 30} style={{ marginTop: 10, display: 'block' }}>
          <defs>
            <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.secondary} stopOpacity={0.3} />
              <stop offset="1" stopColor={C.secondary} stopOpacity={0.02} />
            </linearGradient>
            <clipPath id="dash-clip"><rect width={30 + (W - 60) * draw + 4} height={H + 30} /></clipPath>
          </defs>
          {[0, 1, 2, 3].map((g) => <line key={g} x1={30} x2={W - 30} y1={20 + g * ((H - 30) / 3)} y2={20 + g * ((H - 30) / 3)} stroke={C.line} strokeDasharray="4 6" />)}
          <g clipPath="url(#dash-clip)">
            <path d={`${path(RUNS.map(ry))} L ${px(6)} ${H - 10} L ${px(0)} ${H - 10} Z`} fill="url(#dash-area)" />
            <path d={path(RUNS.map(ry))} fill="none" stroke={C.secondary} strokeWidth={3} />
            <path d={path(FAILS.map(fy))} fill="none" stroke={C.pink} strokeWidth={3.5} />
            {FAILS.map((v, i) => <circle key={i} cx={px(i)} cy={fy(v)} r={6} fill={C.surface} stroke={C.pink} strokeWidth={3} />)}
          </g>
        </svg>
      </div>
    </Window>
  );
};
