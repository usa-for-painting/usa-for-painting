import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(process.env.SERVE_DIST === '1' ? 'dist' : '.');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.vtt': 'text/vtt; charset=utf-8', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };
http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const target = path.resolve(root, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
    const relative = path.relative(root, target);
    if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(part => part.startsWith('.')) || !['index.html','services.html','work.html','designs.html','team.html','reviews.html','privacy.html','styles.css','premium.css','feature.css','app.js','robots.txt','sitemap.xml','assets','content'].includes(relative.split(path.sep)[0])) {
      response.writeHead(404); response.end('Not found'); return;
    }
    if (!(await stat(target)).isFile()) throw new Error('Not a file');
    const content = await readFile(target);
    const headers = { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes' };
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
      const start = Number(range[1]);
      const end = range[2] ? Math.min(Number(range[2]), content.length - 1) : content.length - 1;
      if (start > end || start >= content.length) { response.writeHead(416, { 'Content-Range': `bytes */${content.length}` }); response.end(); return; }
      response.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${content.length}`, 'Content-Length': end - start + 1 });
      response.end(content.subarray(start, end + 1));
    } else { response.writeHead(200, { ...headers, 'Content-Length': content.length }); response.end(content); }
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}`));
