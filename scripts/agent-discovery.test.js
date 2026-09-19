import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// The agent-facing contract that lives in headers and robots.txt rather than in page
// content: Link relations, Content Signals, and the absence of the catch-all that used to
// answer every missing URL with 200 + HTML.

test('robots.txt grants AI full access, and defines what it is granting', () => {
  const robots = fs.readFileSync('public/robots.txt', 'utf8');
  const match = robots.match(/^Content-Signal: (.+)$/m);
  assert.ok(match, 'robots.txt has no Content-Signal directive');
  // The stated position is full access: everything here is meant to be read, quoted and
  // learned from by machines. A `no` would ask agents to ignore the layer this repo builds
  // for them. Changing the policy means changing this test too, on purpose.
  for (const signal of ['search', 'ai-input', 'ai-train']) {
    assert.match(match[1], new RegExp(`\\b${signal}=yes\\b`), `${signal} is not allowed`);
  }
  // The directive only carries weight if the terms it uses are defined where a reader finds
  // them, so the comment block above it is part of the statement.
  for (const signal of ['search', 'ai-input', 'ai-train']) {
    assert.match(robots, new RegExp(`^#\\s+${signal}\\s+=`, 'm'), `${signal} is declared but never defined`);
  }
});

test('.htaccess advertises only IANA-registered link relations, to resources that exist', () => {
  const htaccess = fs.readFileSync('.htaccess', 'utf8');
  const registered = ['service-doc', 'service-desc', 'describedby', 'alternate', 'api-catalog'];
  const links = [...htaccess.matchAll(/Header always add Link "<([^>]+)>; rel=\\"([^\\]+)\\"/g)];
  assert.ok(links.length >= 2, 'no Link headers configured');
  for (const [, href, rel] of links) {
    assert.ok(registered.includes(rel), `rel="${rel}" is not a registered relation type`);
    // A header pointing at a resource the site does not serve is worse than no header.
    if (href.startsWith('/') && !href.includes('%{')) {
      assert.ok(fs.existsSync(`public${href}`), `Link points at ${href}, which is not in public/`);
    }
  }
});

test('missing URLs are not answered with the React index', () => {
  const htaccess = fs.readFileSync('.htaccess', 'utf8');
  assert.doesNotMatch(
    htaccess,
    /^\s*RewriteRule \^ index\.html/m,
    'the catch-all is back: every probe and stale asset URL would answer 200 + HTML'
  );
  assert.match(htaccess, /^ErrorDocument 404 \/404\.html$/m, 'no 404 document configured');
  assert.ok(fs.existsSync('public/404.html'), 'public/404.html is missing');
});

test('the 404 page links onward and stays out of the index', () => {
  const page = fs.readFileSync('public/404.html', 'utf8');
  assert.match(page, /<meta name="robots" content="noindex">/, '404 page must not be indexed');
  for (const href of ['/', '/llms.txt', '/sitemap.xml', '/profile.json']) {
    assert.ok(page.includes(`href="${href}"`), `404 page does not link to ${href}`);
  }
});
