import { mkdir, copyFile, cp, readdir, writeFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'services.html', 'work.html', 'designs.html', 'team.html', 'reviews.html', 'privacy.html', 'styles.css', 'premium.css', 'feature.css', 'app.js', 'robots.txt', 'sitemap.xml', '.nojekyll']) await copyFile(file, `dist/${file}`);
await cp('assets', 'dist/assets', { recursive: true });
await cp('content', 'dist/content', { recursive: true });
const mediaFolders = ['homepage', 'work', 'designs'];
const media = {};
for (const folder of mediaFolders) {
	const files = await readdir(`content/photos/${folder}`, { withFileTypes: true });
	media[folder] = files.filter(file => file.isFile() && /\.(avif|gif|jpe?g|png|webp)$/i.test(file.name)).map(file => `content/photos/${folder}/${encodeURIComponent(file.name)}`);
}
const videos = await readdir('content/video', { withFileTypes: true });
media.video = videos.filter(file => file.isFile() && /\.(mp4|webm|mov)$/i.test(file.name)).map(file => `content/video/${encodeURIComponent(file.name)}`);
await writeFile('dist/content/media.json', JSON.stringify(media, null, 2));
console.log(`Built static website in dist/ with ${media.homepage.length} homepage photos, ${media.work.length} work photos, and ${media.designs.length} design photos.`);
