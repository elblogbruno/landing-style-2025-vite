import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = file => fs.readFileSync(file, 'utf8');
const resources = ['llms.txt', 'llms-full.txt', 'profile.json', 'resume.md', 'projects.md', 'index.md', 'en/index.md'];

test('agent resources describe Bruno and link only to current pages', () => {
  const profile = JSON.parse(read('dist/profile.json'));
  const source = JSON.parse(read('src/data/professional-data.json'));
  assert.equal(profile.name, source.person.name);
  assert.equal(profile.experience.length, source.experience.length);
  assert.equal(profile.projects.find(project => project.id === 'glassear-studio').url, 'https://glassear.com/studio/');
  assert.ok(profile.awards.length > 0 && profile.appearances.length > 0);
  for (const resource of resources) {
    const content = read(`dist/${resource}`);
    assert.match(content, /Bruno Moya/);
    assert.doesNotMatch(content, /\uFFFD|TODO_VERIFY/);
    assert.doesNotMatch(content, /https:\/\/brunomoya\.com(?:\/en)?\/(?:projects|resume|experience)\//);
  }
  assert.match(read('dist/llms.txt'), /https:\/\/brunomoya\.com\/profile\.json/);
  assert.match(read('dist/llms-full.txt'), /https:\/\/glassear\.com\/studio\//);
});

test('landing Markdown keeps language and canonical links', () => {
  assert.match(read('dist/index.md'), /^Página: https:\/\/brunomoya\.com\/$/m);
  assert.match(read('dist/en/index.md'), /^Page: https:\/\/brunomoya\.com\/en\/$/m);
  for (const prefix of ['', 'en/']) {
    assert.ok(read(`dist/${prefix}index.html`).includes(`type="text/markdown" href="https://brunomoya.com/${prefix}index.md"`));
  }
});

test('agent files are discoverable without becoming extra search landing pages', () => {
  const htaccess = read('.htaccess');
  assert.match(htaccess, /Header always set X-Robots-Tag "noindex" env=AGENT_FILE/);
  assert.match(htaccess, /Header merge Vary "Accept" env=LANDING_PAGE/);
  assert.match(htaccess, /Header always add Link.*llms\.txt/);
  assert.match(htaccess, /RewriteCond %\{HTTP:Accept\} text\/markdown/);
  const nginx = read('deploy/nginx-agent-files.conf');
  for (const name of ['llms.txt', 'llms-full.txt']) {
    const location = nginx.slice(nginx.indexOf(`location = /${name}`)).split('}')[0];
    assert.match(location, /add_header X-Robots-Tag "noindex" always/);
    assert.doesNotMatch(location, /return 301/);
  }
});
