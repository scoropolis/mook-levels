import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const project = '/Users/pointform/Projects/mook-levels';
const root = path.join(project, 'store-assets/v1.2');
const mime = {'.html':'text/html; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.js':'text/javascript'};
const server = http.createServer(async (req,res)=>{
  const rel = req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1));
  const target = path.resolve(project, rel);
  if (!target.startsWith(project + path.sep)) { res.writeHead(403); res.end(); return; }
  try { const bytes=await fs.readFile(target); res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'}); res.end(bytes); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const devices=[
  {key:'iphone-6.9',viewport:{width:440,height:956},scale:3},
  {key:'ipad-13',viewport:{width:1032,height:1376},scale:2},
];
const seed=async context=>context.addInitScript(()=>{
  const completed=Object.fromEntries(Array.from({length:46},(_,i)=>[String(i+1),1000+i*17]));
  const stars=Object.fromEntries(Array.from({length:46},(_,i)=>[String(i+1),i%5===0?3:4]));
  localStorage.setItem('mook-worlds-unlocked','47');
  localStorage.setItem('mook-worlds-completed',JSON.stringify(completed));
  localStorage.setItem('mook-worlds-stars',JSON.stringify(stars));
  localStorage.setItem('mook-worlds-economy-v1',JSON.stringify({version:1,balances:{sky:4,sun:3,rock:2,time:5},awardedLevels:{},ledger:[{id:'screenshot-seed',kind:'fixture',at:0,delta:{sky:4,sun:3,rock:2,time:5}}]}));
  localStorage.setItem('mook-worlds-endless-high-score','8420');
});
async function open(device){
  const context=await browser.newContext({viewport:device.viewport,deviceScaleFactor:device.scale,colorScheme:'light'});await seed(context);const page=await context.newPage();await page.goto(url,{waitUntil:'networkidle'});await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}'});return{context,page};
}
async function shot(device,name,prepare){const out=path.join(root,'raw-captures/ios',device.key,'en-US');await fs.mkdir(out,{recursive:true});const s=await open(device);await prepare(s.page);await s.page.screenshot({path:path.join(out,name)});await s.context.close();}
for(const device of devices){
  await shot(device,'01-world-map.png',async page=>{await page.click('#worldsButton');await page.locator('.level-node.current').scrollIntoViewIfNeeded();});
  await shot(device,'02-core-gameplay.png',async page=>{await page.click('#worldsButton');await page.evaluate(()=>window.__mookLevels.selectLevel(38));await page.click('#introStart');await page.evaluate(()=>{window.__mookLevels.clearTargetsForTest();['green','blue','yellow','rock','purple'].forEach(t=>window.__mookLevels.spawnForTest(t));window.__mookLevels.pauseForTest();});});
  await shot(device,'03-quantum-gameplay.png',async page=>{await page.click('#worldsButton');await page.evaluate(()=>{window.__mookLevels.unlockThroughForTest(68);window.__mookLevels.selectLevel(68)});await page.click('#introStart');await page.evaluate(()=>{window.__mookLevels.clearTargetsForTest();['red','green','blue','purple'].forEach(t=>window.__mookLevels.spawnForTest(t));window.__mookLevels.pauseForTest();});});
  await shot(device,'04-power-briefing.png',async page=>{await page.click('#worldsButton');await page.evaluate(()=>window.__mookLevels.selectLevel(38));});
  await shot(device,'05-endless-gameplay.png',async page=>{await page.click('#endlessButton');await page.click('#introStart');await page.evaluate(()=>{window.__mookLevels.setEndlessProgressForTest(245000,7160);window.__mookLevels.clearTargetsForTest();['green','blue','yellow','rock','purple','red'].forEach(t=>window.__mookLevels.spawnForTest(t));window.__mookLevels.pauseForTest();});});
}
await browser.close();await new Promise(resolve=>server.close(resolve));
