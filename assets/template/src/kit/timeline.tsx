// A video as a list: each item is fully on screen at its beat, its transition starts `lead` frames
// earlier, and it runs until the next item is fully in. Scenes get the absolute frame (Abs), so one
// scene component can appear as several items and its state just continues.
import React from 'react';
import { TransitionSeries } from '@remotion/transitions';
import { B } from './config';
import { Abs } from './motion';
import type { Enter } from './transitions';

export type Item = { at: number; C: React.FC; enter?: Enter };

const lead = (e?: Enter) => (e ? e.timing.getDurationInFrames({ fps: 60 }) : 0);

export const Timeline: React.FC<{ items: Item[]; duration: number }> = ({ items, duration }) => {
  const start = (i: number) => B(items[i].at) - lead(items[i].enter);
  const length = (i: number) => (items[i + 1] ? B(items[i + 1].at) : duration) - start(i);
  return (
    <TransitionSeries>
      {items.flatMap(({ C, enter }, i) => [
        ...(enter ? [<TransitionSeries.Transition key={`t${i}`} presentation={enter.presentation} timing={enter.timing} />] : []),
        <TransitionSeries.Sequence key={i} durationInFrames={length(i)}>
          <Abs start={start(i)}>
            <C />
          </Abs>
        </TransitionSeries.Sequence>,
      ])}
    </TransitionSeries>
  );
};
