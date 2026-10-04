// A smaller copy for sharing (phones, chat): node scripts/share.mjs out/video.mp4 → out/video-share.mp4
// CRF 21 keeps it under ~30 MB for 90 s at 1080p60, which is what file sharing to remote viewers allows.
import { execFileSync } from 'node:child_process';

const input = process.argv[2];
if (!input) throw new Error('usage: node scripts/share.mjs <file.mp4>');
const out = input.replace(/\.mp4$/, '-share.mp4');
execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-v', 'error', '-i', input, '-c:v', 'libx264', '-crf', '21', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log('→', out);
