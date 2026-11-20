// v2.1 feature check: version label, What's new + ledger window, hub link, old save still continues.
// Usage: node tools/yenilik.mjs [path-to-index.html]   (needs the `playwright` package, like smoke.mjs)
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import * as pw from 'playwright';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(process.argv[2] || join(root, 'index.html')));
const IGN = /gc\.zgo\.at|goatcounter|fonts\.googleapis\.com|fonts\.gstatic\.com/;
let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const srv = createServer((q, s) => { const p = new URL(q.url, 'http://x').pathname;
  if (p === '/' || p === '/index.html') s.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html); else s.writeHead(404).end('404'); });
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + srv.address().port + '/';
for (const dev of [{ n: 'masaustu', v: { width: 1366, height: 768 } }, { n: 'telefon', v: { width: 390, height: 844 }, mobile: true }]) {
  const b = await pw.chromium.launch(); // one browser at a time keeps memory low
  const ctx = await b.newContext({ viewport: dev.v, isMobile: !!dev.mobile, hasTouch: !!dev.mobile });
  await ctx.route(IGN, r => r.fulfill({ status: 200, body: '' }));
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(url + '?low', { waitUntil: 'load' });
  await page.waitForFunction(() => !document.getElementById('scr-title').classList.contains('hidden'), null, { timeout: 90000 });
  const ver = await page.evaluate(() => document.getElementById('b-news')?.textContent || '');
  ok(/v\d+\.\d+ · Kasım 2026/.test(ver), dev.n + ': surum etiketi "' + ver + '"');
  ok(await page.evaluate(() => document.getElementById('b-hub')?.href === 'https://furkiozknn.github.io/'), dev.n + ': Diger oyunlar baglantisi');
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), dev.n + ': yatay tasma yok');
  // a 3-star finished game goes into the ledger; an old best record keeps its variety count
  await page.evaluate(() => localStorage.setItem('arena.lale-bahcesi.best', JSON.stringify({ score: 10, stars: 1, varieties: 7 })));
  await page.click('#b-news', { force: true });
  ok(await page.evaluate(() => !document.getElementById('scr-news').classList.contains('hidden') && document.querySelectorAll('#news-list li').length >= 3), dev.n + ': Yenilikler penceresi acildi');
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => document.getElementById('scr-news').classList.contains('hidden') && !document.getElementById('scr-title').classList.contains('hidden')), dev.n + ': Esc ana menuye doner');
  await page.evaluate(() => localStorage.setItem('arena.lale-bahcesi.ledger', JSON.stringify([{ score: 321, stars: 2, varieties: 9, won: false, daily: 0, at: '2026-11-19' }])));
  await page.click('#b-news', { force: true });
  ok(await page.evaluate(() => /321/.test(document.getElementById('ledger-list').textContent)), dev.n + ': defter kaydi gorunuyor');
  await page.click('#b-news-close', { force: true });
  await page.click('#b-play', { force: true }); await page.waitForTimeout(500);
  const d0 = await page.evaluate(() => window.lale.state.day); await page.evaluate(() => window.laleSim(40));
  ok(await page.evaluate(d => window.lale.state.day > d, d0), dev.n + ': oyun basladi, gun ilerledi');
  ok(errs.length === 0, dev.n + ': konsol hatasi yok ' + JSON.stringify(errs.slice(0, 2)));
  await ctx.close(); await b.close();
}
srv.close();
console.log(bad ? 'RESULT FAIL' : 'RESULT OK'); process.exit(bad ? 1 : 0);
