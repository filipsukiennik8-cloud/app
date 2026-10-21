// Renderuje scene.html klatka po klatce (Playwright/Chromium) i koduje do MP4 (ffmpeg).
// Użycie:  node render.js 16x9|9x16 [--preview]   (NODE_PATH ze ścieżką do playwright)
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..');
const fmt = process.argv[2] || '16x9';
const preview = process.argv.includes('--preview');
const [W, H] = fmt === '9x16' ? [1080, 1920] : [1920, 1080];
const FPS = 30;
const out = path.join(ROOT, 'output', `farmintelligence-${fmt}.mp4`);
const prevDir = path.join(ROOT, 'render', 'preview', fmt);

(async () => {
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, `scene.html?fmt=${fmt}`));
  await page.evaluate(() => window.ready);
  const { total, scenes } = await page.evaluate(() => ({ total: TOTAL, scenes: SCENES.map(s => ({ id: s.id, start: s.start, d: s.d })) }));
  console.log(`format ${fmt}, ${W}x${H}, czas ${total}s, ${Math.round(total * FPS)} klatek`);

  if (preview) {
    fs.mkdirSync(prevDir, { recursive: true });
    for (const s of scenes) {
      // 1) środek „trzymania” tekstu, 2) środek przejścia do następnej sceny
      const shots = { hold: s.start + s.d - 3.0, fade: s.start + s.d - 0.5 };
      for (const [k, t] of Object.entries(shots)) {
        await page.evaluate(t => renderAt(t), Math.min(t, total - 0.05));
        await page.screenshot({ path: path.join(prevDir, `s${String(s.id).padStart(2, '0')}-${k}.png`) });
      }
    }
    await browser.close(); return;
  }

  fs.mkdirSync(path.dirname(out), { recursive: true });
  const audioDir = path.join(ROOT, 'audio');
  const audio = fs.existsSync(audioDir) ? fs.readdirSync(audioDir).find(f => /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(f)) : null;
  const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-'];
  if (audio) args.push('-i', path.join(audioDir, audio), '-af', `afade=t=out:st=${total - 2.5}:d=2.5`, '-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push('-t', String(total), '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out);
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise(r => ff.on('close', r));
  const n = Math.round(total * FPS);
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => renderAt(t), i / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`${fmt}: klatka ${i}/${n}`);
  }
  ff.stdin.end(); await done; await browser.close();
  console.log('gotowe:', out, audio ? `(audio: ${audio})` : '(bez muzyki)');
})();
