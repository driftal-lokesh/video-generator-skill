// Audio-only fix: re-render just the soundtrack of a composition and swap it into an existing render,
// then refresh the share copy. node scripts/remux.mjs <CompositionId> out/video.mp4
// (Minutes instead of a full re-render — use it whenever only cue volumes / music envelopes changed.)
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import { renameSync } from 'node:fs';

const [id, video] = process.argv.slice(2);
if (!id || !video) throw new Error('usage: node scripts/remux.mjs <CompositionId> <render.mp4>');
const wav = video.replace(/\.mp4$/, '-audio.wav');
const serveUrl = await bundle({ entryPoint: new URL('../src/index.ts', import.meta.url).pathname });
const composition = await selectComposition({ serveUrl, id });
// codec 'wav' renders audio only; it must not inherit the video CRF from remotion.config.ts
await renderMedia({ serveUrl, composition, codec: 'wav', outputLocation: wav });
const tmp = video.replace(/\.mp4$/, '-mux.mp4');
execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-v', 'error', '-i', video, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-shortest', tmp], { stdio: 'inherit' });
renameSync(tmp, video);
execFileSync('node', [new URL('./share.mjs', import.meta.url).pathname, video], { stdio: 'inherit' });
console.log('new soundtrack in', video);
