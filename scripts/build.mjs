import { mkdir, copyFile, cp } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'services.html', 'work.html', 'designs.html', 'team.html', 'reviews.html', 'privacy.html', 'styles.css', 'premium.css', 'feature.css', 'app.js', 'robots.txt', 'sitemap.xml', '.nojekyll']) await copyFile(file, `dist/${file}`);
await cp('assets', 'dist/assets', { recursive: true });
console.log('Built static website in dist/');
