# Deploy: the agent-facing layer on HestiaCP

How brunomoya.com is served to agents, and what that needs from the server:

| Capability | Where it lives |
|---|---|
| `Accept: text/markdown` negotiation | `.htaccess` + generated `index.md` twins |
| `Link` headers (RFC 8288) | `.htaccess`, `mod_headers` |
| Content Signals | `robots.txt`, generated |
| Real 404s instead of the SPA catch-all | `.htaccess` |
| Short cache on the agent text files | `deploy/nginx-agent-files.conf`, a HestiaCP include |

Cloudflare ships several of these as zone toggles; brunomoya.com is not behind Cloudflare,
so they are implemented at the origin.

## Where the negotiation lives, and why

HestiaCP serves this domain through two layers:

```
client -> nginx :443 -> (proxy_pass) -> Apache :8443 -> /home/admin/web/brunomoya.com/public_html
```

nginx serves a fixed list of extensions straight off disk (`PROXY EXT`: html, css, js, txt,
images, …) and proxies everything else to Apache. Two consequences decide the design:

- Every page URL is extension-less (`/`, `/resume/`, `/projects/mapanim/`), so **Apache
  handles all of them**. `.md` is not in `PROXY EXT` either, so markdown reaches Apache too.
- The nginx vhost is generated from a HestiaCP template. Editing it needs root and is lost
  on `v-rebuild-web-domains` unless a custom template is maintained.

So the whole thing is in `.htaccess`, which deploys with the site, needs no root and
survives domain rebuilds. Nothing in HestiaCP itself has to be reconfigured — no template,
no proxy extension, no panel setting.

## One-time server step

`mod_headers` was not enabled on this server, so there was no `x-markdown-tokens` and no
`Vary: Accept`, and the `<IfModule mod_headers.c>` blocks already in `.htaccess` (the HTML
`no-cache` and the immutable asset caching) were silently inert:

```sh
a2enmod headers && systemctl reload apache2
```

Done on 2026-09-19. It is server-wide: any other domain with dormant `mod_headers` rules
starts applying them too. The only other domain with such rules is glassear.com, whose rules
target extensions nginx serves directly, so they never reach Apache regardless.

## What the build produces

`npm run build` (via `prebuild`, `scripts/generate-professional-pages.js`) writes:

- `public/**/index.md` — a markdown twin beside every generated `index.html`, 16 pages,
  Spanish at the root and English under `/en/`, rendered from
  `src/data/professional-data.json` by `scripts/markdown-pages.js`. Same source as the HTML,
  so the two cannot drift.
- The `MARKDOWN_TOKENS` block in `.htaccess` — one `SetEnvIf` per route carrying a token
  estimate, since Apache cannot count tokens. Regenerated on every build; do not hand-edit.

`postbuild` (`scripts/generate-i18n.js`) copies `.htaccess` into `dist/`, so a normal deploy
of `dist/` carries both the twins and the rules.

## How the rules work

```apache
RewriteCond %{HTTP:Accept} text/markdown [NC]
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI}index.md -f
RewriteRule ^ %{REQUEST_URI}index.md [L]
```

`/` finds `/index.md`, `/resume/` finds `/resume/index.md`. These must stay **above** the
`-f`/`-d` passthrough rule, which would otherwise serve the directory's HTML index to an
agent asking for markdown; a test in `scripts/markdown-pages.test.js` enforces that order.

`/resume` without the trailing slash is handled by mod_dir, which 301s to `/resume/`, and
the negotiation happens there. The second rewrite rule covers the same case and is only a
safety net for the day `DirectorySlash` is turned off.

## Deploying

The document root is `/home/admin/web/brunomoya.com/public_html` on 45.94.209.47. Deploy the
whole of `dist/`, not a subset:

```sh
cd dist && tar czf - . | ssh root@45.94.209.47 \
  "cd /home/admin/web/brunomoya.com/public_html && tar xzf - && chown -R root:root . && chmod -R a+rX ."
```

**`index.html` and `assets/` must travel together.** Vite fingerprints the bundles, so an
`index.html` deployed on its own points at hashes that are not on the server; the `.htaccess`
React fallback then answers those requests with the HTML page, the browser receives
`text/html` where it expected JavaScript, and the site renders blank. Nothing errors
server-side, so this fails silently. Check after every deploy:

```sh
for a in $(curl -sS https://brunomoya.com/ | grep -oE '/assets/[^"]+\.(js|css)' | sort -u); do
  curl -sS -o /dev/null -w "%{http_code} %{content_type} $a\n" "https://brunomoya.com$a"
done
```

