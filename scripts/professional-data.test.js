import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (file) => fs.readFileSync(file, 'utf8');
const source = JSON.parse(read('src/data/professional-data.json'));
const profile = JSON.parse(read('public/profile.json'));
const site = JSON.parse(read('src/locales/en/translation.json'));
const spanishSite = JSON.parse(read('src/locales/es/translation.json'));

test('professional data has the required current positioning', () => {
  assert.equal(source.person.tagline, 'I turn emerging technology into real products.');
  assert.match(source.person.headline, /Founder & CEO at Glassear.*CTO at TopBrokers/);
  assert.equal(source.experience[0].company, 'TopBrokers.io');
  assert.equal(source.experience[0].startDate, '2025-11');
  assert.equal(source.experience[1].company, 'Glassear');
  assert.equal(source.experience[1].role, 'Founder & CEO');
  assert.match(source.positioning.intro, /programming at 13/);
  assert.ok(source.positioning.principles.length >= 3 && source.positioning.principles.length <= 4);
});

test('selected projects expose evidence and canonical routes', () => {
  const ids = new Set(source.projects.map((project) => project.id));
  assert.deepEqual(ids, new Set(['jobagent', 'talent-gap-analyzer', 'glassear-studio', 'mapanim']));
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
  assert.ok(profile.projects.length > source.projects.length + source.broaderProjects.length,
    'the catalogue should also carry the featured projects derived from the site');
  assert.match(read('public/llms.txt'), /CTO at TopBrokers\.io/);
  assert.match(read('public/llms.txt'), /JobAgent/);
  assert.match(read('public/llms.txt'), /I turn emerging technology into real products/);
  assert.match(read('public/llms.txt'), /Founder & CEO of Glassear/);
  assert.match(read('public/resume.md'), /Founder & CEO at Glassear/);
  assert.match(read('public/projects.md'), /Glassear Studio/);
});

test('SEO outputs list every canonical professional route', () => {
  const sitemap = read('public/sitemap.xml');
  const robots = read('public/robots.txt');
  for (const route of ['/resume/', '/experience/', '/projects/', '/projects/jobagent/',
    '/projects/talent-gap-analyzer/', '/projects/glassear-studio/', '/projects/mapanim/',
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

test('recognition is stated precisely, without inflated claims', () => {
  const names = profile.awards.map((award) => award.name).join('\n');
  assert.match(names, /2nd Professional Prize · Maker Faire Galicia 2018/);
  assert.match(names, /Top 50 Catalan startups · ACCIÓ 2025/);
  const inflated = /won ACCI|ACCIÓ winner|keynote at (MWC|Mobile World Congress)/i;
  assert.doesNotMatch(JSON.stringify(source), inflated);
  assert.doesNotMatch(JSON.stringify(profile), inflated);
  assert.doesNotMatch(read('public/llms.txt'), inflated);
});

test('the agent layer mirrors the lists the website renders', () => {
  assert.equal(profile.awards.length, site.awards.items.length);
  assert.equal(site.awards.items.length, spanishSite.awards.items.length);
  assert.equal(profile.appearances.length, site.talks.items.length + site.news.items.length);
  assert.equal(profile.education.length, site.education.items.length);

  const names = new Set(profile.projects.map((project) => project.name));
  for (const item of site.projects.items.filter((project) => project.featured)) {
    const url = item.demoUrl || item.githubUrl;
    const covered = names.has(item.title)
      || profile.projects.some((project) => [project.url, project.repository, project.actionUrl].includes(url));
    assert.ok(covered, `featured project missing from the agent layer: ${item.title}`);
  }

  site.building.items.forEach((card, index) => {
    assert.equal(profile.building[index].name, card.name);
    assert.equal(profile.building[index].role, card.role);
    assert.deepEqual(profile.building[index].points, card.points);
  });

  const llms = read('public/llms.txt');
  for (const award of profile.awards) assert.ok(llms.includes(award.name), `llms.txt is missing ${award.name}`);
  for (const item of profile.appearances) assert.ok(llms.includes(item.name), `llms.txt is missing ${item.name}`);
});

test('public professional data contains no unresolved verification markers', () => {
  for (const file of ['src/data/professional-data.json', 'public/profile.json',
    'public/llms.txt', 'public/resume.md', 'public/projects.md']) {
    assert.doesNotMatch(read(file), /TODO_VERIFY/);
  }
});

test('MapAnim links to its case study and real media in both languages', () => {
  const project = source.projects.find((item) => item.id === 'mapanim');
  const html = read('public/projects/mapanim/index.html');
  for (const asset of [project.image]) {
    assert.ok(fs.statSync('public' + asset).size > 1000);
    assert.ok(html.includes(asset));
  }
  assert.match(html, /<h2>Editor<\/h2>/);
  for (const language of ['es', 'en']) {
    const items = JSON.parse(read('src/locales/' + language + '/translation.json')).projects.items;
    const item = items.find((entry) => entry.demoUrl === project.url);
    assert.ok(item.featured);
    assert.equal(item.imageUrl, project.image);
  }
});
