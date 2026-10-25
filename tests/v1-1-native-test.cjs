const fs = require('node:fs');
const assert = require('node:assert/strict');

const read = path => fs.readFileSync(path, 'utf8');
const commerce = read('ios/App/App/MookCommercePlugin.swift');
const ads = read('ios/App/App/MookAdsPlugin.swift');
const bridge = read('ios/App/App/MookBridgeViewController.swift');
const scene = read('ios/App/App/SceneDelegate.swift');
const plist = read('ios/App/App/Info.plist');
const podfile = read('ios/App/Podfile');
const podlock = read('ios/App/Podfile.lock');
const project = read('ios/App/App.xcodeproj/project.pbxproj');
const monetization = read('docs/MONETIZATION.md');

const productIDs = [
  'com.skygardenapps.mookworlds.power.sky.5',
  'com.skygardenapps.mookworlds.power.sun.5',
  'com.skygardenapps.mookworlds.power.rock.5',
  'com.skygardenapps.mookworlds.power.time.5',
  'com.skygardenapps.mookworlds.power.bundle.12',
  'com.skygardenapps.mookworlds.removeads'
];
for (const id of productIDs) {
  assert.match(commerce, new RegExp(id.replaceAll('.', '\\.')));
  assert.match(monetization, new RegExp(id.replaceAll('.', '\\.')));
}
assert.match(commerce, /VerificationResult/);
assert.match(commerce, /Transaction\.unfinished/);
assert.match(commerce, /await transaction\.finish\(\)/);
assert.match(commerce, /AppStore\.sync\(\)/);
assert.match(commerce, /bridge\?\.viewController/, 'StoreKit purchase presentation needs Capacitor’s active view controller');
assert.match(commerce, /purchase\(confirmIn:\s*viewController/, 'modern iOS purchases must receive an explicit confirmation view controller');
assert.match(ads, /ca-app-pub-3940256099942544\/4411468910/);
assert.match(ads, /#if DEBUG/);
assert.match(ads, /MookAdsEnabled/);
assert.match(ads, /requestConsentInfoUpdate/);
assert.match(ads, /loadAndPresentIfRequired/);
assert.match(ads, /isTaggedForUnderAgeOfConsent\s*=\s*false/);
assert.match(ads, /canRequestAds/);
assert.match(ads, /showPrivacyOptions/);
const appID = plist.match(/<key>GADApplicationIdentifier<\/key>\s*<string>([^<]+)<\/string>/)?.[1];
const interstitialID = plist.match(/<key>MookAdMobInterstitialID<\/key>\s*<string>([^<]+)<\/string>/)?.[1];
assert.match(appID || '', /^ca-app-pub-\d+~\d+$/);
assert.match(interstitialID || '', /^ca-app-pub-\d+\/\d+$/);
assert.notEqual(appID, 'ca-app-pub-3940256099942544~1458002511');
assert.match(plist, /<key>MookAdsEnabled<\/key>\s*<false\/>/);
assert.match(podfile, /Google-Mobile-Ads-SDK/);
assert.match(podlock, /Google-Mobile-Ads-SDK \(12\.14\.0\)/);
assert.match(bridge, /registerPluginInstance\(MookCommercePlugin\(\)\)/, 'Capacitor local plugins must be registered as instances at runtime');
assert.match(bridge, /registerPluginInstance\(MookAdsPlugin\(\)\)/, 'Capacitor local plugins must be registered as instances at runtime');
assert.doesNotMatch(bridge, /registerPluginType\(/, 'registerPluginType does not expose local Capacitor plugins to JavaScript');
assert.match(scene, /rootViewController\s*=\s*MookBridgeViewController\(\)/, 'the runtime scene must instantiate the controller that registers native commerce');
assert.doesNotMatch(scene, /rootViewController\s*=\s*CAPBridgeViewController\(\)/, 'the generic bridge leaves MookCommerce unavailable and greys every purchase');
for (const file of ['MookBridgeViewController.swift','MookCommercePlugin.swift','MookAdsPlugin.swift']) assert.match(project, new RegExp(file.replace('.', '\\.')));
console.log(JSON.stringify({ok:true,products:productIDs.length,admob:'production-identifiers-configured',ump:'consent-gated-general-audience',releaseAdsEnabled:false}));
