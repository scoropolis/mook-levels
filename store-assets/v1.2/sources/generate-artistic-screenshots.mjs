import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='/Users/pointform/Projects/mook-levels/store-assets/v1.2';
const devices=[
 {key:'iphone-6.9',label:'iPhone 6.9-inch',width:1320,height:2868},
 {key:'ipad-13',label:'iPad 13-inch',width:2064,height:2752},
];
const frames=[
 {n:'01',slug:'climb-seven-worlds',headline:'Climb seven worlds',support:'Seventy handcrafted challenges reveal new rules as you rise.',capture:'01-world-map.png',kind:'map',accent:'#66e5bd'},
 {n:'02',slug:'tap-swipe-hold-break',headline:'Tap. Swipe. Hold. Break.',support:'Read the board fast and survive thirty-second challenges.',capture:'02-core-gameplay.png',kind:'action',accent:'#ffdc57'},
 {n:'03',slug:'every-world-changes',headline:'Every world changes the rules',support:'Adapt as colours, directions and timing shift beneath you.',capture:'03-quantum-gameplay.png',kind:'quantum',accent:'#d67cff'},
 {n:'04',slug:'choose-your-advantage',headline:'Choose your advantage',support:'Equip saved powers before the next challenge begins.',capture:'04-power-briefing.png',kind:'powers',accent:'#69cfff'},
 {n:'05',slug:'endless-keeps-escalating',headline:'Endless keeps escalating',support:'Bank checkpoints, use one continue and chase your high score.',capture:'05-endless-gameplay.png',kind:'endless',accent:'#ff7e9f'},
];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
function scene(kind,accent){
 if(kind==='map')return `<div class="sun"></div><div class="cloud c1"></div><div class="cloud c2"></div><div class="route"></div>`;
 if(kind==='action')return `<div class="burst"></div><i class="trail t1"></i><i class="trail t2"></i><i class="trail t3"></i><i class="trail t4"></i>`;
 if(kind==='quantum')return `<div class="portal p1"></div><div class="portal p2"></div><div class="stars"></div>`;
 if(kind==='powers')return `<div class="orb o1">☁</div><div class="orb o2">☀</div><div class="orb o3">◆</div><div class="orb o4">◷</div>`;
 return `<div class="infinity">∞</div><div class="speed s1"></div><div class="speed s2"></div><div class="checkpoint"></div>`;
}
for(const device of devices){
 const raw=path.join(root,'raw-captures/ios',device.key,'en-US');const out=path.join(root,'exports/apple',device.key,'en-US');await fs.mkdir(out,{recursive:true});
 const tablet=device.key==='ipad-13';
 for(const frame of frames){
  const bytes=await fs.readFile(path.join(raw,frame.capture));const img=`data:image/png;base64,${bytes.toString('base64')}`;
  const page=await browser.newPage({viewport:{width:device.width,height:device.height},deviceScaleFactor:1});
  const artTop=tablet?690:760, artWidth=tablet?1510:1110;
  const bg={map:'linear-gradient(165deg,#76e1ef 0%,#8eeacb 42%,#ffe69d 100%)',action:'radial-gradient(circle at 50% 48%,#315f78 0%,#102c45 34%,#071423 76%)',quantum:'radial-gradient(circle at 52% 52%,#643ab6 0%,#251a5d 40%,#090f2a 78%)',powers:'radial-gradient(circle at 50% 56%,#f7efcc 0%,#66c8bf 48%,#173c4f 100%)',endless:'radial-gradient(circle at 52% 48%,#f06aa2 0%,#513b9f 36%,#101735 76%)'}[frame.kind];
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}html,body{margin:0;width:${device.width}px;height:${device.height}px;overflow:hidden}body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display",Arial,sans-serif;color:#fff}.canvas{position:relative;width:100%;height:100%;overflow:hidden;background:${bg}}.noise{position:absolute;inset:0;opacity:.09;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}.brand{position:absolute;z-index:20;top:${tablet?70:86}px;left:${tablet?132:82}px;font-size:${tablet?38:31}px;font-weight:1000;letter-spacing:.11em;text-transform:uppercase}.brand b{display:inline-grid;place-items:center;width:${tablet?58:50}px;height:${tablet?58:50}px;margin-right:16px;border-radius:18px;background:${frame.accent};color:#132638;box-shadow:0 0 36px ${frame.accent}aa}.copy{position:absolute;z-index:20;top:${tablet?165:190}px;left:${tablet?132:82}px;right:${tablet?132:82}px}.copy h1{max-width:${tablet?1700:1160}px;margin:0;font-size:${tablet?132:102}px;line-height:.94;letter-spacing:-.055em;font-weight:1000;text-wrap:balance}.copy p{max-width:${tablet?1340:1030}px;margin:27px 0 0;font-size:${tablet?43:35}px;line-height:1.3;font-weight:650;color:#f3f7fa}.proof{position:absolute;z-index:10;top:${artTop}px;left:50%;width:${artWidth}px;transform:translateX(-50%) ${frame.kind==='action'?'rotate(-1.8deg)':frame.kind==='endless'?'rotate(1.6deg)':'rotate(0)'};border:${tablet?18:15}px solid rgba(255,255,255,.86);border-radius:${tablet?68:62}px;overflow:hidden;box-shadow:0 80px 150px rgba(0,0,0,.46),0 0 0 4px rgba(255,255,255,.22);background:#132638}.proof img{display:block;width:100%;height:auto}.proof:after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 0 2px rgba(255,255,255,.25);border-radius:inherit;pointer-events:none}
  .sun{position:absolute;width:620px;height:620px;border-radius:50%;right:-120px;top:300px;background:radial-gradient(circle,#fff8c6,#ffd66d 48%,transparent 70%);opacity:.75}.cloud{position:absolute;height:170px;border-radius:50%;background:#fff9;filter:blur(5px)}.c1{width:700px;left:-250px;top:680px;box-shadow:260px 35px 0 30px #fff8}.c2{width:760px;right:-330px;bottom:80px;box-shadow:-280px -20px 0 20px #fff6}.route{position:absolute;left:8%;bottom:-30px;width:84%;height:70%;border:18px dotted rgba(255,255,255,.34);border-left:0;border-bottom:0;border-radius:50%}
  .burst{position:absolute;left:50%;top:52%;width:1700px;height:1700px;transform:translate(-50%,-50%);background:repeating-conic-gradient(from 5deg,transparent 0 7deg,rgba(255,255,255,.055) 8deg 12deg)}.trail{position:absolute;width:620px;height:42px;border-radius:99px;filter:blur(2px);opacity:.72}.t1{left:-120px;top:1050px;background:#4ce58e;transform:rotate(24deg)}.t2{right:-150px;top:1280px;background:#58c7ef;transform:rotate(-28deg)}.t3{left:-100px;bottom:520px;background:#ffd24f;transform:rotate(-17deg)}.t4{right:-100px;bottom:350px;background:#b36eff;transform:rotate(20deg)}
  .portal{position:absolute;left:50%;top:59%;border-radius:50%;transform:translate(-50%,-50%);border-style:solid}.p1{width:1800px;height:1800px;border-width:80px;border-color:#68e7ef55;box-shadow:0 0 140px #79efff66,inset 0 0 130px #ff77e555}.p2{width:1320px;height:1320px;border-width:35px;border-color:#f28aff77;transform:translate(-50%,-50%) rotate(25deg)}.stars{position:absolute;inset:0;background-image:radial-gradient(circle,#fff 0 2px,transparent 3px);background-size:67px 67px;opacity:.22}
  .orb{position:absolute;display:grid;place-items:center;width:${tablet?190:150}px;height:${tablet?190:150}px;border-radius:40%;font-size:${tablet?82:64}px;color:#173044;background:rgba(255,255,255,.75);box-shadow:0 35px 70px #092a3f55,0 0 45px ${frame.accent}88}.o1{left:4%;top:920px;transform:rotate(-12deg)}.o2{right:4%;top:1050px;transform:rotate(11deg)}.o3{left:3%;bottom:360px;transform:rotate(8deg)}.o4{right:3%;bottom:300px;transform:rotate(-9deg)}
  .infinity{position:absolute;left:50%;top:57%;transform:translate(-50%,-50%);font-size:${tablet?1500:1040}px;line-height:1;color:transparent;-webkit-text-stroke:${tablet?40:30}px rgba(255,255,255,.12);text-shadow:0 0 110px #ff7e9f88}.speed{position:absolute;left:-20%;width:140%;height:24px;border-radius:99px;background:linear-gradient(90deg,transparent,#fff8,transparent);transform:rotate(-24deg)}.s1{top:980px}.s2{bottom:510px;transform:rotate(21deg)}.checkpoint{position:absolute;left:50%;bottom:90px;width:900px;height:900px;transform:translateX(-50%);border:28px dashed rgba(255,255,255,.16);border-radius:50%}
  .tag{position:absolute;z-index:30;right:${tablet?100:70}px;bottom:${tablet?75:65}px;padding:16px 24px;border:2px solid rgba(255,255,255,.35);border-radius:99px;background:rgba(6,20,38,.52);backdrop-filter:blur(10px);font-size:${tablet?25:20}px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
  </style></head><body><main class="canvas"><div class="noise"></div>${scene(frame.kind,frame.accent)}<div class="brand"><b>M</b>Mook Worlds</div><section class="copy"><h1>${esc(frame.headline)}</h1><p>${esc(frame.support)}</p></section><div class="proof"><img src="${img}" alt=""></div><div class="tag">Actual gameplay · v1.2</div></main></body></html>`,{waitUntil:'load'});
  const name=`apple-${device.key.replace('.','')}-en-US-${frame.n}-${frame.slug}-${device.width}x${device.height}.jpg`;
  await page.screenshot({path:path.join(out,name),type:'jpeg',quality:96});await page.close();
 }
}
for(const device of devices){
 const page=await browser.newPage({viewport:{width:1900,height:1280},deviceScaleFactor:1});const out=path.join(root,'exports/apple',device.key,'en-US');const cards=[];
 for(const frame of frames){const name=`apple-${device.key.replace('.','')}-en-US-${frame.n}-${frame.slug}-${device.width}x${device.height}.jpg`;const b=await fs.readFile(path.join(out,name));cards.push(`<figure><img src="data:image/jpeg;base64,${b.toString('base64')}"><figcaption>${frame.n} · ${esc(frame.headline)}</figcaption></figure>`)}
 await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;padding:36px;background:#e9eef2;color:#132638;font:800 20px -apple-system,BlinkMacSystemFont,sans-serif}h1{margin:0 0 26px;font-size:34px}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:22px}figure{margin:0;padding:12px;background:white;border-radius:18px;box-shadow:0 12px 32px #13263822}img{display:block;width:100%;height:auto;aspect-ratio:${device.width}/${device.height};object-fit:cover;background:#061426;border-radius:10px}figcaption{padding:12px 2px 0;font-size:15px;line-height:1.2}</style><h1>Mook Worlds 1.2 · ${device.label} · artistic gameplay R1</h1><div class="grid">${cards.join('')}</div>`);
 await page.screenshot({path:path.join(root,'contact-sheets',`mook-worlds-ios-en-US-v1.2-${device.key}.jpg`),type:'jpeg',quality:94});await page.close();
}
await browser.close();
