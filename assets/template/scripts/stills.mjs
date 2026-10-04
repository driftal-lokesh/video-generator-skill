// Render review stills: node scripts/stills.mjs <CompositionId> <frame> [<frame>…] [--png]
// JPEG at half scale into out/stills/ (fast, for contact sheets); --png = full size, for probes.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const png = args.includes('--png');
const [id, ...frames] = args.filter((a) => !a.startsWith('--'));
if (!id || !frames.length) throw new Error('usage: node scripts/stills.mjs <CompositionId> <frame>… [--png]');
const dir = new URL('../out/stills/', import.meta.url).pathname;
mkdirSync(dir, { recursive: true });
const serveUrl = await bundle({ entryPoint: new URL('../src/index.ts', import.meta.url).pathname });
const composition = await selectComposition({ serveUrl, id });
for (const frame of frames.map(Number)) {
  const output = `${dir}f${frame}.${png ? 'png' : 'jpg'}`;
  await renderStill({ serveUrl, composition, frame, output, imageFormat: png ? 'png' : 'jpeg', scale: png ? 1 : 0.5 });
}
console.log(`${frames.length} stills → out/stills/`);