Every line must be `200 application/javascript` or `200 text/css`. A `200 text/html` is the
failure above.

Two more deploy notes: `public_html/old/` holds legacy content that is not in `dist/`, so
never deploy with `rsync --delete`; and `.htaccess` is overwritten from the repo on every
deploy, so do not hand-edit it on the server.

## The nginx include, and the ten-year cache

`txt` is in HestiaCP's `PROXY EXT` list, so nginx serves `/robots.txt`, `/llms.txt` and
`/llms-full.txt` straight off disk with the template's `expires max` — a **ten-year**
`Cache-Control`. The files agents read most were the ones frozen longest: isitagentready.com
was still reading a cached `/robots.txt` and reporting no Content Signals hours after they
went live.

`deploy/nginx-agent-files.conf` drops that to ten minutes. Install it as a HestiaCP `conf_*`
include, which `v-rebuild-web-domains` preserves, so no template fork is needed:

```sh
for t in nginx.conf_agentfiles nginx.ssl.conf_agentfiles; do
  scp deploy/nginx-agent-files.conf root@45.94.209.47:/home/admin/conf/web/brunomoya.com/$t
done
ssh root@45.94.209.47 "chown root:admin /home/admin/conf/web/brunomoya.com/nginx*conf_agentfiles \
  && chmod 640 /home/admin/conf/web/brunomoya.com/nginx*conf_agentfiles \
  && nginx -t && systemctl reload nginx"
```

It uses `location =` (exact match) on purpose. A server-level regex location loses to the
template's `expires max` block, which is nested inside `location /`; an exact match has the
highest priority in nginx and wins outright. This cost a debugging round — the regex version
loaded cleanly, passed `nginx -t`, appeared in `nginx -T`, and simply never matched.

## Link headers, Content Signals, and 404s

**Link headers** (RFC 8288) go out on every HTML and markdown response, using only
IANA-registered relations and only for resources that exist — an invented `api-catalog`
would be worse than no header:

```
Link: </llms.txt>; rel="service-doc"; type="text/plain"
Link: </profile.json>; rel="describedby"; type="application/json"
Link: </resume/index.md>; rel="alternate"; type="text/markdown"
```

The per-page `alternate` comes from `MD_HREF`, set by the same generated `SetEnvIf` block
that carries the token counts.

**Content Signals** are in the generated `robots.txt`, with the term definitions above them:
the directive expresses a preference, and it only means something if the terms it uses are
stated where a reader finds them.

**404s.** The `.htaccess` used to end with `RewriteRule ^ index.html [L]`, so every missing
URL answered `200` with the React page: WordPress probes, `/.well-known/` lookups and stale
Vite asset URLs all looked like real pages to an agent, and a half-finished deploy rendered
blank instead of failing loudly. The React app has no path-based client routes — its only
navigation is `?skill=...#projects` on the current path — so the catch-all was removed and
`ErrorDocument 404 /404.html` took its place. `public/404.html` is generated with the rest.

## Verifying the negotiation

```sh
curl -sSI -H 'Accept: text/markdown' https://brunomoya.com/ | grep -iE 'content-type|x-markdown-tokens|vary'
curl -sSI https://brunomoya.com/ | grep -i content-type          # still text/html
curl -sS  -H 'Accept: text/markdown' https://brunomoya.com/resume/ | head
```

Expected: `content-type: text/markdown; charset=utf-8`, an `x-markdown-tokens` count,
`vary: Accept` on both representations, unchanged HTML for a browser.

