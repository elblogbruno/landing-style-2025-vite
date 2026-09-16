import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const data = JSON.parse(fs.readFileSync(path.join(root, 'src/data/professional-data.json'), 'utf8'));
const origin = 'https://brunomoya.com';
const absolute = (url) => url.startsWith('http') ? url : `${origin}${url.startsWith('/') ? url : `/${url}`}`;
const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const formatPeriod = ({ startDate, endDate }) => `${startDate} - ${endDate || 'Present'}`;
const tags = (items) => `<ul class="tags" aria-label="Technologies">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
const write = (relativePath, value) => {
  const target = path.join(publicDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
};

const personId = `${origin}/#bruno-moya`;
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': personId,
  name: data.person.name,
  url: data.links.website,
  jobTitle: data.person.headline,
  description: data.person.description,
  email: data.person.email,
  homeLocation: { '@type': 'Place', name: data.person.location },
  sameAs: [data.links.github, data.links.linkedin, data.links.x],
  knowsAbout: [...new Set(Object.values(data.skills).flat())],
  worksFor: [
    { '@type': 'Organization', name: 'TopBrokers.io', url: 'https://topbrokers.io/' },
    { '@type': 'Organization', name: 'Glassear', url: 'https://www.glassear.com/' }
  ],
  alumniOf: data.education.map((item) => ({ '@type': 'EducationalOrganization', name: item.institution })),
  knowsLanguage: data.person.languages
};
const projectJsonLd = (project) => ({
  '@context': 'https://schema.org',
  '@type': ['SoftwareSourceCode', 'SoftwareApplication'],
  '@id': absolute(project.url),
  name: project.name,
  headline: project.title,
  description: project.description,
  author: { '@id': personId },
  url: absolute(project.url),
  ...(project.repository ? { codeRepository: project.repository } : {}),
  programmingLanguage: project.technologies.filter((value) => ['Python', 'TypeScript', 'Java'].includes(value)),
  keywords: project.technologies.join(', '),
  applicationCategory: project.category
});
const jsonLdScript = (schemas) => `<script type="application/ld+json">${JSON.stringify(schemas)}</script>`;

const nav = `<header><a class="brand" href="/">BM<span>.</span></a><nav aria-label="Professional profile"><a href="/experience/">Experience</a><a href="/projects/">Projects</a><a href="/resume/">Resume</a><a href="/llms.txt">llms.txt</a></nav></header>`;
const footer = `<footer><p>- Bruno Moya</p><nav aria-label="Professional links"><a href="${data.links.github}">GitHub</a><a href="${data.links.linkedin}">LinkedIn</a><a href="${data.links.contact}">Contact Bruno Moya</a><a href="/profile.json">Profile JSON</a></nav></footer>`;
const layout = ({ title, description, canonical, body, schemas = [personJsonLd] }) => `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="author" content="Bruno Moya">
<meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="${absolute(canonical)}">
<meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${absolute(canonical)}"><meta property="og:image" content="${origin}/images-webp/hero/cover-better.webp">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${origin}/images-webp/hero/cover-better.webp">
<link rel="stylesheet" href="/professional.css">${jsonLdScript(schemas)}</head><body>
<a class="skip-link" href="#main-content">Skip to content</a>${nav}<main id="main-content">${body}</main>${footer}</body></html>`;

