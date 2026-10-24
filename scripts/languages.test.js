import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = file => fs.readFileSync(file, 'utf8');
const es = JSON.parse(read('src/locales/es/translation.json'));
const en = JSON.parse(read('src/locales/en/translation.json'));
const data = JSON.parse(read('src/data/professional-data.json'));

test('both languages provide the same interface keys', () => {
  const keys = (value, prefix = '') => Object.entries(value).flatMap(([key, item]) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? keys(item, prefix + key + '.')
      : [prefix + key]).sort();
  assert.deepEqual(keys(es), keys(en));
});
