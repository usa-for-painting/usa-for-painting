import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
for (const file of ['index.html', 'privacy.html']) {
  const html = await readFile(file, 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${file}: duplicate IDs`);
  for (const [, ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(https?:|tel:|sms:|\.\/)/.test(ref)) continue;
    if (ref.startsWith('#')) { if (ref !== '#') assert.ok(ids.includes(ref.slice(1)), `Missing anchor ${ref}`); }
    else await access(ref);
  }
  for (const [tag] of html.matchAll(/<img\b[^>]+>/g)) assert.ok(/\balt=/.test(tag), `Missing alt: ${tag}`);
}
assert.ok((await readFile('index.html','utf8')).includes('tel:+13024524001'));
JSON.parse((await readFile('index.html','utf8')).match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
console.log('Passed: local assets, internal links, unique IDs, image alt text, phone link and structured data.');