const experienceArticles = data.experience.map((item) => `<article class="detail-card">
<p class="eyebrow"><time datetime="${item.startDate}">${formatPeriod(item)}</time> - ${escapeHtml(item.location)}</p>
<h2>${escapeHtml(item.role)} - <a href="${item.companyUrl}">${escapeHtml(item.company)}</a></h2>
<p>${escapeHtml(item.summary)}</p>
${item.highlights.length ? `<ul>${item.highlights.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul>` : ''}
${tags(item.technologies)}</article>`).join('');

const projectCards = data.projects.map((project) => `<article class="detail-card">
<p class="eyebrow">${escapeHtml(project.category)}</p><h2><a href="${project.url}">${escapeHtml(project.title)}</a></h2>
<p class="outcome">${escapeHtml(project.outcome)}</p><p>${escapeHtml(project.description)}</p>${tags(project.technologies)}
<p><a href="${project.url}">Read the ${escapeHtml(project.name)} technical case study </a></p>
${project.repository ? `<p><a href="${project.repository}">View ${escapeHtml(project.name)} on GitHub ?</a></p>` : ''}</article>`).join('');

const resumeBody = `<section class="page-hero"><p class="eyebrow">Resume</p><h1>${escapeHtml(data.person.name)}</h1><p class="headline">${escapeHtml(data.person.headline)}</p><p>${escapeHtml(data.person.description)}</p>
<div class="actions"><a class="button" href="${data.links.resume}">Download Bruno Moya's resume PDF</a><a href="${data.links.contact}">Contact Bruno Moya</a></div></section>
<section><h2>About me</h2><p>${escapeHtml(data.positioning.intro)}</p><strong>${escapeHtml(data.positioning.principle)}</strong></section>
<section><h2>Experience</h2>${experienceArticles}</section>
<section><h2>Selected projects</h2>${projectCards}</section>
<section><h2>Skills</h2>${Object.entries(data.skills).map(([group, skills]) => `<article><h3>${escapeHtml(group)}</h3>${tags(skills)}</article>`).join('')}</section>
<section><h2>Education</h2>${data.education.map((item) => `<article><h3>${escapeHtml(item.degree)}</h3><p>${escapeHtml(item.institution)} - <time datetime="${item.startDate}">${item.startDate}-${item.endDate}</time> - ${escapeHtml(item.location)}</p></article>`).join('')}</section>
<section><h2>Awards</h2>${data.awards.map((item) => `<article><h3><a href="${item.url}">${escapeHtml(item.name)}</a></h3><p>${escapeHtml(item.organization)} - <time datetime="${item.date}">${item.date}</time></p></article>`).join('')}</section>`;
write('resume/index.html', layout({ title: 'Bruno Moya Resume | Software Developer', description: data.person.description, canonical: '/resume/', body: resumeBody, schemas: [personJsonLd, ...data.projects.map(projectJsonLd)] }));
write('experience/index.html', layout({ title: 'Bruno Moya Experience | AI, Backend, Infrastructure & XR', description: 'Professional experience of Bruno Moya, CTO at TopBrokers.io and Founder of Glassear.', canonical: '/experience/', body: `<section class="page-hero"><p class="eyebrow">Professional experience</p><h1>Hands-on technical ownership</h1><p>Production software, backend systems, infrastructure, AI agents and XR.</p></section><section>${experienceArticles}</section>` }));
write('projects/index.html', layout({
  title: 'Bruno Moya Projects | AI Agents, Software Systems & XR',
  description: 'Selected AI, agentic software and XR projects built by Bruno Moya.',
  canonical: '/projects/',
  body: '<section class="page-hero"><p class="eyebrow">Selected projects</p><h1>Software, automation and mixed reality</h1><p>Architecture, state, tools, validation, automation and human control.</p></section><section>' + projectCards + '</section>',
  schemas: [personJsonLd, ...data.projects.map(projectJsonLd)]
}));

for (const project of data.projects) {
  const body = `<article class="project-page"><p class="eyebrow">${escapeHtml(project.category)}</p><h1>${escapeHtml(project.title)}</h1><p class="headline">${escapeHtml(project.description)}</p><p class="outcome">${escapeHtml(project.outcome)}</p>
<section><h2>Problem</h2><p>${escapeHtml(project.problem)}</p></section>
<section><h2>What I built</h2><p>${escapeHtml(project.description)}</p><ul>${project.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
<section><h2>Architecture</h2><p>${escapeHtml(project.architecture)}</p></section>
<section><h2>AI / agentic component</h2><p>${escapeHtml(project.aiComponent)}</p></section>
<section><h2>Deterministic components</h2><p>${escapeHtml(project.deterministicComponent)}</p><blockquote>${escapeHtml(project.principle)}</blockquote></section>
<section><h2>Stack</h2>${tags(project.technologies)}</section>
<section><h2>My role</h2><p>${escapeHtml(project.role)}</p></section>
<section><h2>Outcome</h2><p>${escapeHtml(project.outcome)}</p></section>
<div class="actions">${project.repository ? `<a class="button" href="${project.repository}">View ${escapeHtml(project.name)} on GitHub</a>` : ''}<a href="/projects/">View all selected projects</a></div></article>`;
  write(`projects/${project.id}/index.html`, layout({ title: `${project.title} | Bruno Moya`, description: project.description, canonical: project.url, body, schemas: [personJsonLd, projectJsonLd(project)] }));
}

const publicProfile = {
  schemaVersion: data.schemaVersion,
  lastUpdated: data.lastUpdated,
  name: data.person.name,
  headline: data.person.headline,
  description: data.person.description,
  location: data.person.location,
  roles: data.person.currentRoles,
  skills: data.skills,
  experience: data.experience,
  projects: [...data.projects, ...data.broaderProjects],
  education: data.education,
  awards: data.awards,
  languages: data.person.languages,
  links: data.links
};
write('profile.json', JSON.stringify(publicProfile, null, 2) + '\n');

const llms = `# Bruno Moya

> ${data.person.headline}. ${data.person.description}

Bruno Moya is based in Barcelona, Spain. He is CTO at TopBrokers.io and founder of Glassear. ${data.positioning.intro}

## Current work
${data.experience.slice(0, 2).map((item) => `- **${item.role}, ${item.company}** (${formatPeriod(item)}): ${item.summary}`).join('\n')}

## Selected projects
${data.projects.map((project) => `- [${project.title}](${absolute(project.url)}): ${project.description} Outcome: ${project.outcome}${project.repository ? ` [Repository](${project.repository})` : ''}`).join('\n')}

## Core skills
${Object.entries(data.skills).map(([group, skills]) => `- **${group}:** ${skills.join(', ')}`).join('\n')}

## Canonical professional resources
- [Human-readable resume](${origin}/resume/)
- [Experience](${origin}/experience/)
- [Projects](${origin}/projects/)
- [Structured professional profile](${origin}/profile.json)
- [Resume as Markdown](${origin}/resume.md)
- [Projects as Markdown](${origin}/projects.md)
- [GitHub](${data.links.github})
- [LinkedIn](${data.links.linkedin})
- [Resume PDF](${origin}${data.links.resume})
- [Professional contact](${data.links.contact})

This file follows the emerging llms.txt convention; llms.txt is not an official universal web standard.
`;
write('llms.txt', llms);

const resumeMd = `# ${data.person.name}\n\n## ${data.person.headline}\n\n${data.person.description}\n\n${data.positioning.intro}\n\n## Experience\n\n${data.experience.map((item) => `### ${item.role} - ${item.company}\n\n${formatPeriod(item)} - ${item.location}\n\n${item.summary}\n\n${item.highlights.map((value) => `- ${value}`).join('\n')}\n\n**Technologies:** ${item.technologies.join(', ')}`).join('\n\n')}\n\n## Selected projects\n\n${data.projects.map((project) => `### [${project.title}](${absolute(project.url)})\n\n${project.description}\n\n**Outcome:** ${project.outcome}\n\n**Stack:** ${project.technologies.join(', ')}${project.repository ? `\n\n[Repository](${project.repository})` : ''}`).join('\n\n')}\n\n## Skills\n\n${Object.entries(data.skills).map(([group, skills]) => `- **${group}:** ${skills.join(', ')}`).join('\n')}\n\n## Contact\n\n- [Email](${data.links.contact})\n- [GitHub](${data.links.github})\n- [LinkedIn](${data.links.linkedin})\n`;
write('resume.md', resumeMd);
write('projects.md', `# Bruno Moya - Selected Projects\n\n${data.projects.map((project) => `## ${project.title}\n\n${project.description}\n\n- **Problem:** ${project.problem}\n- **Architecture:** ${project.architecture}\n- **AI / agentic:** ${project.aiComponent}\n- **Deterministic:** ${project.deterministicComponent}\n- **Role:** ${project.role}\n- **Outcome:** ${project.outcome}\n- **Stack:** ${project.technologies.join(', ')}\n- **Case study:** ${absolute(project.url)}${project.repository ? `\n- **Repository:** ${project.repository}` : ''}`).join('\n\n')}\n`);

const routes = ['/', '/resume/', '/experience/', '/projects/', ...data.projects.map((project) => project.url), '/profile.json', '/llms.txt', '/resume.md', '/projects.md'];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${absolute(route)}</loc><lastmod>${data.lastUpdated}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
fs.copyFileSync(path.join(root, 'src/app/professional.css'), path.join(publicDir, 'professional.css'));

const fallback = `<!-- PROFESSIONAL_FALLBACK_START --><div id="root"></div><noscript><main><article><h1>${escapeHtml(data.person.name)}</h1><h2>${escapeHtml(data.person.headline)}</h2><p>${escapeHtml(data.person.description)}</p><p>${escapeHtml(data.positioning.intro)}</p><section><h2>Current work</h2>${data.experience.slice(0, 2).map((item) => `<article><h3>${escapeHtml(item.role)} - ${escapeHtml(item.company)}</h3><time datetime="${item.startDate}">${formatPeriod(item)}</time><p>${escapeHtml(item.summary)}</p></article>`).join('')}</section><section><h2>Selected projects</h2>${data.projects.map((project) => `<article><h3><a href="${project.url}">${escapeHtml(project.title)}</a></h3><p>${escapeHtml(project.description)}</p></article>`).join('')}</section><p><a href="/resume/">View Bruno Moya's resume</a> - <a href="${data.links.contact}">Contact Bruno Moya</a></p></article></main></noscript><!-- PROFESSIONAL_FALLBACK_END -->`;
const indexPath = path.join(root, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');
index = index
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Bruno Moya | Software Developer & Glassear Founder</title>')
  .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(data.person.description)}">`)
  .replace(/<meta property="og:title"[^>]*>/, '<meta property="og:title" content="Bruno Moya | Software Developer & Glassear Founder">')
  .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(data.person.description)}">`)
  .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${origin}/">`)
  .replace(/<meta name="twitter:title"[^>]*>/, '<meta name="twitter:title" content="Bruno Moya | Software Developer & Glassear Founder">')
  .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${escapeHtml(data.person.description)}">`)
  .replace(/<meta name="keywords"[^>]*>/, '<meta name="keywords" content="Bruno Moya, Software Developer Barcelona, Glassear, Web Development, Backend, Hardware, XR">');
const homeJsonLd = jsonLdScript([personJsonLd, ...data.projects.map(projectJsonLd)]);
const jsonLdPattern = /<script type="application\/ld\+json">[^<]+<\/script>/;
if (jsonLdPattern.test(index)) {
  index = index.replace(jsonLdPattern, homeJsonLd);
} else {
  index = index.replace('</head>', homeJsonLd + '\n</head>');
}
if (!index.includes('rel="canonical"')) {
  index = index.replace('</head>', '<link rel="canonical" href="' + origin + '/">\n</head>');
}
index = index.includes('PROFESSIONAL_FALLBACK_START')
  ? index.replace(/<!-- PROFESSIONAL_FALLBACK_START -->[\s\S]*?<!-- PROFESSIONAL_FALLBACK_END -->/, fallback)
  : index.replace('<div id="root"></div>', fallback);
fs.writeFileSync(indexPath, index);
console.log(`Generated ${routes.length} canonical resources from professional-data.json`);
