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

test('professional pages retain language, counterpart links and shared images', () => {
  const routes = ['resume', 'experience', 'projects', ...data.projects.map(project => 'projects/' + project.id)];
  for (const route of routes) {
    const spanish = read('public/' + route + '/index.html');
    const english = read('public/en/' + route + '/index.html');
    for (const [lang, html, prefix, other] of [['es', spanish, '', '/en'], ['en', english, '/en', '']]) {
      assert.ok(html.includes('<html lang="' + lang + '">'), route);
      assert.ok(html.includes('rel="canonical" href="https://brunomoya.com' + prefix + '/' + route + '/"'), route);
      assert.ok(html.includes('href="' + other + '/' + route + '/" lang='), route);
      assert.doesNotMatch(html, /undefined|\$\{label/);
      assert.ok(html.includes('href="' + prefix + '/projects/"'), route);
    }
    const images = html => [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(images(spanish), images(english), route);
  }
  assert.match(read('public/projects/mapanim/index.html'), /El problema/);
  assert.match(read('public/en/projects/mapanim/index.html'), />Problem</);
  assert.match(read('public/resume/index.html'), /href="\/cv-español.pdf"/);
  assert.match(read('public/en/resume/index.html'), /href="\/cv-english.pdf"/);
});
