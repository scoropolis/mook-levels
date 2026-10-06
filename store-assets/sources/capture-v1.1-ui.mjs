import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const project = '/Users/pointform/Projects/mook-levels';
const root = path.join(project, 'store-assets');
const index = await fs.readFile(path.join(project, 'index.html'));
const server = http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(index); });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const devices = [
  { key: 'iphone-6.9', viewport: { width: 440, height: 956 }, scale: 3 },
  { key: 'ipad-13', viewport: { width: 1032, height: 1376 }, scale: 2 },
];
const prices = {
  'com.skygardenapps.mookworlds.power.sky.5': '$0.99', 'com.skygardenapps.mookworlds.power.sun.5': '$0.99',
  'com.skygardenapps.mookworlds.power.rock.5': '$0.99', 'com.skygardenapps.mookworlds.power.time.5': '$0.99',
  'com.skygardenapps.mookworlds.power.bundle.12': '$1.99', 'com.skygardenapps.mookworlds.removeads': '$2.99',
};
async function open(device, commerce = false) {
  const context = await browser.newContext({ viewport: device.viewport, deviceScaleFactor: device.scale, colorScheme: 'light' });
  if (commerce) await context.addInitScript(productPrices => { window.Capacitor = { Plugins: { MookCommerce: { getProducts: async ({ ids }) => ({ products: ids.map(id => ({ id, displayPrice: productPrices[id] })), removeAds: false, pending: [] }), purchase: async () => ({ cancelled: true, deliveries: [] }), restore: async () => ({ removeAds: false, pending: [] }) } } }; }, prices);
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
  await page.evaluate(() => window.__mookLevels.setInventoryForTest({ sky: 8, sun: 6, rock: 5, time: 7 }));
  return { context, page };
}
for (const device of devices) {
  const out = path.join(root, 'raw-captures/ios', device.key, 'en-US');
  await fs.mkdir(out, { recursive: true });
  let session = await open(device); await session.page.screenshot({ path: path.join(out, '01-world-map.png') }); await session.context.close();
  session = await open(device); await session.page.evaluate(() => window.__mookLevels.selectLevel(1)); await session.page.screenshot({ path: path.join(out, '02-level-ready.png') }); await session.context.close();
  session = await open(device); await session.page.evaluate(() => { window.__mookLevels.unlockThroughForTest(68); window.__mookLevels.selectLevel(68); }); await session.page.click('#introStart'); await session.page.evaluate(() => { window.__mookLevels.clearTargetsForTest(); ['green','blue','yellow','rock','purple'].forEach(type => window.__mookLevels.spawnForTest(type)); window.__mookLevels.pauseForTest(); }); await session.page.screenshot({ path: path.join(out, '03-gameplay-mix.png') }); await session.context.close();
  session = await open(device, true); await session.page.click('#storeButton'); await session.page.screenshot({ path: path.join(out, '04-store.png') }); await session.context.close();
  session = await open(device); await session.page.evaluate(() => { window.__mookLevels.unlockThroughForTest(51); window.__mookLevels.selectEndless(); }); await session.page.screenshot({ path: path.join(out, '05-endless-ready.png') }); await session.context.close();
}
await browser.close(); await new Promise(resolve => server.close(resolve));
