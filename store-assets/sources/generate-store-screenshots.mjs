import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/pointform/Projects/mook-levels/store-assets';
const devices = [
  { key: 'iphone-6.9', label: 'iPhone 6.9-inch', width: 1320, height: 2868, screenWidth: 860 },
  { key: 'ipad-13', label: 'iPad 13-inch', width: 2064, height: 2752, screenWidth: 1260 },
];
const frames = [
  { n: '01', slug: 'seven-worlds', headline: 'Seven worlds.\nSeventy challenges.', support: 'A colorful arcade journey where every world changes the rules.', capture: '01-world-map.png', accent: '#ffd35a' },
  { n: '02', slug: 'power-up-your-run', headline: 'Power up\nyour next run.', support: 'Equip optional assists from your saved inventory before you play.', capture: '02-level-ready.png', accent: '#61e7ca' },
  { n: '03', slug: 'react-your-way', headline: 'Tap. Swipe.\nHold. Break.', support: 'Read the board fast and master six evolving mechanics.', capture: '03-gameplay-mix.png', accent: '#ff806f' },
  { n: '04', slug: 'stock-your-inventory', headline: 'Choose the boost\nthat fits your run.', support: 'Earn power-ups through play or add optional packs in the Mook Store.', capture: '04-store.png', accent: '#ffd35a' },
  { n: '05', slug: 'endless-play', headline: 'Go farther in\nEndless Play.', support: 'Survive escalating rules, bank checkpoints, and chase a new high score.', capture: '05-endless-ready.png', accent: '#86a7ff' },
];
const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });

for (const device of devices) {
  const raw = path.join(root, 'raw-captures/ios', device.key, 'en-US');
  const out = path.join(root, 'exports/apple', device.key, 'en-US');
  await fs.mkdir(out, { recursive: true });
  for (const frame of frames) {
    const page = await browser.newPage({ viewport: { width: device.width, height: device.height }, deviceScaleFactor: 1 });
    const captureBytes = await fs.readFile(path.join(raw, frame.capture));
    const capture = `data:image/png;base64,${captureBytes.toString('base64')}`;
    const isPhone = device.key === 'iphone-6.9';
    const padding = isPhone ? 23 : 26;
    const screenHeight = Math.round((device.screenWidth - 2 * padding) * device.height / device.width + 2 * padding);
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
      *{box-sizing:border-box}html,body{margin:0;width:${device.width}px;height:${device.height}px;overflow:hidden}body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display",Arial,sans-serif;color:#fff;background:#071a2e}
      .canvas{position:relative;width:100%;height:100%;overflow:hidden;background:radial-gradient(circle at 82% 8%,${frame.accent}44 0 4%,transparent 24%),radial-gradient(circle at 12% 62%,#35c9b238 0 5%,transparent 31%),linear-gradient(160deg,#061426 0%,#0a2440 58%,#071426 100%)}
      .grain{position:absolute;inset:0;opacity:.12;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E")}
      .brand{position:absolute;top:84px;left:${isPhone ? 88 : 150}px;display:flex;align-items:center;gap:20px;font-weight:900;font-size:${isPhone ? 36 : 42}px}.mark{width:56px;height:56px;border-radius:18px;background:${frame.accent};box-shadow:0 0 34px ${frame.accent}99;display:grid;place-items:center;color:#071426;font-size:28px}
      .copy{position:absolute;z-index:4;top:205px;left:${isPhone ? 88 : 150}px;right:${isPhone ? 88 : 150}px}.copy h1{margin:0;font-size:${isPhone ? 106 : 126}px;line-height:.95;letter-spacing:-5px;font-weight:950}.copy p{margin:30px 0 0;max-width:${isPhone ? 1040 : 1500}px;font-size:${isPhone ? 38 : 44}px;line-height:1.3;color:#dce9f4;font-weight:560}
      .device{position:absolute;z-index:3;top:${isPhone ? 785 : 720}px;left:50%;width:${device.screenWidth}px;height:${screenHeight}px;transform:translateX(-50%);border-radius:${isPhone ? 96 : 68}px;padding:${padding}px;background:linear-gradient(150deg,#f8fbff,#6f7f92 34%,#101a27 55%,#d8e1e9);box-shadow:0 70px 120px #000a,0 0 0 3px #fff5}
      .screen{width:100%;height:100%;overflow:hidden;border-radius:${isPhone ? 74 : 46}px;background:#65d6c5}.screen img{display:block;width:100%;height:100%;object-fit:contain}
      .footer{position:absolute;z-index:6;bottom:38px;left:0;right:0;text-align:center;color:#9fb2c3;font-weight:750;font-size:${isPhone ? 24 : 27}px;letter-spacing:1.5px}
    </style></head><body><main class="canvas"><div class="grain"></div><div class="brand"><span class="mark">M</span>Mook Worlds</div><section class="copy"><h1>${frame.headline.split('\n').map(esc).join('<br>')}</h1><p>${esc(frame.support)}</p></section><div class="device"><div class="screen"><img src="${capture}" alt=""></div></div><div class="footer">MOOK WORLDS · VERSION 1.1</div></main></body></html>`, { waitUntil: 'load' });
    await page.screenshot({ path: path.join(out, `apple-${device.key.replace('.', '')}-en-US-${frame.n}-${frame.slug}-${device.width}x${device.height}.jpg`), type: 'jpeg', quality: 95 });
    await page.close();
  }
}

for (const device of devices) {
  const page = await browser.newPage({ viewport: { width: 1800, height: 1240 }, deviceScaleFactor: 1 });
  const out = path.join(root, 'exports/apple', device.key, 'en-US');
  const cards = [];
  for (const frame of frames) {
    const name = `apple-${device.key.replace('.', '')}-en-US-${frame.n}-${frame.slug}-${device.width}x${device.height}.jpg`;
    const bytes = await fs.readFile(path.join(out, name));
    cards.push(`<figure><img src="data:image/jpeg;base64,${bytes.toString('base64')}"><figcaption>${frame.n} · ${esc(frame.slug.replaceAll('-', ' '))}</figcaption></figure>`);
  }
  await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;padding:40px;background:#eef3f6;color:#172838;font:700 22px -apple-system,BlinkMacSystemFont,sans-serif}h1{margin:0 0 28px;font-size:34px}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:24px}figure{margin:0;padding:14px;border-radius:18px;background:white;box-shadow:0 10px 30px #17304720}img{display:block;width:100%;height:960px;object-fit:contain;background:#071a2e;border-radius:10px}figcaption{padding:12px 3px 2px;text-transform:capitalize;font-size:16px}</style><h1>Mook Worlds 1.1 · ${device.label} · en-US</h1><div class="grid">${cards.join('')}</div>`);
  await page.screenshot({ path: path.join(root, 'contact-sheets', `mook-worlds-ios-en-US-v1.1-${device.key}.jpg`), type: 'jpeg', quality: 92 });
  await page.close();
}
await browser.close();
