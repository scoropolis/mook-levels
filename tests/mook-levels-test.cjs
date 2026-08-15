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

  assert.equal(await page.locator('.level-node').count(), 50, 'world map should render 50 levels');
  assert.equal(await page.locator('.level-node.unlocked').count(), 1, 'only level one starts unlocked');
  assert.match(await page.locator('#mapTitle').textContent(), /Green Valley/);

  const configs = await page.evaluate(() => Array.from({ length: 50 }, (_, index) => window.__mookLevels.getLevelConfig(index + 1)));
  for (let stage = 0; stage < 5; stage++) {
    const group = configs.slice(stage * 10, stage * 10 + 10);
    for (let i = 1; i < group.length; i++) {
      assert.ok(group[i].difficulty > group[i - 1].difficulty, `stage ${stage + 1} difficulty should increase`);
    }
  }
  assert.deepEqual(configs[0].mechanics, ['green', 'red']);
  assert.ok(configs[10].mechanics.includes('blue'));
  assert.ok(configs[20].mechanics.includes('yellow'));
  assert.ok(configs[30].mechanics.includes('rock'));
  assert.ok(configs[40].mechanics.includes('purple'));
  assert.equal(configs.every(config => config.durationMs === 30000), true);
  assert.equal(configs.every(config => config.greenLifetimeMs === 2000), true, 'green cells should always allow two seconds');
  assert.equal(configs.every(config => config.redLifetimeMs === 2000), true, 'red cells should remain for two seconds');
  assert.equal(configs.every(config => config.blueLifetimeMs === 2000), true, 'blue cells should always allow two seconds');
  assert.equal(configs.every(config => config.yellowLifetimeMs === 3000), true, 'yellow holds should allow three seconds');
  assert.equal(configs.every(config => config.rockLifetimeMs === 4000), true, 'rocks should allow four seconds');
  assert.equal(configs.slice(0, 10).every(config => config.openingType === 'green'), true);
  assert.equal(configs.slice(10, 20).every(config => config.openingType === 'blue'), true);
  assert.equal(configs.slice(20, 30).every(config => config.openingType === 'yellow'), true);
  assert.equal(configs.slice(30, 40).every(config => config.openingType === 'rock'), true);
  assert.equal(configs.slice(40, 50).every(config => config.openingType === 'purple'), true);
  assert.equal(configs.slice(40, 50).every(config => config.purpleLifetimeMs === 1000), true);
  assert.equal(configs.slice(30, 34).every(config => config.rockMinHits === 3 && config.rockMaxHits === 3), true);
  assert.equal(configs.slice(34, 39).every(config => config.rockMinHits === 2 && config.rockMaxHits === 4), true);
  assert.equal(configs[39].rockMinHits, 2);
  assert.equal(configs[39].rockMaxHits, 5);

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
  await wait(1300);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).levelStarted, true);
  await wait(320);
  await page.evaluate(() => {
    window.__mookLevels.pauseForTest();
    window.__mookLevels.clearTargetsForTest();
  });
  const regularYellow = await page.evaluate(() => window.__mookLevels.spawnForTest('yellow'));
  const regularYellowStyle = await page.evaluate(index => {
    const cell = document.querySelectorAll('.cell')[index];
    return { className: cell.className, before: getComputedStyle(cell, '::before').content };
  }, regularYellow);
  assert.equal(regularYellowStyle.className, 'cell yellow');
  assert.ok(regularYellowStyle.before === 'none' || regularYellowStyle.before === 'normal', `regular yellow should have no HOLD label, got ${regularYellowStyle.before}`);

  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(31));
  await page.click('.level-node[data-level="31"]', { force: true });
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.onboardingType, 'rock');
  assert.equal(state.rock.length, 1);
  assert.equal(state.rock[0].hits, 3);
  await page.evaluate(index => {
    window.__mookLevels.hitRock(index);
    window.__mookLevels.hitRock(index);
    window.__mookLevels.hitRock(index);
  }, state.rock[0].index);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).levelStarted, true);

  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(20));
  await page.click('.level-node[data-level="20"]', { force: true });
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.onboardingType, 'blue');
  const openingBlue = state.blue[0];
  const openingSwipe = { up:[0,-60], right:[60,0], down:[0,60], left:[-60,0] }[openingBlue.direction];
  await page.evaluate(({ blue, swipe }) => window.__mookLevels.resolveSwipe(blue.index, swipe[0], swipe[1]), { blue: openingBlue, swipe: openingSwipe });
  await wait(320);
  await page.evaluate(() => window.__mookLevels.pauseForTest());
  await page.evaluate(() => {
    for (let i = 0; i < 8; i++) window.__mookLevels.spawnForTest('green');
    for (let i = 0; i < 8; i++) window.__mookLevels.spawnForTest(i % 2 ? 'blue' : 'red');
  });
  state = await page.evaluate(() => window.__mookLevels.getState());
  const activeTargetCount = state.active.length + state.red.length + state.blue.length + state.yellow.length + state.rock.length + state.purple.length;
  assert.ok(activeTargetCount <= 4, `the board should cap active targets at four, got ${activeTargetCount}`);
  assert.ok(state.active.length <= 3, `the board should cap green targets at three, got ${state.active.length}`);

  await page.evaluate(() => window.__mookLevels.clearTargetsForTest());
  const graceIndex = await page.evaluate(() => window.__mookLevels.spawnForTest('green'));
  await page.evaluate(index => window.__mookLevels.expireForTest('green', index), graceIndex);
  const missesAfterExpiry = (await page.evaluate(() => window.__mookLevels.getState())).misses;
  await page.evaluate(index => window.__mookLevels.tap(index), graceIndex);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).misses, missesAfterExpiry, 'a late tap must not lose a second life');

  async function sampleRockHits(level, count) {
    await page.evaluate(() => window.__mookLevels.returnToMap());
    await page.evaluate(level => window.__mookLevels.unlockThroughForTest(level), level);
    await page.click(`.level-node[data-level="${level}"]`, { force: true });
    let opening = (await page.evaluate(() => window.__mookLevels.getState())).rock[0];
    assert.equal(opening.hits, 3, `level ${level} should still open with a three-hit tutorial rock`);
    await page.evaluate(index => {
      window.__mookLevels.hitRock(index); window.__mookLevels.hitRock(index); window.__mookLevels.hitRock(index);
    }, opening.index);
    await wait(320);
    await page.evaluate(() => window.__mookLevels.pauseForTest());
    const hits = [];
    for (let i = 0; i < count; i++) {
      await page.evaluate(() => window.__mookLevels.clearTargetsForTest());
      await page.evaluate(() => window.__mookLevels.spawnForTest('rock'));
      hits.push((await page.evaluate(() => window.__mookLevels.getState())).rock[0].hits);
    }
    return hits;
  }
  const midWorldRocks = await sampleRockHits(35, 20);
  assert.equal(midWorldRocks.every(hits => hits >= 2 && hits <= 4), true);
  const finalWorldRocks = await sampleRockHits(40, 30);
  assert.equal(finalWorldRocks.every(hits => hits >= 2 && hits <= 5), true);

  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(41));
  await page.click('.level-node[data-level="41"]', { force: true });
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.onboardingType, 'purple');
  assert.equal(state.levelStarted, false);
  assert.equal(state.purple.length, 1);
  await page.evaluate(index => window.__mookLevels.tap(index), state.purple[0]);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).levelStarted, true);
  await wait(320);
  await page.evaluate(() => {
    window.__mookLevels.pauseForTest();
    window.__mookLevels.clearTargetsForTest();
    window.__mookLevels.spawnForTest('purple');
  });
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.purple.length, 1);
  const missesBeforePurpleExpiry = state.misses;
  await wait(1300);
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.purple.length, 0);
  assert.equal(state.misses, missesBeforePurpleExpiry + 1, 'a regular purple target should expire after one second');

  console.log(JSON.stringify({ ok: true, levels: configs.length, finalState: state }));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await browser?.close();
  server.kill('SIGTERM');
});
