import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/pointform/Projects/mook-levels/store-assets';
const raw = path.join(root, 'raw-captures/ios/iphone-6.5/en-US');
const out = path.join(root, 'exports/apple/iphone-6.5/en-US');
await fs.mkdir(out, { recursive: true });

const frames = [
  { n: '01', slug: 'seventy-level-adventure', headline: 'Seventy levels.\nSeven wild worlds.', support: 'A fast arcade journey that keeps changing the rules.', capture: '01-world-map.png', accent: '#ffd35a', mode: 'map' },
  { n: '02', slug: 'new-rules-every-world', headline: 'Every world\nchanges the game.', support: 'Master new targets, timing, and twists as you advance.', capture: '02-level-ready.png', accent: '#61e7ca', mode: 'orbit' },
  { n: '03', slug: 'tap-swipe-hold-break', headline: 'Tap. Swipe.\nHold. Break.', support: 'Read the board fast and react before time runs out.', capture: '03-gameplay-mix.png', accent: '#ff806f', mode: 'action' },
  { n: '04', slug: 'earn-four-stars', headline: 'Chase the\nfour-star clear.', support: 'Sharpen every run and turn clean reactions into rewards.', capture: '04-level-clear.png', accent: '#ffd35a', mode: 'reward' },
  { n: '05', slug: 'play-anywhere', headline: 'Your whole journey.\nAlways with you.', support: 'Play offline. No account, ads, or purchases in version 1.0.', capture: '05-seven-worlds.png', accent: '#86a7ff', mode: 'calm' },
];

const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
for (const frame of frames) {
  const page = await browser.newPage({ viewport: { width: 1242, height: 2688 }, deviceScaleFactor: 1 });
  const captureBytes = await fs.readFile(path.join(raw, frame.capture));
  const capture = `data:image/png;base64,${captureBytes.toString('base64')}`;
  const lines = frame.headline.split('\n').map(esc).join('<br>');
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}html,body{margin:0;width:1242px;height:2688px;overflow:hidden}body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display",Arial,sans-serif;color:#fff;background:#071a2e}
    .canvas{position:relative;width:1242px;height:2688px;overflow:hidden;background:
      radial-gradient(circle at 82% 8%, ${frame.accent}44 0 4%, transparent 24%),
      radial-gradient(circle at 12% 62%, #35c9b238 0 5%, transparent 31%),
      linear-gradient(160deg,#061426 0%,#0a2440 58%,#071426 100%)}
    .grain{position:absolute;inset:0;opacity:.14;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E")}
    .planet{position:absolute;border-radius:50%;filter:drop-shadow(0 30px 45px #0008)}.p1{width:320px;height:320px;right:-90px;top:780px;background:radial-gradient(circle at 35% 30%,#fff6 0 3%,transparent 5%),linear-gradient(145deg,${frame.accent},#f06a65)}.p2{width:140px;height:140px;left:55px;top:990px;background:linear-gradient(145deg,#55e7c2,#1a7ba5)}
    .orbitline{position:absolute;width:670px;height:300px;border:4px solid #ffffff25;border-radius:50%;right:-290px;top:775px;transform:rotate(-18deg)}
    .brand{position:absolute;top:92px;left:88px;display:flex;align-items:center;gap:20px;font-weight:900;font-size:37px;letter-spacing:.5px}.mark{width:52px;height:52px;border-radius:18px;background:${frame.accent};box-shadow:0 0 34px ${frame.accent}99;display:grid;place-items:center;color:#071426;font-size:28px}
    .copy{position:absolute;z-index:4;top:220px;left:88px;right:75px}.copy h1{margin:0;font-size:106px;line-height:.95;letter-spacing:-5px;font-weight:950;text-wrap:balance}.copy p{margin:34px 0 0;max-width:900px;font-size:39px;line-height:1.3;color:#dce9f4;font-weight:560}.accent{color:${frame.accent}}
    .stage{position:absolute;z-index:3;left:105px;right:105px;top:900px;height:1870px;perspective:1800px}.phone{position:absolute;left:50%;width:820px;height:1782px;border-radius:104px;padding:23px;background:linear-gradient(150deg,#f8fbff,#6f7f92 34%,#101a27 55%,#d8e1e9);box-shadow:0 70px 120px #000a,0 0 0 3px #fff5;overflow:hidden}.screen{width:100%;height:100%;border-radius:82px;overflow:hidden;background:#fff;position:relative}.screen:before{content:'';position:absolute;z-index:4;top:18px;left:50%;transform:translateX(-50%);width:240px;height:65px;border-radius:36px;background:#07101a}.screen img{width:100%;height:100%;object-fit:cover;display:block}
    .map .phone{transform:translateX(-50%) rotate(-3deg)}.orbit .phone{transform:translateX(-50%) rotate(4deg);width:790px}.action .phone{transform:translateX(-50%) rotate(-2deg);top:-30px}.reward .phone{transform:translateX(-50%) rotate(3deg);width:805px}.calm .phone{transform:translateX(-50%) rotate(-1deg)}
    .chip{position:absolute;z-index:5;padding:18px 27px;border-radius:999px;background:#ffffffeb;color:#132438;font-size:28px;font-weight:850;box-shadow:0 18px 40px #0005}.chip.one{left:28px;top:1270px;transform:rotate(-8deg)}.chip.two{right:4px;top:1540px;transform:rotate(7deg);background:${frame.accent};color:#071426}
    .footer{position:absolute;z-index:6;bottom:48px;left:0;right:0;text-align:center;color:#9fb2c3;font-weight:700;font-size:24px;letter-spacing:1.5px}
  </style></head><body><main class="canvas ${frame.mode}"><div class="grain"></div><div class="orbitline"></div><div class="planet p1"></div><div class="planet p2"></div><div class="brand"><span class="mark">M</span>Mook Worlds</div><section class="copy"><h1>${lines}</h1><p>${esc(frame.support)}</p></section><section class="stage"><div class="phone"><div class="screen"><img src="${capture}"></div></div><div class="chip one">70 handcrafted levels</div><div class="chip two">Play offline</div></section><div class="footer">MOOK WORLDS · VERSION 1.0</div></main></body></html>`, { waitUntil: 'load' });
  await page.screenshot({ path: path.join(out, `apple-iphone65-en-US-${frame.n}-${frame.slug}-1242x2688.jpg`), type: 'jpeg', quality: 95 });
  await page.close();
}
await browser.close();
