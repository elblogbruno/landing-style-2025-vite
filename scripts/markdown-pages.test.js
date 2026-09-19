import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

// The contract nginx depends on: every HTML page has a markdown twin beside it, and every
// twin has a token count in the generated map. A page added to the generator without a
// markdown counterpart would silently fall back to HTML for agents; this catches that.

const collectPages = (directory) => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectPages(target);
    return entry.name === 'index.html' ? [target] : [];
  });

const routeOf = (file) => `/${path.relative('public', path.dirname(file)).split(path.sep).filter(Boolean).join('/')}/`.replace('//', '/');

test('every generated page has a markdown twin', () => {
  const missing = collectPages('public')
    .filter((file) => !fs.existsSync(file.replace(/index\.html$/, 'index.md')));
  assert.deepEqual(missing, []);
});

test('the home page markdown twin exists for both languages', () => {
  for (const file of ['public/index.md', 'public/en/index.md']) {
    assert.ok(fs.existsSync(file), `${file} is missing`);
  }
});

test('markdown twins lead with a heading and cite their canonical URL', () => {
  const twins = collectPages('public').map((file) => file.replace(/index\.html$/, 'index.md'));
  for (const file of ['public/index.md', 'public/en/index.md', ...twins]) {
    const markdown = fs.readFileSync(file, 'utf8');
    assert.match(markdown, /^# \S/, `${file} does not start with an H1`);
    assert.match(markdown, /^(Page|Página): https:\/\/brunomoya\.com\//m, `${file} has no canonical URL`);
  }
});

test('.htaccess carries a token estimate for every markdown twin', () => {
  const htaccess = fs.readFileSync('.htaccess', 'utf8');
  for (const route of new Set(['/', '/en/', ...collectPages('public').map(routeOf)])) {
    const pattern = new RegExp(`SetEnvIf Request_URI "\\^${route.replace(/\/$/, '')}/\\?\\(index\\\\\\.md\\)\\?\\$" MD_TOKENS=\\d+`);
    assert.match(htaccess, pattern, `${route} has no token estimate in .htaccess`);
  }
});

test('.htaccess negotiates markdown before it serves the directory', () => {
  const htaccess = fs.readFileSync('.htaccess', 'utf8');
  // The -f/-d rule ends rewriting with [L]; reaching it first would serve the HTML index
  // to an agent asking for markdown, which is exactly the bug this ordering prevents.
  assert.ok(
    htaccess.indexOf('%{HTTP:Accept} text/markdown') < htaccess.indexOf('%{REQUEST_FILENAME} -f'),
    'the markdown rules must come before the -f/-d passthrough rule'
  );
  assert.match(htaccess, /Header merge Vary "Accept"/, 'Vary: Accept is required on both representations');
  assert.match(htaccess, /AddType "text\/markdown; charset=utf-8" \.md/, '.md must be served as text/markdown');
});
