import { cp, mkdir, rm } from 'node:fs/promises';

await rm('www', { recursive: true, force: true });
await mkdir('www', { recursive: true });
await cp('index.html', 'www/index.html');
await cp('privacy.html', 'www/privacy.html');
await cp('support.html', 'www/support.html');
