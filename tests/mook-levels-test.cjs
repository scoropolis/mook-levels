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
  await page.addInitScript(() => {
    window.__vibrations = [];
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: pattern => { window.__vibrations.push(pattern); return true; } });
  });
  await page.goto('http://127.0.0.1:8891/', { waitUntil: 'networkidle' });

  assert.equal(await page.locator('#titleScreen').getAttribute('class'), 'screen title-screen active');
  for (const legalPage of ['support.html','privacy.html']) {
    const legal = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await legal.goto(`http://127.0.0.1:8891/${legalPage}`, { waitUntil: 'networkidle' });
    assert.equal(await legal.locator('.back').textContent(), '‹ Back to Mook Worlds');
    assert.equal(await legal.locator('.back').getAttribute('href'), 'index.html');
    await legal.close();
  }
  assert.deepEqual(await page.locator('.title-option').allTextContents(), ['Mook WorldsContinue the world journey','Endless Play100 ★ to unlock'], 'the title screen has exactly two primary options');
  assert.equal(await page.locator('#endlessButton').isDisabled(), true);
  assert.match(await page.locator('#endlessButton').getAttribute('aria-label'), /locked.*100 stars/);
  for (const starCase of [{total:99,remaining:'1 ★ to unlock',enabled:false},{total:100,remaining:'Unlocked · 100 ★ earned',enabled:true},{total:104,remaining:'Unlocked · 104 ★ earned',enabled:true}]) {
    const starPage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await starPage.addInitScript(total => {const scores={};let remaining=total;for(let level=1;remaining>0;level+=1){scores[level]=Math.min(4,remaining);remaining-=scores[level];}localStorage.setItem('mook-worlds-stars',JSON.stringify(scores));}, starCase.total);
    await starPage.goto('http://127.0.0.1:8891/', { waitUntil: 'networkidle' });
    const starState=await starPage.evaluate(() => window.__mookLevels.getState());
    assert.equal(starState.totalStars,starCase.total,'persisted best stars are the sole Endless unlock source');
    assert.equal(starState.endlessUnlocked,starCase.enabled);
    assert.equal(await starPage.locator('#endlessRequirement').textContent(),starCase.remaining);
    assert.equal(await starPage.locator('#endlessButton').isEnabled(),starCase.enabled);
    if(starCase.total===100){await starPage.click('#endlessButton');assert.equal((await starPage.evaluate(() => window.__mookLevels.getState())).isEndless,true,'Endless opens exactly at 100 stars');}
    await starPage.close();
  }
  await page.click('#worldsButton');
  assert.equal(await page.locator('.level-node').count(), 70, 'world map should render 70 levels');
  assert.equal(await page.locator('.level-node.unlocked').count(), 1, 'only level one starts unlocked');
  assert.match(await page.locator('#mapTitle').textContent(), /Green Valley/);
  assert.equal(await page.locator('.stage-card[data-world="1"]').getAttribute('class'), 'stage-card stage-green');
  assert.equal(await page.locator('.stage-card[data-world].world-locked').count(), 6, 'every world after World 1 should begin behind fog');
  assert.match(await page.locator('.stage-card[data-world="2"]').getAttribute('aria-label'), /World 2 locked.*Complete World 1/);
  assert.equal(await page.locator('.stage-card[data-world="2"] .stage-content').getAttribute('aria-hidden'), 'true');
  assert.equal(await page.locator('.stage-card[data-world="2"] .stage-content').getAttribute('inert'), '');
  assert.equal(await page.locator('.stage-card[data-world="2"] .level-node:enabled').count(), 0, 'fogged world levels must not be interactive');
  assert.match(await page.locator('.stage-card[data-world="2"] .stage-content').evaluate(element => getComputedStyle(element).filter), /blur\(10px\)/);
  assert.equal(await page.locator('.stage-card[data-world="2"] .world-lock-badge span').textContent(), 'Complete World 1');
  assert.equal(await page.locator('.endless-card').count(), 0, 'Endless Play has no world-map entry point');
  assert.deepEqual(await page.locator('#mapWrap > .stage-card').evaluateAll(cards => cards.map(card => card.dataset.world)), ['7','6','5','4','3','2','1'], 'worlds are ordered top-down so progression ascends from World 1');
  const firstWorldPath = await page.locator('.stage-card[data-world="1"] .level-node').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top));
  assert.ok(firstWorldPath[0] > firstWorldPath.at(-1), 'level paths wind upward from Level 1 to Level 10');
  assert.equal(await page.locator('.route-line').count(), 7);
  assert.equal(await page.locator('.mook-marker').count(), 1, 'exactly one Mook marks the current level');
  assert.match(await page.locator('.level-node.current').getAttribute('aria-label'), /current level/);
  assert.equal(await page.locator('.mook-marker img').evaluate(image => image.complete && image.naturalWidth === 128 && getComputedStyle(image).backgroundColor === 'rgba(0, 0, 0, 0)'), true, 'optimized transparent Mook marker loads without a black CSS background');
  assert.deepEqual(await page.locator('.mook-marker img').evaluate(image => {const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const context=canvas.getContext('2d');context.drawImage(image,0,0);return [[0,0],[127,0],[0,127],[127,127]].map(([x,y])=>context.getImageData(x,y,1,1).data[3]);}),[0,0,0,0],'marker corners retain transparent alpha instead of a black matte');

  const persistedPage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await persistedPage.addInitScript(() => {
    localStorage.setItem('mook-worlds-unlocked', '11');
    localStorage.setItem('mook-worlds-completed', JSON.stringify(Object.fromEntries(Array.from({length:10},(_,index)=>[String(index+1),1]))));
    localStorage.setItem('mook-worlds-stars', '{}');
  });
  await persistedPage.goto('http://127.0.0.1:8891/', { waitUntil: 'networkidle' });
  await persistedPage.click('#worldsButton');
  assert.equal(await persistedPage.locator('.stage-card[data-world="2"]').getAttribute('class'), 'stage-card stage-blue', 'persisted completion should clear the next world without stars');
  assert.equal(await persistedPage.locator('.stage-card[data-world="2"] .world-lock').count(), 0);
  assert.equal(await persistedPage.locator('.stage-card[data-world="3"]').getAttribute('class'), 'stage-card stage-yellow world-locked');
  assert.match(await persistedPage.locator('#mapTitle').textContent(), /Sky Current/, 'valid persisted completion should expose the newly available world title');
  await persistedPage.close();

  const inconsistentPage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await inconsistentPage.addInitScript(() => localStorage.setItem('mook-worlds-unlocked', '11'));
  await inconsistentPage.goto('http://127.0.0.1:8891/', { waitUntil: 'networkidle' });
  await inconsistentPage.click('#worldsButton');
  assert.equal(await inconsistentPage.locator('.stage-card[data-world="2"] .level-node:enabled').count(), 0);
  assert.equal(await inconsistentPage.locator('#mapTitle').textContent(), 'Complete World 1 to reveal the next world', 'stale unlock data must not expose a locked world title');
  await inconsistentPage.close();

  const existingEconomy = {
    version: 1,
    balances: {sky:7,sun:0,rock:12,time:3},
    awardedLevels: {'4':'time','13':'sky'},
    ledger: [{id:'saved-purchase',kind:'purchase',at:123,delta:{sky:5}}]
  };
  const savedEconomyPage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await savedEconomyPage.addInitScript(saved => localStorage.setItem('mook-worlds-economy-v1', JSON.stringify(saved)), existingEconomy);
  await savedEconomyPage.goto('http://127.0.0.1:8891/', { waitUntil: 'networkidle' });
  const preservedEconomy = (await savedEconomyPage.evaluate(() => window.__mookLevels.getState())).economy;
  assert.deepEqual(preservedEconomy, existingEconomy, 'existing version-1 balances, rewards, and ledger must be preserved exactly');
  await savedEconomyPage.close();

  const gatingPage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await gatingPage.addInitScript(() => {
    localStorage.clear();
    window.__gatePurchases = [];
    window.Capacitor = { Plugins: { MookCommerce: {
      getProducts: async ({ids}) => ({products:ids.map(id => ({id,displayPrice:'$0.99'})),removeAds:false,pending:[]}),
      purchase: async ({productId}) => { window.__gatePurchases.push(productId); return {cancelled:true,deliveries:[]}; },
      restore: async () => ({removeAds:false,pending:[]})
    } } };
  });
  await gatingPage.goto('http://127.0.0.1:8891/', { waitUntil: 'networkidle' });
  await gatingPage.click('#worldsButton');
  assert.deepEqual((await gatingPage.evaluate(() => window.__mookLevels.getState())).economy.balances, {sky:1,sun:1,rock:1,time:1}, 'new players start with exactly one of every power');
  assert.equal(await gatingPage.locator('#storeButton').isHidden(), true, 'the ads-only release must not expose an unavailable Store');
  const gateCases = [
    {through:1,level:1,enabled:['time']},
    {through:11,level:11,enabled:['time','sky']},
    {through:21,level:21,enabled:['time','sky','sun']},
    {through:31,level:31,enabled:['time','sky','sun','rock']}
  ];
  for (const gate of gateCases) {
    await gatingPage.evaluate(({through,level}) => { window.__mookLevels.returnToMap(); window.__mookLevels.unlockThroughForTest(through); window.__mookLevels.selectLevel(level); }, gate);
    for (const power of ['sky','sun','rock','time']) {
      const card = gatingPage.locator(`.power-card[data-power="${power}"]`);
      const available = gate.enabled.includes(power);
      assert.equal(await card.isEnabled(), available, `${power} availability should match the unlocked world at level ${gate.level}`);
      assert.equal((await card.locator('.inventory-count').textContent()).startsWith(available?'×':'🔒'), true, `${power} should render the correct quantity or lock badge`);
      assert.match(await card.getAttribute('aria-label'), available?/available/:/locked until/, `${power} should expose an accessible state`);
    }
    await gatingPage.evaluate(() => document.querySelector('.power-card[data-power="rock"]').dispatchEvent(new MouseEvent('click',{bubbles:true})));
    if (!gate.enabled.includes('rock')) assert.equal((await gatingPage.evaluate(() => window.__mookLevels.getState())).equippedPowers.includes('rock'), false, 'a locked power cannot be equipped even by a synthetic click');
    await gatingPage.evaluate(() => window.__mookLevels.returnToMap());
  }
  await gatingPage.close();

  const ipadPage = await browser.newPage({ viewport: { width: 1024, height: 1366 }, isMobile: true, hasTouch: true });
  await ipadPage.emulateMedia({reducedMotion:'reduce'});
  await ipadPage.goto('http://127.0.0.1:8891/', { waitUntil: 'networkidle' });
  await ipadPage.click('#worldsButton');
  const ipadLayout = await ipadPage.evaluate(() => ({app:document.querySelector('.app').getBoundingClientRect().width,world:document.querySelector('.stage-card[data-world="1"]').getBoundingClientRect().width,path:document.querySelector('.level-path').getBoundingClientRect().height,markerDuration:parseFloat(getComputedStyle(document.querySelector('.mook-marker')).animationDuration)}));
  assert.equal(ipadLayout.app,820,'the journey uses a bounded iPad canvas');
  assert.ok(ipadLayout.world<=700&&ipadLayout.path>=580,'world sections and ascending paths scale for iPad');
  assert.ok(ipadLayout.markerDuration<.01,'reduced motion suppresses marker animation');
  await ipadPage.close();

  assert.deepEqual(await page.evaluate(() => [0,1,2,3,4].map(window.__mookLevels.starsForMisses)), [4,3,2,1,0]);
  const configs = await page.evaluate(() => Array.from({ length: 70 }, (_, index) => window.__mookLevels.getLevelConfig(index + 1)));
  for (let stage = 0; stage < 7; stage++) {
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
  assert.deepEqual(configs.slice(50, 60).map(config => config.openingType), ['opposite','opposite','blue','blue','blue','yellow','rock','purple','opposite','opposite']);
  assert.equal(configs.slice(50, 60).every(config => config.mode === 'opposite'), true);
  assert.deepEqual(configs[50].mechanics, ['green','red']);
  assert.deepEqual(configs[51].mechanics, ['green','red']);
  assert.deepEqual(configs[52].mechanics, ['green','red','blue']);
  assert.deepEqual(configs[55].mechanics, ['green','red','blue','yellow']);
  assert.deepEqual(configs[56].mechanics, ['green','red','blue','yellow','rock']);
  assert.deepEqual(configs[57].mechanics, ['green','red','blue','yellow','rock','purple']);
  assert.ok(configs[50].beatMs > configs[51].beatMs, 'Opposite Level 1 should be easier than Level 2');
  assert.ok(configs[52].beatMs > configs[53].beatMs && configs[53].beatMs > configs[54].beatMs, 'Opposite blue levels should ramp easy to hard');
  assert.ok(configs[57].beatMs > configs[58].beatMs && configs[58].beatMs > configs[59].beatMs, 'Opposite all-item levels should ramp easy to hard');
  assert.deepEqual(configs.slice(60, 70).map(config => config.openingType), ['quantum','quantum','blue','blue','blue','yellow','rock','purple','quantum','quantum']);
  assert.equal(configs.slice(60, 70).every(config => config.mode === 'quantum'), true);
  assert.deepEqual(configs[60].mechanics, ['green','red']);
  assert.deepEqual(configs[61].mechanics, ['green','red']);
  assert.deepEqual(configs[62].mechanics, ['green','red','blue']);
  assert.deepEqual(configs[65].mechanics, ['green','red','blue','yellow']);
  assert.deepEqual(configs[66].mechanics, ['green','red','blue','yellow','rock']);
  assert.deepEqual(configs[67].mechanics, ['green','red','blue','yellow','rock','purple']);
  assert.ok(configs[60].beatMs > configs[61].beatMs, 'Quantum Level 1 should be easier than Level 2');
  assert.ok(configs[62].beatMs > configs[63].beatMs && configs[63].beatMs > configs[64].beatMs, 'Quantum blue levels should ramp easy to hard');
  assert.ok(configs[67].beatMs > configs[68].beatMs && configs[68].beatMs > configs[69].beatMs, 'Quantum all-item levels should ramp easy to hard');
  assert.equal(configs.slice(40, 50).every(config => config.purpleLifetimeMs === 1000), true);
  assert.equal(configs.slice(30, 34).every(config => config.rockMinHits === 3 && config.rockMaxHits === 3), true);
  assert.equal(configs.slice(34, 39).every(config => config.rockMinHits === 2 && config.rockMaxHits === 4), true);
  assert.equal(configs[39].rockMinHits, 2);
  assert.equal(configs[39].rockMaxHits, 5);
  for (let stage = 0; stage < 5; stage++) {
    const group = configs.slice(stage * 10, stage * 10 + 10);
    assert.ok(Math.abs(group[0].worldCellShare - 0.10) < 0.0001, `stage ${stage + 1} level 1 should use 10% world cells`);
    assert.ok(Math.abs(group[9].worldCellShare - 0.33) < 0.0001, `stage ${stage + 1} level 10 should use 33% world cells`);
    assert.equal(group.every((config, index) => index === 0 || config.worldCellShare > group[index - 1].worldCellShare), true);
  }

  await page.click('.level-node[data-level="1"]', { force: true });
  let state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.screen, 'game');
  assert.equal(state.level, 1);
  assert.equal(state.introVisible, true, 'selecting a level should show its briefing before any target');
  assert.equal(state.onboarding, false);
  assert.equal(state.active.length, 0);
  assert.match(await page.locator('#introTitle').textContent(), /Green Valley/);
  assert.match(await page.locator('#introSummary').textContent(), /30 game seconds/);
  assert.deepEqual(await page.locator('.power-card').allTextContents(), [
    'Sky GodAuto-clears every blue swipe🔒 World 2',
    'Sun GodAuto-completes every yellow hold🔒 World 3',
    'Rock GodAuto-breaks every gray rock🔒 World 4',
    'Time SlowSlows game time by 25%×1'
  ]);
  await page.click('.power-card[data-power="time"]');
  assert.equal(await page.locator('.power-card[data-power="time"]').getAttribute('aria-pressed'), 'true');
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.deepEqual(state.equippedPowers, ['time']);
  assert.equal(state.timeScale, .75);
  assert.ok(Math.abs(await page.evaluate(() => window.__mookLevels.scaledDelayForTest(2000)) - 2666.6667) < .01);
  await page.click('#introStart');
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.onboarding, true);
  assert.equal(state.levelStarted, false);
  assert.equal(state.active.length, 1);
  assert.equal(state.music.running, true, 'soundtrack should begin with the playable opening target');
  assert.equal(state.music.muted, false);
  await page.click('#soundToggle');
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).music.muted, true);
  assert.equal(await page.locator('#soundToggle').getAttribute('aria-label'), 'Turn game audio on');
  await page.click('#soundToggle');
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).music.muted, false);
  const selectionGuard=await page.evaluate(()=>{
    const game=document.querySelector('#gameScreen'),cell=document.querySelector('.cell'),mission=document.querySelector('#mission');
    const event=new Event('selectstart',{bubbles:true,cancelable:true});mission.dispatchEvent(event);
    const selection=getSelection(),range=document.createRange();range.selectNodeContents(mission);selection.removeAllRanges();selection.addRange(range);document.dispatchEvent(new Event('selectionchange'));
    return{gameUserSelect:getComputedStyle(game).userSelect,cellUserSelect:getComputedStyle(cell).userSelect,selectStartPrevented:event.defaultPrevented,selectionText:selection.toString()};
  });
  assert.equal(selectionGuard.gameUserSelect,'none');
  assert.equal(selectionGuard.cellUserSelect,'none');
  assert.equal(selectionGuard.selectStartPrevented,true);
  assert.equal(selectionGuard.selectionText,'','gameplay should immediately clear accidental native text selections');
  await page.evaluate(index => window.__mookLevels.tap(index), state.active[0]);
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.levelStarted, true, 'first interaction should start the level timer');
  assert.ok(state.music.feedbackCount >= 1, 'hitting a cell should play a sound effect');
  assert.ok(state.music.hapticCount >= 1, 'hitting a cell should request haptic feedback');
  assert.deepEqual(await page.evaluate(() => window.__vibrations[0]), 18);
  const tempoRamp = await page.evaluate(() => {
    const now = performance.now();
    return [window.__mookLevels.soundtrackBpmForTest(now), window.__mookLevels.soundtrackBpmForTest(now + 30000 / .75)];
  });
  assert.ok(tempoRamp[1] > tempoRamp[0], `soundtrack should accelerate during the level: ${tempoRamp}`);
  assert.ok(tempoRamp[0] < 82, 'Time Slow should also slow the soundtrack tempo');

  await page.evaluate(() => window.__mookLevels.finishLevelForTest(true));
  const firstClearState = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(firstClearState.music.running, false, 'soundtrack should stop outside gameplay');
  assert.equal(firstClearState.economy.balances.time, 1, 'the first four-star clear in World 1 awards one Time Slow');
  assert.deepEqual(firstClearState.economy.awardedLevels, {'1':'time'}, 'perfect-clear rewards are explicit and level-idempotent');
  assert.equal(await page.locator('#resultRewardName').textContent(), 'Time Slow ×1 · Now 1 owned');
  assert.equal(await page.locator('#mapScreen').getAttribute('class'), 'screen map-screen active');
  assert.equal(await page.locator('.level-node[data-level="2"]').getAttribute('class'), 'level-node unlocked current');
  assert.equal(await page.locator('.level-node[data-level="1"] .level-stars').textContent(), '★★★★');
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).starScores['1'], 4);
  await page.evaluate(() => window.__mookLevels.selectLevel(1));
  await page.click('#introStart');
  await page.evaluate(() => window.__mookLevels.finishLevelForTest(true));
  const replayClearState = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(replayClearState.economy.balances.time, 1, 'replaying a flawless level cannot farm its reward');
  assert.equal(await page.locator('#resultReward').isHidden(), true, 'a replay without a new reward does not show a false reward reveal');

  // A weaker replay shows its own award but never lowers the stored best stars.
  await page.evaluate(() => window.__mookLevels.selectLevel(1));
  await page.click('#introStart');
  state = await page.evaluate(() => window.__mookLevels.getState());
  await page.evaluate(index => window.__mookLevels.tap(index), state.active[0]);
  await wait(330);
  await page.evaluate(() => { window.__mookLevels.pauseForTest(); window.__mookLevels.clearTargetsForTest(); window.__mookLevels.tap(0); window.__mookLevels.tap(1); });
  await page.evaluate(() => window.__mookLevels.finishLevelForTest(true, false));
  await wait(800);
  assert.equal(await page.locator('#resultTitle').textContent(), 'Level 1 clear!');
  assert.equal(await page.locator('#resultScore').textContent(), '1');
  assert.equal(await page.locator('.award-star.earned').count(), 2);
  assert.match(await page.locator('#resultCopy').textContent(), /Best: 4 stars/);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).starScores['1'], 4);
  await wait(1200);
  assert.equal(await page.locator('#levelOverlay').getAttribute('class'), 'level-overlay', 'the congratulations screen should wait for the player');
  await page.click('#resultPrimary');
  assert.equal(await page.locator('.level-node[data-level="1"] .level-stars').textContent(), '★★★★');

  for (let level = 2; level <= 10; level++) {
    await page.evaluate(level => window.__mookLevels.selectLevel(level), level);
    await page.click('#introStart');
    await page.evaluate(() => window.__mookLevels.finishLevelForTest(true));
  }
  assert.equal(await page.locator('.stage-card[data-world="2"]').getAttribute('class'), 'stage-card stage-blue', 'finishing World 1 in-session should clear World 2 fog immediately');
  assert.equal(await page.locator('.stage-card[data-world="2"] .world-lock').count(), 0);
  assert.equal(await page.locator('.stage-card[data-world="2"] .level-node[data-level="11"]:enabled').count(), 1);

  await page.evaluate(() => { window.__mookLevels.unlockThroughForTest(11); window.__mookLevels.selectLevel(11); });
  await page.click('#introStart');
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
  await page.evaluate(() => window.__mookLevels.selectLevel(21));
  await page.click('#introStart');
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
  await page.evaluate(() => window.__mookLevels.selectLevel(31));
  await page.click('#introStart');
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
  await page.evaluate(() => window.__mookLevels.selectLevel(20));
  await page.click('#introStart');
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
    await page.evaluate(level => window.__mookLevels.selectLevel(level), level);
    await page.click('#introStart');
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
  const summitMix = await page.evaluate(() => window.__mookLevels.worldMixSequenceForTest(100));
  assert.equal(summitMix.filter(type => type === 'rock').length, 33, 'Summit level 10 should schedule 33 rocks per 100 action cells');
  let longestGreenRun = 0;
  let currentGreenRun = 0;
  for (const type of summitMix) {
    currentGreenRun = type === 'green' ? currentGreenRun + 1 : 0;
    longestGreenRun = Math.max(longestGreenRun, currentGreenRun);
  }
  assert.ok(longestGreenRun <= 3, `Summit level 10 should never go more than three action cells without a rock; got ${longestGreenRun}`);

  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(41));
  await page.evaluate(() => window.__mookLevels.selectLevel(41));
  await page.click('#introStart');
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.onboardingType, 'purple');
  assert.equal(state.levelStarted, false);
  assert.equal(state.purple.length, 1);
  const violetMix = await page.evaluate(() => window.__mookLevels.worldMixSequenceForTest(100));
  assert.equal(violetMix.filter(type => type === 'purple').length, 10, 'Violet Level 1 should devote 10% of action cells to purple');
  for (const supportingType of ['green','blue','yellow','rock']) {
    assert.ok(violetMix.includes(supportingType), `Violet World should continue spawning ${supportingType} cells`);
  }
  assert.equal(await page.evaluate(index => document.querySelectorAll('.cell')[index].classList.contains('fading'), state.purple[0]), false, 'the untimed opening purple should not fade');
  await page.evaluate(index => window.__mookLevels.tap(index), state.purple[0]);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).levelStarted, true);
  await wait(320);
  await page.evaluate(() => {
    window.__mookLevels.pauseForTest();
    window.__mookLevels.clearTargetsForTest();
  });
  const purpleFade = await page.evaluate(() => {
    const index=window.__mookLevels.spawnForTest('purple');
    const cell = document.querySelectorAll('.cell')[index];
    const style = getComputedStyle(cell);
    return { index, className: cell.className, animationName: style.animationName, animationDuration: style.animationDuration };
  });
  assert.match(purpleFade.className, /fading/);
  assert.equal(purpleFade.animationName, 'purpleFade');
  assert.equal(purpleFade.animationDuration, '1s');

  await wait(500);
  const purpleMidFade = await page.evaluate(index => {
    const style = getComputedStyle(document.querySelectorAll('.cell')[index]);
    return { opacity: Number(style.opacity), transform: style.transform };
  }, purpleFade.index);
  assert.ok(purpleMidFade.opacity < 0.8, `purple should be visibly transparent halfway through; got ${purpleMidFade.opacity}`);
  assert.equal(purpleMidFade.transform, 'none', 'purple should remain full size during its one-second fade');
  state = await page.evaluate(() => window.__mookLevels.getState());
  const missesBeforePurpleExpiry = state.misses;
  await wait(1300);
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.purple.length, 0);
  assert.equal(state.misses, missesBeforePurpleExpiry + 1, 'a regular purple target should expire after one second');

  // World 6: red is the positive tap, green is the trap, and arrows require the opposite swipe.
  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(51));
  assert.equal(await page.locator('.endless-card').count(), 0, 'unlocking World 6 does not add Endless to the map');
  await page.click('#titleBack');
  assert.equal(await page.locator('#endlessButton').isDisabled(), true, 'World 5 completion alone does not unlock Endless');
  assert.equal(await page.locator('#endlessRequirement').textContent(), '60 ★ to unlock');
  await page.click('#worldsButton');
  await page.evaluate(() => window.__mookLevels.selectLevel(51));
  await page.click('#introStart');
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.onboardingType, 'opposite');
  assert.equal(state.active.length, 1);
  assert.deepEqual(await page.evaluate(() => window.__mookLevels.worldMixSequenceForTest(20)), Array(20).fill('green'), 'Opposite Levels 1–2 should only schedule red targets and green traps');
  const oppositeTrapMix = await page.evaluate(() => window.__mookLevels.redTrapSequenceForTest(12));
  assert.equal(oppositeTrapMix.filter(Boolean).length, 3, 'Opposite Level 1 should guarantee three green traps every twelve cycles');
  assert.ok(oppositeTrapMix.indexOf(true) <= 2, 'the first green trap should arrive within the first three cycles');
  assert.equal(await page.evaluate(index => document.querySelectorAll('.cell')[index].classList.contains('red'), state.active[0]), true);
  await page.evaluate(index => window.__mookLevels.tap(index), state.active[0]);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).levelStarted, true);
  await wait(320);
  await page.evaluate(() => { window.__mookLevels.pauseForTest(); window.__mookLevels.clearTargetsForTest(); });
  const oppositePositive = await page.evaluate(() => window.__mookLevels.spawnForTest('green'));
  assert.equal(await page.evaluate(index => document.querySelectorAll('.cell')[index].classList.contains('red'), oppositePositive), true);
  const scoreBeforeOppositeTap = (await page.evaluate(() => window.__mookLevels.getState())).score;
  await page.evaluate(index => window.__mookLevels.tap(index), oppositePositive);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).score, scoreBeforeOppositeTap + 1);
  await wait(320);
  await page.evaluate(() => window.__mookLevels.clearTargetsForTest());
  const oppositeTrap = await page.evaluate(() => window.__mookLevels.spawnForTest('red'));
  assert.equal(await page.evaluate(index => document.querySelectorAll('.cell')[index].classList.contains('green'), oppositeTrap), true);
  const missesBeforeOppositeTrap = (await page.evaluate(() => window.__mookLevels.getState())).misses;
  await page.evaluate(index => window.__mookLevels.tap(index), oppositeTrap);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).misses, missesBeforeOppositeTrap + 1);
  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(53));
  await page.evaluate(() => window.__mookLevels.selectLevel(53));
  await page.click('#introStart');
  const oppositeBlue = (await page.evaluate(() => window.__mookLevels.getState())).blue[0];
  assert.deepEqual([...new Set(await page.evaluate(() => window.__mookLevels.worldMixSequenceForTest(20)))].sort(), ['blue','green']);
  const directionOpposites = { left: 'right', right: 'left', up: 'down', down: 'up' };
  assert.equal(oppositeBlue.direction, directionOpposites[oppositeBlue.shownDirection]);
  const oppositeOpeningSwipe = { left: [-80,0], right: [80,0], up: [0,-80], down: [0,80] }[oppositeBlue.direction];
  await page.evaluate(({index,swipe}) => window.__mookLevels.resolveSwipe(index,swipe[0],swipe[1]), {index:oppositeBlue.index,swipe:oppositeOpeningSwipe});
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).levelStarted, true);
  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(58));
  await page.evaluate(() => window.__mookLevels.selectLevel(58));
  await page.click('#introStart');
  assert.deepEqual([...new Set(await page.evaluate(() => window.__mookLevels.worldMixSequenceForTest(25)))].sort(), ['blue','green','purple','rock','yellow']);

  // World 7: colors and arrows physically flip at one second; rocks hide their strength until the first hit.
  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(61));
  await page.evaluate(() => window.__mookLevels.selectLevel(61));
  assert.deepEqual([...new Set(await page.evaluate(() => window.__mookLevels.worldMixSequenceForTest(20)))], ['green'], 'Quantum Level 1 should only schedule quantum red/green play');
  const quantumOpeningTrapMix=await page.evaluate(() => window.__mookLevels.redTrapSequenceForTest(12));
  assert.ok(quantumOpeningTrapMix.filter(Boolean).length>=2, 'Quantum Level 1 should pace in red cells that later become green');
  await page.click('#introStart');
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(state.onboardingType, 'quantum');
  assert.equal(state.red.length, 1);
  const quantumOpeningIndex = state.red[0];
  assert.equal(await page.evaluate(index => document.querySelectorAll('.cell')[index].classList.contains('red'), quantumOpeningIndex), true);
  await wait(1300);
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.ok(state.active.includes(quantumOpeningIndex));
  assert.equal(await page.evaluate(index => document.querySelectorAll('.cell')[index].classList.contains('green'), quantumOpeningIndex), true);
  await page.evaluate(index => window.__mookLevels.tap(index), quantumOpeningIndex);
  assert.equal((await page.evaluate(() => window.__mookLevels.getState())).levelStarted, true);
  await wait(320);
  await page.evaluate(() => { window.__mookLevels.pauseForTest(); window.__mookLevels.clearTargetsForTest(); });

  const quantumGreen = await page.evaluate(() => window.__mookLevels.spawnForTest('green'));
  await wait(1300);
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.ok(state.red.includes(quantumGreen));
  assert.equal(await page.evaluate(index => document.querySelectorAll('.cell')[index].classList.contains('red'), quantumGreen), true);
  await page.evaluate(() => window.__mookLevels.clearTargetsForTest());

  const quantumRed = await page.evaluate(() => window.__mookLevels.spawnForTest('red'));
  await wait(1300);
  state = await page.evaluate(() => window.__mookLevels.getState());
  assert.ok(state.active.includes(quantumRed));
  assert.equal(await page.evaluate(index => document.querySelectorAll('.cell')[index].classList.contains('green'), quantumRed), true);
  await page.evaluate(() => window.__mookLevels.clearTargetsForTest());

  await page.evaluate(() => window.__mookLevels.spawnForTest('blue'));
  const quantumBlueBefore = (await page.evaluate(() => window.__mookLevels.getState())).blue[0];
  await wait(1300);
  const quantumBlueAfter = (await page.evaluate(() => window.__mookLevels.getState())).blue[0];
  assert.equal(quantumBlueAfter.shownDirection, directionOpposites[quantumBlueBefore.shownDirection]);
  assert.equal(quantumBlueAfter.direction, quantumBlueAfter.shownDirection);
  await page.evaluate(() => window.__mookLevels.clearTargetsForTest());

  const quantumRock = await page.evaluate(() => window.__mookLevels.spawnForTest('rock'));
  state = await page.evaluate(() => window.__mookLevels.getState());
  const hiddenRock = state.rock.find(rock => rock.index === quantumRock);
  assert.equal(hiddenRock.hidden, true);
  assert.equal(await page.evaluate(index => document.querySelectorAll('.cell')[index].dataset.hits, quantumRock), '?');
  await page.evaluate(index => window.__mookLevels.hitRock(index), quantumRock);
  const revealedRock = (await page.evaluate(() => window.__mookLevels.getState())).rock.find(rock => rock.index === quantumRock);
  assert.equal(revealedRock.hidden, false);
  assert.equal(revealedRock.hits, hiddenRock.hits - 1);
  assert.equal(await page.evaluate(index => document.querySelectorAll('.cell')[index].dataset.hits, quantumRock), String(revealedRock.hits));

  // Quantum mechanics are introduced gradually rather than all appearing in Level 1.
  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(63));
  await page.evaluate(() => window.__mookLevels.selectLevel(63));
  await page.click('#introStart');
  let stagedQuantum=await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(stagedQuantum.onboardingType,'blue');
  const stagedArrowBefore=stagedQuantum.blue[0];
  await wait(1300);
  const stagedArrowAfter=(await page.evaluate(() => window.__mookLevels.getState())).blue[0];
  assert.equal(stagedArrowAfter.shownDirection,directionOpposites[stagedArrowBefore.shownDirection], 'Quantum arrow tutorial should visibly reverse after one second');

  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(67));
  await page.evaluate(() => window.__mookLevels.selectLevel(67));
  await page.click('#introStart');
  stagedQuantum=await page.evaluate(() => window.__mookLevels.getState());
  assert.equal(stagedQuantum.onboardingType,'rock');
  assert.equal(stagedQuantum.rock[0].hidden,true);
  assert.equal(await page.evaluate(index => document.querySelectorAll('.cell')[index].dataset.hits,stagedQuantum.rock[0].index),'?');

  await page.evaluate(() => window.__mookLevels.returnToMap());
  await page.evaluate(() => window.__mookLevels.unlockThroughForTest(68));
  await page.evaluate(() => window.__mookLevels.selectLevel(68));
  assert.deepEqual([...new Set(await page.evaluate(() => window.__mookLevels.worldMixSequenceForTest(25)))].sort(),['blue','green','purple','rock','yellow']);

  // Counted Gods automatically clear their matching cells for one selected level only.
  async function verifyGod(level, power, type, settleMs) {
    await page.evaluate(() => window.__mookLevels.returnToMap());
    await page.evaluate(level => window.__mookLevels.unlockThroughForTest(level), level);
    await page.evaluate(level => window.__mookLevels.selectLevel(level), level);
    assert.equal((await page.evaluate(() => window.__mookLevels.getState())).equippedPowers.length, 0, 'power-ups reset for each run');
    await page.click(`.power-card[data-power="${power}"]`);
    await page.click('#introStart');
    await wait(settleMs);
    let godState = await page.evaluate(() => window.__mookLevels.getState());
    assert.equal(godState.levelStarted, true, `${power} should automatically clear its tutorial opener`);
    assert.deepEqual(godState.equippedPowers, [power]);
    await page.evaluate(() => { window.__mookLevels.pauseForTest(); window.__mookLevels.clearTargetsForTest(); });
    godState = await page.evaluate(() => window.__mookLevels.getState());
    const before = godState.score;
    await page.evaluate(type => window.__mookLevels.spawnForTest(type), type);
    await wait(settleMs);
    godState = await page.evaluate(() => window.__mookLevels.getState());
    assert.equal(godState[type].length, 0, `${power} should clear regular ${type} targets`);
    assert.equal(godState.score, before + 1);
  }
  await verifyGod(11, 'sky', 'blue', 700);
  await verifyGod(21, 'sun', 'yellow', 700);
  await verifyGod(31, 'rock', 'rock', 1500);
  assert.match(await page.locator('#stageLabel').textContent(), /Rock Summit/);

  // v1.1: economy migration, StoreKit delivery idempotency, ads policy, and Endless lifecycle.
  const v11Page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await v11Page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('mook-worlds-unlocked', '51');
    localStorage.setItem('mook-worlds-completed', JSON.stringify(Object.fromEntries(Array.from({length:50},(_,index)=>[String(index+1),1]))));
    localStorage.setItem('mook-worlds-stars', JSON.stringify(Object.fromEntries(Array.from({length:25},(_,index)=>[String(index+1),4]))));
    window.__nativeCalls = { purchases: [], ads: 0, restores: 0, acknowledgements: [] };
    window.__purchaseError = '';
    window.Capacitor = { Plugins: {
      MookCommerce: {
        getProducts: async ({ids}) => ({ products: ids.map((id,index) => ({id,displayPrice:`$${index+1}.99`})), removeAds: false, pending: [] }),
        purchase: async ({productId}) => { if(window.__purchaseError)throw new Error(window.__purchaseError); window.__nativeCalls.purchases.push(productId); return { deliveries: [{productId,transactionId:`tx-${window.__nativeCalls.purchases.length}`}], cancelled: false }; },
        acknowledge: async ({transactionId}) => { window.__nativeCalls.acknowledgements.push(transactionId); return {}; },
        restore: async () => { window.__nativeCalls.restores += 1; return {removeAds:true,pending:[]}; }
      },
      MookAds: {
        configure: async () => ({testMode:true,privacyOptionsRequired:false}),
        getStatus: async () => ({enabled:true,testMode:true,canRequestAds:true,adReady:true,loadError:''}),
        showInterstitial: async () => { window.__nativeCalls.ads += 1; return {shown:true}; }
      }
    } };
  });
  await v11Page.goto('http://127.0.0.1:8891/', { waitUntil: 'networkidle' });
  await v11Page.click('#worldsButton');

  const endlessConfigs = await v11Page.evaluate(() => [0,30000,60000,90000,120000,240000].map(window.__mookLevels.getEndlessConfig));
  assert.deepEqual(endlessConfigs.map(item => item.mechanics), [
    ['green','red'],['green','red','blue'],['green','red','blue','yellow'],
    ['green','red','blue','yellow','rock'],['green','red','blue','yellow','rock','purple'],['green','red','blue','yellow','rock','purple']
  ]);
  assert.equal(endlessConfigs.every((item,index,array) => index === 0 || item.beatMs <= array[index-1].beatMs), true, 'Endless cadence should continually intensify');
  let v11State = await v11Page.evaluate(() => window.__mookLevels.getState());
  assert.deepEqual(v11State.economy.balances, {sky:1,sun:1,rock:1,time:1}, 'users without an economy record receive one of each power exactly once');
  assert.equal(v11State.economy.ledger[0].kind, 'migration');

  await v11Page.evaluate(() => window.__mookLevels.setInventoryForTest({sky:1}));
  await v11Page.evaluate(() => window.__mookLevels.selectLevel(11));
  await v11Page.click('.power-card[data-power="sky"]');
  await v11Page.click('#introStart');
  v11State = await v11Page.evaluate(() => window.__mookLevels.getState());
  assert.equal(v11State.economy.balances.sky, 0, 'equipped inventory is consumed exactly when play begins');
  assert.equal(v11State.economy.ledger.at(-1).kind, 'consume');
  await v11Page.evaluate(() => window.__mookLevels.returnToMap());
  await v11Page.evaluate(() => window.__mookLevels.selectLevel(11));
  const emptySky = v11Page.locator('.power-card[data-power="sky"]');
  assert.equal(await emptySky.isEnabled(), true, 'an unlocked empty power remains visible without commerce messaging');
  assert.equal(await emptySky.locator('.inventory-count').textContent(), '×0');
  assert.match(await emptySky.getAttribute('aria-label'), /0 available/);
  await emptySky.click();
  assert.equal(await v11Page.locator('#storeOverlay').getAttribute('class'), 'store-overlay hidden', 'tapping an empty power must not expose unavailable commerce');
  await v11Page.evaluate(() => window.__mookLevels.returnToMap());

  await v11Page.click('#titleBack');
  assert.equal(await v11Page.locator('#endlessButton').isEnabled(), true);
  await v11Page.click('#endlessButton');
  assert.match(await v11Page.locator('#introSummary').textContent(), /checkpoints bank every 2 minutes/);
  await v11Page.click('#introStart');
  v11State = await v11Page.evaluate(() => window.__mookLevels.getState());
  await v11Page.evaluate(index => window.__mookLevels.tap(index), v11State.active[0]);
  await v11Page.evaluate(() => window.__mookLevels.setEndlessProgressForTest(120000,1));
  await v11Page.evaluate(() => window.__mookLevels.finishEndlessForTest());
  assert.equal(await v11Page.locator('#resultPrimary').textContent(), 'Continue once');
  await v11Page.click('#resultPrimary');
  v11State = await v11Page.evaluate(() => window.__mookLevels.getState());
  assert.equal(v11State.endless.continueUsed, true);
  assert.equal(v11State.endless.elapsedMs, 120000);
  assert.equal(v11State.score, 1, 'continue restores the banked run score and begins a fresh attempt');
  await v11Page.evaluate(() => window.__mookLevels.finishEndlessForTest());
  assert.equal(await v11Page.locator('#resultPrimary').textContent(), 'Try again', 'a second continue is never offered');
  assert.equal(await v11Page.evaluate(() => localStorage.getItem('mook-worlds-endless-high-score')), '1');

  await v11Page.evaluate(() => window.__mookLevels.setAdSessionForTest({startedAt:Date.now(),lossesSinceAd:2,shown:0,lastShownAt:0}));
  assert.equal(await v11Page.evaluate(() => window.__mookLevels.maybePresentLossAdForTest()), true);
  assert.equal(await v11Page.evaluate(() => window.__nativeCalls.ads), 1);
  v11State = await v11Page.evaluate(() => window.__mookLevels.getState());
  assert.equal(v11State.adSession.lossesSinceAd, 0);
  assert.equal(v11State.adSession.shown, 1);

  await v11Page.evaluate(() => window.__mookLevels.setAdSessionForTest({startedAt:Date.now(),lossesSinceAd:2,shown:3,lastShownAt:Date.now()}));
  assert.equal(await v11Page.evaluate(() => window.__mookLevels.maybePresentLossAdForTest()), true, 'there is no arbitrary per-session interstitial ceiling or time delay after three additional losses');
  assert.equal(await v11Page.evaluate(() => window.__nativeCalls.ads), 2);
  v11State = await v11Page.evaluate(() => window.__mookLevels.getState());
  assert.equal(v11State.adSession.shown, 4);

  await v11Page.evaluate(() => window.__mookLevels.returnToMap());
  assert.equal(await v11Page.locator('#storeButton').isHidden(), true, 'commerce remains unreachable throughout the ads-only release');
  await v11Page.close();

  console.log(JSON.stringify({ ok: true, levels: configs.length, finalState: state }));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await browser?.close();
  server.kill('SIGTERM');
});
