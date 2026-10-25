const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const capacitor = fs.readFileSync(path.join(root, 'capacitor.config.ts'), 'utf8');
const project = fs.readFileSync(path.join(root, 'ios/App/App.xcodeproj/project.pbxproj'), 'utf8');
const infoPlist = fs.readFileSync(path.join(root, 'ios/App/App/Info.plist'), 'utf8');
const metadata = fs.readFileSync(path.join(root, 'AppStore/METADATA.md'), 'utf8');
const checklist = fs.readFileSync(path.join(root, 'AppStore/RELEASE_CHECKLIST.md'), 'utf8');

for (const [name, contents] of Object.entries({ capacitor, project, metadata, checklist })) {
  assert.doesNotMatch(contents, /com\.scoropolis\.mookworlds/, `${name} must not retain the Scoropolis bundle ID`);
  assert.doesNotMatch(contents, /48NQ2H8ZHB/, `${name} must not retain the Scoropolis team ID`);
}

assert.match(capacitor, /appId: 'com\.skygardenapps\.mookworlds'/);
assert.equal((project.match(/PRODUCT_BUNDLE_IDENTIFIER = com\.skygardenapps\.mookworlds;/g) || []).length, 2);
assert.equal((project.match(/DEVELOPMENT_TEAM = 588GPA4GL2;/g) || []).length, 2);
assert.equal((project.match(/CODE_SIGN_STYLE = Automatic;/g) || []).length, 2);
assert.equal((project.match(/MARKETING_VERSION = 1\.3;/g) || []).length, 2);
assert.equal((project.match(/CURRENT_PROJECT_VERSION = 6;/g) || []).length, 2);
assert.doesNotMatch(project, /PROVISIONING_PROFILE_SPECIFIER/);
assert.match(infoPlist, /<key>UIRequiresFullScreen<\/key>\s*<true\/>/);
assert.match(metadata, /Bundle ID:\*\* `com\.skygardenapps\.mookworlds`/);
assert.match(checklist, /Register bundle ID `com\.skygardenapps\.mookworlds` on team `588GPA4GL2`/);

for (const [file,size] of [['mook-map-marker.png',128],['mook-map-marker@2x.png',256]]) {
  const png=fs.readFileSync(path.join(root,'assets',file));
  assert.equal(png.subarray(1,4).toString(),'PNG',`${file} must be a PNG`);
  assert.equal(png.readUInt32BE(16),size,`${file} width`);
  assert.equal(png.readUInt32BE(20),size,`${file} height`);
  assert.equal(png[25],6,`${file} must retain RGBA transparency`);
}

console.log(JSON.stringify({ ok: true, bundleId: 'com.skygardenapps.mookworlds', team: '588GPA4GL2' }));