Full check, per the
[markdown-negotiation skill](https://isitagentready.com/.well-known/agent-skills/markdown-negotiation/SKILL.md):

```sh
curl -sS -X POST https://isitagentready.com/api/scan \
  -H 'Content-Type: application/json' -d '{"url":"https://brunomoya.com"}'
```

`checks.contentAccessibility.markdownNegotiation.status` should be `pass`. It was, on
2026-09-19.

## Two things that break this quietly

- **`Vary: Accept` is not optional.** Without it any cache in front of the site can hand a
  browser the markdown, or an agent the HTML. It is `Header merge`, not `set`, because
  mod_deflate already puts `Accept-Encoding` in that header. The browser response ends up
  with two `Vary` headers, one from nginx and one from Apache; caches union them, which is
  correct.
- **`.md` is no longer `text/plain`.** `/resume.md` and `/projects.md` now come back as
  `text/markdown`, which is correct for agents but means a browser downloads them instead of
  displaying them inline.

## Content Signals

`robots.txt` declares `search=yes, ai-input=yes, ai-train=yes`, with the three terms
defined above the directive: it expresses a preference, and it only means something if the
terms it uses are stated where a reader finds them.

All three are yes on purpose. Everything published here is meant to be read, quoted and
learned from by machines as well as people, which is the point of the whole agent layer.
Nothing on this site is gated, rate-limited or blocked by user-agent. `npm test` fails if
any signal goes back to `no`.

## DNS-AID

`_index._agents.brunomoya.com` publishes an SVCB record per
[draft-mozleywilliams-dnsop-dnsaid](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)
and [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460), with a TXT record beside it naming
the entry points:

```
_index  IN  SVCB  1 brunomoya.com. alpn="h2,http/1.1" port=443
_index  IN  TXT   "v=dnsaid1; index=https://brunomoya.com/llms.txt; ..."
```

`_index` is what the draft calls a well-known entry point to "a more complete capability
description via a common schema". It points at the site itself over HTTPS, which is where
that description lives. **No `_a2a` record is published**: those advertise agent-to-agent
endpoints and this domain runs none. A record pointing at a service that does not answer is
worse for an agent than no record.

### Why it is a separate BIND zone

HestiaCP's record store has no SVCB type — `v-add-dns-record admin <domain> _index._agents
SVCB '...'` answers `Error: invalid dns record type format :: SVCB` — and it regenerates the
parent zone file from that store, so records added to the parent by hand disappear the next
time any DNS record changes.

Hestia *does* accept an NS record with an underscore label, so the parent delegates:

```
_agents  IN  NS  ns1.brunomoya.com.
_agents  IN  NS  ns2.brunomoya.com.
```

and `_agents.brunomoya.com` is a zone of its own, defined in `/etc/bind/named.conf.local`
(which HestiaCP never writes to) with `check-names ignore`, since the apex label starts with
an underscore. The zone file is versioned here as `deploy/_agents.brunomoya.com.db`.

To update it:

```sh
scp deploy/_agents.brunomoya.com.db root@45.94.209.47:/etc/bind/agents/
ssh root@45.94.209.47 "chown root:bind /etc/bind/agents/*.db && chmod 640 /etc/bind/agents/*.db \
  && named-checkzone _agents.brunomoya.com /etc/bind/agents/_agents.brunomoya.com.db \
  && rndc reload _agents.brunomoya.com"
```

Bump the SOA serial on every edit, or secondaries and caches will keep the old copy.

### DNSSEC is still outstanding

The scanner reports *"DNS-AID records found, but DNSSEC was not validated"*. The records
resolve through both Cloudflare and Google DoH; what is missing is a signed chain, and it
cannot be finished from the server alone:

```
.com  --DS-->  brunomoya.com  --DS-->  _agents.brunomoya.com
        ^                        ^
        |                        └── add with Hestia once the child zone is signed
        └── only the registrar can publish this one
```

The steps, in order:

1. Sign the parent zone:

   ```sh
   v-change-dns-domain-dnssec admin brunomoya.com yes
   v-list-dnssec-public-key admin brunomoya.com     # prints the DS record
   ```

2. **Paste that DS record at the domain registrar.** This is the step no amount of server
   access can replace: the `.com` zone has to point at the key, and only the registrar can
   ask it to. Until this exists, signing the zone is invisible — validating resolvers treat
   an unsigned-at-the-parent zone as insecure and ignore the signatures, which is also why
   step 1 is safe to do ahead of it.

3. Sign the child zone by adding `dnssec-policy default;` to its stanza in
   `named.conf.local`, then publish its DS in the parent:

   ```sh
   dig @127.0.0.1 _agents.brunomoya.com DNSKEY          # take the KSK
   v-add-dns-record admin brunomoya.com '_agents' DS '<keytag> 13 2 <digest>'
   ```

4. Re-run the scan. `discoverability.dnsAid` should go from `fail` to `pass`.

Verify at each step that the parent zone still answers for A, MX and the subdomains — these
domains carry live mail, and a DNSSEC mistake there is far more expensive than a failed
scanner check.

## Related agent-facing resources

Independent of the negotiation above, and already live: `/llms.txt`, `/llms-full.txt`,
`/profile.json`, `/resume.md`, `/projects.md`, `/sitemap.xml`, JSON-LD on every page, and a
no-JavaScript HTML fallback on the React home page.
