// Sprawdza, czy tekst każdej sceny mieści się w kadrze z marginesem (DOM, nie piksele).
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); let bad = 0;
  for (const [fmt, W, H, margin] of [['16x9', 1920, 1080, 120], ['9x16', 1080, 1920, 80]]) {
    const page = await b.newPage({ viewport: { width: W, height: H } });
    await page.goto('file://' + path.join(__dirname, `scene.html?fmt=${fmt}`)); await page.evaluate(() => window.ready);
    const scenes = await page.evaluate(() => SCENES.map(s => ({ id: s.id, start: s.start, d: s.d })));
    for (const s of scenes) {
      const r = await page.evaluate(([t, id]) => {
        renderAt(t); const sc = SCENES.find(x => x.id === id);
        const els = [...sc.t.querySelectorAll('.line, .line span')];
        let m = 1e9; for (const e of els) { const q = e.getBoundingClientRect(); if (!q.width) continue; m = Math.min(m, q.left, innerWidth - q.right, q.top, innerHeight - q.bottom); }
        return m;
      }, [s.start + s.d - 2.0, s.id]);
      const ok = r >= margin; if (!ok) bad++;
      console.log(`${fmt} scena ${String(s.id).padStart(2)}: min. margines tekstu ${r.toFixed(0)}px ${ok ? 'OK' : '<<< ZA MAŁO'}`);
    }
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
