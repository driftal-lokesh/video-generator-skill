import React from 'react';
import { Composition } from 'remotion';
import { FPS, H, W } from './kit/config';
import { Example } from './videos/example/Video';
import { DURATION as EXAMPLE } from './videos/example/timeline';

// One <Composition> per video. New videos: copy src/videos/example → src/videos/<slug>, register it here.
export const Root: React.FC = () => (
  <>
    <Composition id="Example" component={Example} durationInFrames={EXAMPLE} fps={FPS} width={W} height={H} />
  </>
);
