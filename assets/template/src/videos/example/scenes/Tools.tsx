import React from 'react';
import { useCurrentFrame } from 'remotion';
import { B, C } from '../../../kit/config';
import { NotionLogo, SapLogo, SlackLogo, TeamsLogo } from '../../../kit/logos';
import { Camera, Cursor, ease } from '../../../kit/motion';
import { glass } from '../../../kit/surfaces';
import { ConnectButton } from '../../../kit/ui';
import { AT } from '../timeline';

const ROWS_IN = B(AT.tools) - 6;
/** Three apps connect one after another; the last stays one click away. */
export const CONNECTS = [B(AT.tools + 0.9), B(AT.tools + 1.8), B(AT.tools + 2.7)];
const APPS = [
  { n: 'Notion', s: 'Docs & wikis', logo: <NotionLogo size={40} /> },
  { n: 'Slack', s: 'Ask in any channel', logo: <SlackLogo size={36} /> },
  { n: 'Microsoft Teams', s: 'Approvals & alerts', logo: <TeamsLogo size={40} /> },
  { n: 'SAP', s: 'Business data', logo: <SapLogo height={24} /> },
];
const PANEL = { x: 460, y: 205, w: 1000 };
const btn = (i: number) => ({ x: PANEL.x + PANEL.w - 40 - 22 - 85, y: PANEL.y + 40 + 64 + 26 + i * 104 + 46 });

export const Tools: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Camera clicks={CONNECTS.map((at, i) => ({ at, ...btn(i) }))}>
      <div style={{ position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.w, padding: 40, boxSizing: 'border-box', ...glass(30), background: 'rgba(255,255,255,0.92)' }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>Connect your apps</div>
        <div style={{ fontSize: 20, color: C.muted, marginTop: 4 }}>Your accounts, your tools.</div>
        {APPS.map((a, i) => {
          const p = ease(f, [ROWS_IN + i * 5, ROWS_IN + 18 + i * 5], [0, 1]);
          const live = CONNECTS[i] !== undefined && f >= CONNECTS[i] + 24;
          return (
            <div key={a.n} style={{ marginTop: i ? 12 : 26, height: 92, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px', borderRadius: 20, background: C.surface, border: `1.5px solid ${live ? C.secondary : C.line}`, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
              <span style={{ width: 60, height: 60, borderRadius: 16, border: `1px solid ${C.line}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{a.logo}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 26, fontWeight: 650, color: C.ink }}>{a.n}</div>
                <div style={{ fontSize: 19, color: C.muted }}>{a.s}</div>
              </div>
              <ConnectButton at={CONNECTS[i]} />
            </div>
          );
        })}
      </div>
      <Cursor ring={C.secondary} clicks={CONNECTS} path={[{ f: CONNECTS[0] - 36, x: 1700, y: 1100 }, ...CONNECTS.flatMap((at, i) => [{ f: at - 3, x: btn(i).x + 4, y: btn(i).y + 6 }, { f: at + 10, x: btn(i).x + 4, y: btn(i).y + 6 }])]} />
    </Camera>
  );
};
