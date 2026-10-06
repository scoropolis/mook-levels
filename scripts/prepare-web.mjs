import { cp, mkdir, rm } from 'node:fs/promises';

await rm('www', { recursive: true, force: true });
await mkdir('www/assets', { recursive: true });
await cp('index.html', 'www/index.html');
await cp('assets/mook-map-marker.png', 'www/assets/mook-map-marker.png');
await cp('assets/mook-map-marker@2x.png', 'www/assets/mook-map-marker@2x.png');
await cp('privacy.html', 'www/privacy.html');
await cp('support.html', 'www/support.html');
