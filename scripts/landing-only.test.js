import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = file => fs.readFileSync(file, 'utf8');

test('the sitemap contains only the two languages of the landing', () => {
  const urls = [...read('dist/sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  assert.deepEqual(urls, ['https://brunomoya.com/', 'https://brunomoya.com/en/']);
});

test('retired HTML pages stay absent while landing schemas remain personal', () => {
  for (const route of ['projects', 'resume', 'experience', 'en/projects', 'en/resume', 'en/experience']) {
    assert.equal(fs.existsSync(`dist/${route}`), false, `${route} must not be published`);
  }
  for (const file of ['dist/index.html', 'dist/en/index.html']) {
    const html = read(file);
    assert.doesNotMatch(html, /href="(?:\/en)?\/(?:projects|resume|experience)\//);
    assert.match(html, /type="text\/markdown"/);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)]
      .flatMap(([, json]) => JSON.parse(json));
    assert.deepEqual(schemas.map(schema => schema['@type']), ['Person']);
    assert.equal(schemas[0].url, 'https://brunomoya.com/');
  }
});

test('retired routes redirect without capturing legacy version folders', () => {
  const htaccess = read('.htaccess');
  assert.ok(htaccess.includes('RewriteRule ^(en/)?projects/glassear-studio(?:/.*)?$ https://glassear.com/studio/ [R=301,L]'));
  const rules = [...htaccess.matchAll(/^\s*RewriteRule (\S+) (\S+) \[([^\]]+)\]/gm)]
    .filter(([, , , flags]) => flags.includes('R=301') && flags.includes('L') && flags.includes('NE'));
  for (const version of ['old', 'v1', 'v2', 'v3', 'v4', 'v5']) {
    for (const [, pattern] of rules) assert.equal(new RegExp(pattern).test(`${version}/`), false);
  }
  assert.doesNotMatch(htaccess, /MD_TOKENS|MD_HREF/);
});
