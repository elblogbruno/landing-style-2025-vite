# Deploy: bilingual landing only

`npm run build` prepares the landing in `/` and `/en/`, its assets, a two-URL sitemap,
robots.txt and a real 404. It also generates `llms.txt`, `llms-full.txt`, `profile.json`,
`resume.md`, `projects.md`, and the landing's Spanish/English Markdown representations.
It does not create standalone project/resume HTML pages. `.htaccess` redirects retired
HTML URLs before checking files on disk.

Upload new assets before the HTML. Never use a whole-root delete/sync: the same document
root contains `old`, `v1`, `v2`, `v3`, `v4` and `v5`. Back up the active files first and
remove only the explicit generated paths listed in `scripts/generate-professional-pages.js`.
Keep existing hashed assets for open browser tabs. Legacy folders must retain their files.

The retired Glassear Studio case study redirects directly to https://glassear.com/studio/.
Other project pages lead to the landing's projects section; resume/experience lead to its
experience section. Keep these 301s so historical links remain usable.

## Published 2026-10-09

163 files uploaded; 14 tests and the build passed. Production checks confirmed both
landing languages, 13 retired URLs returning 301, a real 404, and all 23 JS/CSS assets.
The six legacy versions return 200; SHA-256 comparison of their 21,268 files matched
before and after publication. Historical root assets were retained for open browser tabs.

Server backup: `/root/bruno-landing-only-20261009/before-active.tar.gz` (active files,
retired pages, nginx includes and discovery DNS zone). Integrity manifests and deployment
result are stored alongside it. Local source before this change is backed up at
`C:/Users/elblo/AppData/Local/Temp/bruno-before-landing-only-20261009.zip`.

That deployment initially retired agent copies too. The follow-up below restores them.

## Agent resources restored 2026-10-09

Agent files are available again, generated from the existing professional data and website
translations. Internal case-study URLs now point to landing sections or the official
Glassear Studio page. Only `/` and `/en/` remain in the sitemap.

The two nginx includes serve llms text with a short cache and `X-Robots-Tag: noindex`.
Apache adds noindex to the other agent files and advertises llms/profile links from the
landing. `Accept: text/markdown` returns the corresponding landing Markdown; ordinary
browser requests receive HTML with `Vary: Accept`. The discovery DNS record names the
restored resources.

Server backup for this follow-up: `/root/bruno-agent-restore-20261009/before-active.tar.gz`.
The deployment writes only explicitly selected active files and checks legacy file hashes.

Verified after publication: 17 tests passed; all seven agent resources return 200 with
their appropriate MIME type and noindex header. Both landing languages serve HTML to
browsers and Markdown on request, with Vary: Accept. Retired HTML pages still redirect,
the sitemap still has two URLs, and all 21,268 legacy file hashes remain unchanged.

## CV and content update 2026-10-24

Synced experience, projects, skills and talks with the current CV (EN/ES) and replaced both
CV PDFs. 170 files uploaded with the same procedure (no nginx or DNS changes); 17 tests and
the build passed. Production checks: both landing languages, both PDFs (hash matches the
build), the agent files, the sitemap, a real 404, the hashed assets, Markdown on request,
and the legacy folders. All 21,268 legacy file hashes remain unchanged.

Server backup: `/root/bruno-cv-update-20261024/before-active.tar.gz`.
