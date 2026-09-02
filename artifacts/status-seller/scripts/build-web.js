const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'dist');
const iconPath = path.join(projectRoot, 'assets/images/icon.png');

if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}

const expoArgs = ['exec', 'expo', 'export', '--platform', 'web', '--output-dir', 'dist'];
const result = spawnSync('pnpm', expoArgs, {
  cwd: projectRoot,
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}

fs.copyFileSync(iconPath, path.join(outputDir, 'pwa-icon.png'));

const manifest = {
  name: 'StatusSeller',
  short_name: 'StatusSeller',
  description: 'Create beautiful product posters and share them everywhere.',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#F8FAFC',
  theme_color: '#25D366',
  icons: [
    { src: './pwa-icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'any maskable' },
  ],
};
fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

const serviceWorker = `
const CACHE_NAME = 'statusseller-shell-v1';
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.includes('/api/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }))
  );
});
`;
fs.writeFileSync(path.join(outputDir, 'sw.js'), serviceWorker.trim());

const indexPath = path.join(outputDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
const pwaHead = [
  '<link rel="manifest" href="./manifest.json">',
  '<meta name="theme-color" content="#25D366">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
  '<link rel="apple-touch-icon" href="./pwa-icon.png">',
].join('');
indexHtml = indexHtml.replace('</head>', `${pwaHead}</head>`);
indexHtml = indexHtml.replace('</body>', '<script>if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");</script></body>');
fs.writeFileSync(indexPath, indexHtml);

console.log(`PWA export ready in ${outputDir}`);