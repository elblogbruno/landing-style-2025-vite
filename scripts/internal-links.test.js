import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const collectHtml = (directory) => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory()
      ? collectHtml(target)
      : entry.name.endsWith('.html') ? [target] : [];
  });

test('all internal links in canonical HTML resolve to build inputs', () => {
  const files = ['index.html', ...collectHtml('public')];
  const missing = [];
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const href = match[1].split('#')[0].split('?')[0];
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) continue;
      if (href.startsWith('#')) continue;
      const relative = href.startsWith('/src/') ? href.slice(1) : href === '/'
        ? 'index.html'
        : href.endsWith('/')
          ? path.join('public', href, 'index.html')
          : path.join('public', href);
      if (!fs.existsSync(relative)) missing.push(`${file}: ${href}`);
    }
  }
  assert.deepEqual(missing, []);
});
