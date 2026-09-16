import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (file) => fs.readFileSync(file, 'utf8');
const source = JSON.parse(read('src/data/professional-data.json'));
const profile = JSON.parse(read('public/profile.json'));

test('professional data has the required current positioning', () => {
  assert.equal(source.person.headline, 'Software Developer & Glassear Founder');
  assert.equal(source.experience[0].company, 'TopBrokers.io');
  assert.equal(source.experience[0].startDate, '2025-11');
  assert.equal(source.experience[1].company, 'Glassear');
  assert.match(source.positioning.intro, /programming at 13/);
});

test('selected AI projects expose evidence and canonical routes', () => {
  const ids = new Set(source.projects.map((project) => project.id));
  assert.deepEqual(ids, new Set(['jobagent', 'talent-gap-analyzer', 'glassear-studio']));
  for (const project of source.projects) {
    assert.ok(project.problem);
    assert.ok(project.architecture);
    assert.ok(project.aiComponent);
    assert.ok(project.deterministicComponent);
    assert.ok(project.role);
    assert.ok(project.outcome);
    assert.ok(fs.existsSync(`public/projects/${project.id}/index.html`));
  }
  assert.match(source.projects[1].outcome, /Winner.*UAB The Hack 2025/);
});

test('machine-readable outputs are complete and generated from source', () => {
  assert.equal(profile.name, source.person.name);
  assert.equal(profile.experience.length, source.experience.length);
  assert.equal(profile.projects.length, source.projects.length + source.broaderProjects.length);
  assert.match(read('public/llms.txt'), /CTO at TopBrokers\.io/);
  assert.match(read('public/llms.txt'), /JobAgent/);
  assert.match(read('public/resume.md'), /Software Developer/);
  assert.match(read('public/projects.md'), /Glassear Studio/);
});

test('SEO outputs list every canonical professional route', () => {
  const sitemap = read('public/sitemap.xml');
  const robots = read('public/robots.txt');
  for (const route of ['/resume/', '/experience/', '/projects/', '/projects/jobagent/',
    '/projects/talent-gap-analyzer/', '/projects/glassear-studio/',
    '/profile.json', '/llms.txt']) {
    assert.match(sitemap, new RegExp(route.replaceAll('/', '\\/')));
  }
  assert.match(robots, /Allow: \/\n/);
  assert.match(robots, /Sitemap: https:\/\/brunomoya\.com\/sitemap\.xml/);
});

test('JSON-LD blocks parse and critical pages remain semantic', () => {
  for (const file of ['index.html', 'public/resume/index.html',
    'public/projects/jobagent/index.html']) {
    const html = read(file);
    assert.match(html, /<main/);
    assert.match(html, /<h1/);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)];
    assert.ok(blocks.length > 0, `${file} should contain JSON-LD`);
    blocks.forEach((block) => assert.doesNotThrow(() => JSON.parse(block[1])));
  }
});

test('public professional data contains no unresolved verification markers', () => {
  for (const file of ['src/data/professional-data.json', 'public/profile.json',
    'public/llms.txt', 'public/resume.md', 'public/projects.md']) {
    assert.doesNotMatch(read(file), /TODO_VERIFY/);
  }
});
