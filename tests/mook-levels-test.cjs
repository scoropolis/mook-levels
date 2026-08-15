const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');

const cwd = process.cwd();
const server = spawn('python3', ['-m', 'http.server', '8891', '--bind', '127.0.0.1'], { cwd, stdio: 'ignore' });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser;

(async () => {
  await wait(450);
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto('http://127.0.0.1:8891/', { waitUntil: 'networkidle' });

  assert.equal(await page.locator('.level-node').count(), 40, 'world map should render 40 levels');
  assert.equal(await page.locator('.level-node.unlocked').count(), 1, 'only level one starts unlocked');
  assert.match(await page.locator('#mapTitle').textContent(), /Green Valley/);

  const configs = await page.evaluate(() => Array.from({ length: 40 }, (_, index) => window.__mookLevels.getLevelConfig(index + 1)));
  for (let stage = 0; stage < 4; stage++) {
    const group = configs.slice(stage * 10, stage * 10 + 10);
    for (let i = 1; i < group.length; i++) {
      assert.ok(group[i].difficulty > group[i - 1].difficulty, `stage ${stage + 1} difficulty should increase`);
    }
  }
  assert.deepEqual(configs[0].mechanics, ['green', 'red']);
  assert.ok(configs[10].mechanics.includes('blue'));
  assert.ok(configs[20].mechanics.includes('yellow'));
  assert.ok(configs[30].mechanics.includes('rock'));
  assert.equal(configs.every(config => config.durationMs === 30000), true);
  assert.equal(configs.every(config => config.greenLifetimeMs === 2000), true, 'green cells should always allow two seconds');
  assert.equal(configs.every(config => config.redLifetimeMs === 2000), true, 'red cells should remain for two seconds');
  assert.equal(configs.every(config => config.blueLifetimeMs === 2000), true, 'blue cells should always allow two seconds');
  assert.equal(configs.every(config => config.yellowLifetimeMs === 3000), true, 'yellow holds should allow three seconds');
  assert.equal(configs.every(config => config.rockLifetimeMs === 4000), true, 'rocks should allow four seconds');

  await page.click('.level-node[data-level="1"]', { force: true });
  let state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.screen, 'game');
  assert.equal(state.level, 1);
  assert.equal(state.onboarding, true);
  assert.equal(state.levelStarted, false);
  assert.equal(state.active.length, 1);
  await page.evaluate(index => window.__mookLevels.tap(index), state.active[0]);
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.levelStarted, true, 'first interaction should start the level timer');

  await page.evaluate(() => window.__mookLevels.finishLevelForTest(true));
  assert.equal(await page.locator('#mapScreen').getAttribute('class'), 'screen map-screen active');
  assert.equal(await page.locator('.level-node[data-level="2"]').getAttribute('class'), 'level-node unlocked current');

  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(11));
  await page.click('.level-node[data-level="11"]', { force: true });
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.onboardingType, 'blue');
  assert.equal(state.blue.length, 1);
  assert.equal(state.levelStarted, false);
  const blue = state.blue[0];
  const swipe = {
    up: [0, -60], right: [60, 0], down: [0, 60], left: [-60, 0]
  }[blue.direction];
  await page.evaluate(({ index, swipe }) => window.__mookLevels.resolveSwipe(index, swipe[0], swipe[1]), { index: blue.index, swipe });
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).levelStarted, true);

  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(21));
  await page.click('.level-node[data-level="21"]', { force: true });
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.onboardingType, 'yellow');
  assert.equal(state.yellow.length, 1);
  await page.evaluate(index => window.__mookLevels.beginHold(index), state.yellow[0]);
  await wait(1100);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).levelStarted, true);

  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(31));
  await page.click('.level-node[data-level="31"]', { force: true });
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.onboardingType, 'rock');
  assert.equal(state.rock.length, 1);
  await page.evaluate(index => {
    window.__mookLevels.hitRock(index);
    window.__mookLevels.hitRock(index);
    window.__mookLevels.hitRock(index);
  }, state.rock[0]);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).levelStarted, true);

  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(20));
  await page.click('.level-node[data-level="20"]', { force: true });
  state = await page.evaluate(() => window.__mookLevels.getState());
  await page.evaluate(index => window.__mookLevels.tap(index), state.active[0]);
  await wait(320);
  await page.evaluate(() => window.__mookLevels.pauseForTest());
  await page.evaluate(() => {
    for (let i = 0; i < 8; i++) window.__mookLevels.spawnForTest('green');
    for (let i = 0; i < 8; i++) window.__mookLevels.spawnForTest(i % 2 ? 'blue' : 'red');
  });
  state = await page.evaluate(() => window.__mookLevels.getState());
  const activeTargetCount = state.active.length + state.red.length + state.blue.length + state.yellow.length + state.rock.length;
  assert.ok(activeTargetCount <= 4, `the board should cap active targets at four, got ${activeTargetCount}`);
  assert.ok(state.active.length <= 3, `the board should cap green targets at three, got ${state.active.length}`);

  await page.evaluate(() => window.__mookLevels.clearTargetsForTest());
  const graceIndex = await page.evaluate(() => window.__mookLevels.spawnForTest('green'));
  await page.evaluate(index => window.__mookLevels.expireForTest('green', index), graceIndex);
  const missesAfterExpiry = (await page.evaluate(() => window.__mookLevels.getState())).misses;
  await page.evaluate(index => window.__mookLevels.tap(index), graceIndex);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).misses, missesAfterExpiry, 'a late tap must not lose a second life');

  console.log(JSON.stringify({ ok: true, levels: configs.length, finalState: state }));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await browser?.close();
  server.kill('SIGTERM');
});
