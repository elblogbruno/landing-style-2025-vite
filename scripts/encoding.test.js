import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('professional outputs contain no replacement characters', () => {
  const files = [
    'index.html',
    'src/data/professional-data.json',
    'src/app/page.tsx',
    'src/locales/en/translation.json',
    'src/locales/es/translation.json',
    'public/sitemap.xml'
  ];
  for (const file of files) {
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /\uFFFD/, file);
  }
});
