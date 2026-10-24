import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// The home page's floors are prerendered with their text; only their code loads lazily.
// These checks read the built HTML - what a crawler or a reader without JavaScript gets -
// and take the expected words from the same translation files the page renders from.

const read = (file) => fs.readFileSync(file, 'utf8');
const floors = ['hero', 'about', 'experience', 'projects', 'talks', 'awards', 'education', 'contact'];
const text = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ');
const floor = (html, id) => {
  const start = html.indexOf(`<section id="${id}"`);
  const next = floors[floors.indexOf(id) + 1];
  const end = next ? html.indexOf(`<section id="${next}"`) : html.indexOf('</main>');
  assert.ok(start >= 0 && end > start, `section #${id} is missing from the prerendered home`);
  return text(html.slice(start, end));
};

const homes = [
  { lang: 'es', file: 'dist/index.html', prefix: '', other: 'en' },
  { lang: 'en', file: 'dist/en/index.html', prefix: '/en', other: 'es' }
];

for (const { lang, file, prefix, other } of homes) {
  test(`${lang} home prerenders every floor's content in ${lang}`, () => {
    assert.ok(fs.existsSync(file), `${file} is missing: run npm run build before npm test`);
    const html = read(file);
    const t = JSON.parse(read(`src/locales/${lang}/translation.json`));
    const foreign = JSON.parse(read(`src/locales/${other}/translation.json`));

    assert.match(html, new RegExp(`<html lang="${lang}"`));
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'exactly one <h1>');
    assert.doesNotMatch(html, /profile-fallback|PROFESSIONAL_FALLBACK/, 'no hidden copy of the page');
    assert.doesNotMatch(html, /role="status"/, 'no floor was prerendered as its loading placeholder');

    const expected = {
      hero: [t.hero.name],
      experience: [t.experience.title, t.experience.items[0].company, t.experience.items[0].title],
      projects: [t.projects.items.find((project) => project.featured).title],
      talks: [t.talks.unifiedTitle, (t.talks.items.find((talk) => talk.featured) || t.talks.items[0]).title],
      awards: [t.awards.title, t.awards.items[0].title]
    };
    // Real text, not just an empty element with the right id.
    const minimumWords = { hero: 100, experience: 100, projects: 150, talks: 150, awards: 150 };
    for (const [id, phrases] of Object.entries(expected)) {
      const content = floor(html, id);
      for (const phrase of phrases) assert.ok(content.includes(phrase), `#${id} should contain "${phrase}"`);
      assert.ok(content.split(' ').length >= minimumWords[id], `#${id} has only ${content.split(' ').length} words`);
    }
    // Section titles are H2s under the single H1.
    for (const title of [t.experience.title, t.talks.unifiedTitle, t.awards.title]) {
      assert.ok([...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].some(([, h2]) => text(h2).includes(title)), `"${title}" should be an <h2>`);
    }
    // Nothing from the other language, hidden or not.
    for (const title of [foreign.awards.title, foreign.talks.unifiedTitle, foreign.experience.items[0].title])
      if (!expected.experience.includes(title)) assert.ok(!text(html).includes(title), `${lang} home contains ${other} text "${title}"`);
  });

  test(`${lang} home links its pages in plain HTML`, () => {
    const html = read(file);
    assert.doesNotMatch(html, /href="(?:\/en)?\/(?:projects|resume|experience)\//, 'no links to retired pages');
    for (const section of ['projects', 'experience']) assert.ok(html.includes(`href="#${section}"`));
  });
}
