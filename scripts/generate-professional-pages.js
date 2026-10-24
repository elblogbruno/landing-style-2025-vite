// Only the bilingual landing is published; projects stay inside its sections.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withWebContent } from './web-content.js';
import { spanishProfile } from './professional-spanish.js';
import { renderMarkdownPages } from './markdown-pages.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const data = withWebContent(JSON.parse(fs.readFileSync(path.join(root, 'src/data/professional-data.json'), 'utf8')),
  JSON.parse(fs.readFileSync(path.join(root, 'src/locales/en/translation.json'), 'utf8')));
const origin = 'https://brunomoya.com';
const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const jsonLdScript = schemas => `<script type="application/ld+json">${JSON.stringify(schemas)}</script>`;

// Explicit generated paths only: legacy versions and landing assets are never cleaned.
for (const relative of ['projects', 'resume', 'experience', 'en/projects', 'en/resume', 'en/experience',
  'professional.css']) {
  const target = path.resolve(publicDir, relative);
  if (!target.startsWith(publicDir + path.sep)) throw new Error('Invalid generated path');
  fs.rmSync(target, { recursive: true, force: true });
}


// Agent resources describe the same personal portfolio without creating more HTML pages.
const absolute = url => url.startsWith('http') ? url : origin + url;
const formatPeriod = ({ startDate, endDate }) => `${startDate} - ${endDate || 'Present'}`;
const landingLinks = text => text
  .replace(/https:\/\/brunomoya\.com(\/en)?\/projects\/glassear-studio\//g, 'https://glassear.com/studio/')
  .replace(/https:\/\/brunomoya\.com(\/en)?\/projects\/(?:[\w-]+\/)?/g, (_, lang = '') => `${origin}${lang}/#projects`)
  .replace(/https:\/\/brunomoya\.com(\/en)?\/(?:resume|experience)\//g, (_, lang = '') => `${origin}${lang}/#experience`)
  .replace(/"\/projects\/glassear-studio\/"/g, '"https://glassear.com/studio/"')
  .replace(/"\/projects\/(?:[\w-]+\/)?"/g, '"https://brunomoya.com/#projects"');
const write = (relative, text) => {
  const target = path.join(publicDir, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, landingLinks(text));
};
const awardTypes = { award: 'Award', recognition: 'Recognition', certificate: 'Certification', publication: 'Publication' };
const awardLine = (item) => `- ${item.name} - ${item.organization} (${item.date})${item.type ? `, ${awardTypes[item.type] || item.type}` : ''}${item.project ? `, project: ${item.project}` : ''}${item.url ? ` [Source](${item.url})` : ''}`;
const appearanceLine = (item) => `- ${item.date || 'Undated'} - ${item.name}${item.event ? ` (${item.event})` : ''}${item.url ? ` [Link](${item.url})` : ''}`;
const buildingLine = (item) => `- **${item.name}** (${item.role}${item.since ? `, since ${item.since}` : ''}): ${item.summary}${item.points && item.points.length ? ` Focus: ${item.points.join('; ')}.` : ''}`;
const publicProfile = {
  schemaVersion: data.schemaVersion,
  lastUpdated: data.lastUpdated,
  name: data.person.name,
  alternateName: data.person.alternateName,
  headline: data.person.headline,
  tagline: data.person.tagline,
  description: data.person.description,
  location: data.person.location,
  roles: data.person.currentRoles,
  positioning: data.positioning,
  building: data.building,
  milestones: data.milestones,
  appearances: data.appearances,
  skills: data.skills,
  experience: data.experience,
  projects: [...data.projects, ...data.broaderProjects],
  education: data.education,
  awards: data.awards,
  languages: data.person.languages,
  links: data.links
};
write('profile.json', JSON.stringify(publicProfile, null, 2) + '\n');

const llmsFull = `# Bruno Moya

> ${data.person.tagline} ${data.person.headline}. ${data.person.description}

Bruno Moya (${data.person.alternateName}) is based in ${data.person.location}. He is Founder & CEO of Glassear and CTO at TopBrokers.io. In his own words: ${data.positioning.intro}

## What he is building
${data.building.map(buildingLine).join('\n')}

## Milestones and recognition
${data.milestones.map((item) => `- ${item.date}: ${item.event}`).join('\n')}

## Awards, recognition, certifications and publications
${data.awards.map(awardLine).join('\n')}

## Education
${data.education.map((item) => `- ${item.degree} - ${item.institution} (${item.startDate}-${item.endDate})${item.location ? `, ${item.location}` : ''}`).join('\n')}

## How he thinks
${data.positioning.principles.map((item) => `- **${item.title}** ${item.body}`).join('\n')}

## Current work
${data.experience.slice(0, 2).map((item) => `- **${item.role}, ${item.company}** (${formatPeriod(item)}): ${item.summary}`).join('\n')}

## Selected projects
${data.projects.map((project) => `- [${project.title}](${absolute(project.url)}): ${project.description} Outcome: ${project.outcome}${project.repository ? ` [Repository](${project.repository})` : ''}`).join('\n')}

## Talks and appearances
${data.appearances.filter((item) => item.kind === 'talk').map(appearanceLine).join('\n')}

## Press and publications about him
${data.appearances.filter((item) => item.kind === 'press').map(appearanceLine).join('\n')}

## Languages
${data.person.languages.join(', ')}

## Core skills
${Object.entries(data.skills).map(([group, skills]) => `- **${group}:** ${skills.join(', ')}`).join('\n')}

## Canonical professional resources
- [Human-readable resume](${origin}/resume/)
- [Projects](${origin}/projects/)
- [Structured professional profile](${origin}/profile.json)
- [Resume as Markdown](${origin}/resume.md)
- [Projects as Markdown](${origin}/projects.md)
- [GitHub](${data.links.github})
- [LinkedIn](${data.links.linkedin})
- [Resume PDF](${origin}${data.links.resume})
- [Professional contact](${data.links.contact})

This is the extended companion to /llms.txt, which is the short index.
`;
write('llms-full.txt', llmsFull);

// /llms.txt stays a short index: who he is and where everything lives.
// The full text dump lives in /llms-full.txt.
const llms = `# ${data.person.name}

> ${data.person.tagline} ${data.person.headline}, based in ${data.person.location}.

${data.person.description}

## Full profile

- [Everything as plain text](${origin}/llms-full.txt): what he is building, milestones, awards, talks, press, experience, projects, education and skills in one file.
- [Structured professional profile](${origin}/profile.json): the same information as JSON.

## Pages

- [Resume](${origin}/resume/): career summary, also as [Markdown](${origin}/resume.md) and [PDF](${origin}${data.links.resume}).
- [Projects](${origin}/projects/): selected work, also as [Markdown](${origin}/projects.md).
${data.projects.map((project) => `- [${project.title}](${absolute(project.url)}): ${project.outcome}`).join('\n')}

The landing is also available as Markdown: /index.md in Spanish and /en/index.md in English.
Send \`Accept: text/markdown\` to either landing URL for its Markdown representation.
Project and experience links point to sections of the landing or the official product site.

## Elsewhere

- [GitHub](${data.links.github})
- [LinkedIn](${data.links.linkedin})
- [Email](${data.links.contact})

## Optional

- [Sitemap](${origin}/sitemap.xml)

This file follows the emerging llms.txt convention; llms.txt is not an official universal web standard.
`;
write('llms.txt', llms);

const resumeMd = `# ${data.person.name}\n\n## ${data.person.headline}\n\n**${data.person.tagline}**\n\n${data.person.description}\n\n${data.positioning.intro}\n\n## What I'm building\n\n${data.building.map(buildingLine).join('\n')}\n\n## Milestones\n\n${data.milestones.map((item) => `- ${item.date}: ${item.event}`).join('\n')}\n\n## How I think\n\n${data.positioning.principles.map((item) => `- **${item.title}** ${item.body}`).join('\n')}\n\n## Experience\n\n${data.experience.map((item) => `### ${item.role} - ${item.company}\n\n${formatPeriod(item)} - ${item.location}\n\n${item.summary}\n\n${item.highlights.map((value) => `- ${value}`).join('\n')}\n\n**Technologies:** ${item.technologies.join(', ')}`).join('\n\n')}\n\n## Selected projects\n\n${data.projects.map((project) => `### [${project.title}](${absolute(project.url)})\n\n${project.description}\n\n**Outcome:** ${project.outcome}\n\n**Stack:** ${project.technologies.join(', ')}${project.repository ? `\n\n[Repository](${project.repository})` : ''}`).join('\n\n')}\n\n## Education\n\n${data.education.map((item) => `- **${item.degree}** - ${item.institution} (${item.startDate}-${item.endDate})${item.location ? `, ${item.location}` : ''}`).join('\n')}\n\n## Awards, recognition, certifications and publications\n\n${data.awards.map(awardLine).join('\n')}\n\n## Talks and press\n\n${data.appearances.map(appearanceLine).join('\n')}\n\n## Skills\n\n${Object.entries(data.skills).map(([group, skills]) => `- **${group}:** ${skills.join(', ')}`).join('\n')}\n\n## Contact\n\n- [Email](${data.links.contact})\n- [GitHub](${data.links.github})\n- [LinkedIn](${data.links.linkedin})\n`;
write('resume.md', resumeMd);
write('projects.md', `# Bruno Moya - Selected Projects\n\n${data.projects.map((project) => `## ${project.title}\n\n${project.description}\n\n- **Problem:** ${project.problem}\n- **Architecture:** ${project.architecture}\n- **AI / agentic:** ${project.aiComponent}\n- **Deterministic:** ${project.deterministicComponent}\n- **Role:** ${project.role}\n- **Outcome:** ${project.outcome}\n- **Stack:** ${project.technologies.join(', ')}\n- **Case study:** ${absolute(project.url)}${project.repository ? `\n- **Repository:** ${project.repository}` : ''}`).join('\n\n')}\n`);

const labels = {
  "Professional profile": "Perfil profesional",
  "Professional links": "Enlaces profesionales",
  "Experience": "Experiencia",
  "Projects": "Proyectos",
  "Resume": "Currículum",
  "Contact Bruno Moya": "Contactar con Bruno Moya",
  "Profile JSON": "Perfil JSON",
  "Skip to content": "Saltar al contenido",
  "Download Bruno Moya's resume PDF": "Descargar el CV de Bruno Moya en PDF",
  "About me": "Sobre mí",
  "Selected projects": "Proyectos seleccionados",
  "Skills": "Competencias",
  "Education": "Formación",
  "Awards & selections": "Premios y selecciones",
  "Software, automation and mixed reality": "Software, automatización y realidad mixta",
  "Architecture, state, tools, validation, automation and human control.": "Arquitectura, estado, herramientas, validación, automatización y control humano.",
  "Problem": "El problema",
  "What I built": "Qué construí",
  "Architecture": "Arquitectura",
  "AI / agentic component": "Componente de IA y agentes",
  "Deterministic components": "Componentes deterministas",
  "Stack": "Tecnologías",
  "My role": "Mi papel",
  "Outcome": "Resultado",
  "View all selected projects": "Ver todos los proyectos",
  "What I'm building": "Qué estoy construyendo",
  "How I think": "Cómo pienso",
  "Milestones": "Hitos",
  "Official product page": "Página oficial del producto"
};

for (const lang of ['es', 'en']) {
  const site = JSON.parse(fs.readFileSync(path.join(root, `src/locales/${lang}/translation.json`), 'utf8'));
  const localized = lang === 'es' ? withWebContent(spanishProfile(data, site), site) : data;
  const pages = renderMarkdownPages({ data: localized, lang,
    label: value => lang === 'es' ? labels[value] || value : value,
    formatPeriod, origin, prefix: lang === 'en' ? '/en' : '' });
  const home = pages.find(page => page.canonical === '/');
  if (!home) throw new Error(`Missing ${lang} landing Markdown`);
  write(`${lang === 'en' ? 'en/' : ''}index.md`, home.markdown);
}

const alternates = ['es', 'en', 'x-default'].map(lang =>
  `<xhtml:link rel="alternate" hreflang="${lang}" href="${origin}${lang === 'en' ? '/en/' : '/'}"/>`).join('');
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${['/', '/en/'].map(route => `<url><loc>${origin}${route}</loc>${alternates}</url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), `User-agent: *
Allow: /
# search = building a search index and linking back to the source.
# ai-input = using content as input to an AI answer, without training on it.
# ai-train = using content to train or fine-tune a generative model.
Content-Signal: search=yes, ai-input=yes, ai-train=yes

Sitemap: ${origin}/sitemap.xml
`);
fs.writeFileSync(path.join(publicDir, '404.html'), `<!doctype html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Página no encontrada | Bruno Moya</title><meta name="robots" content="noindex"></head>
<body><main><h1>Página no encontrada</h1><p><a href="/">Volver a la web personal de Bruno Moya</a></p></main></body></html>
`);

const personId = `${origin}/#bruno-moya`;
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': personId,
  name: data.person.name,
  alternateName: data.person.alternateName,
  url: data.links.website,
  jobTitle: data.person.currentRoles,
  disambiguatingDescription: data.person.tagline,
  description: data.person.description,
  email: data.person.email,
  homeLocation: { '@type': 'Place', name: data.person.location },
  sameAs: [data.links.github, data.links.linkedin, data.links.x],
  knowsAbout: [...new Set(Object.values(data.skills).flat())],
  worksFor: [
    { '@type': 'Organization', name: 'TopBrokers.io', url: 'https://topbrokers.io/' },
    { '@type': 'Organization', '@id': 'https://glassear.com/#organization', name: 'Glassear', url: 'https://glassear.com/' }
  ],
  alumniOf: data.education.map((item) => ({ '@type': 'EducationalOrganization', name: item.institution })),
  award: data.awards.map((item) => `${item.name} (${item.organization})`),
  knowsLanguage: data.person.languages
};
const indexPath = path.join(root, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');
index = index
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(data.person.seoTitle)}</title>`)
  .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(data.person.description)}">`)
  .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escapeHtml(data.person.seoTitle)}">`)
  .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escapeHtml(data.person.description)}">`)
  .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${origin}/">`)
  .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${escapeHtml(data.person.seoTitle)}">`)
  .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${escapeHtml(data.person.description)}">`)
  .replace(/<meta name="keywords"[^>]*>/, '<meta name="keywords" content="Bruno Moya, Bruno Moya Ruiz, Glassear, Glassear One, Glassear Studio, GlassMusic, TopBrokers, CTO, technical founder, software engineer Barcelona, spatial computing, augmented reality, AI agents, infrastructure">');
const homeJsonLd = jsonLdScript([personJsonLd]);
const jsonLdPattern = /<script type="application\/ld\+json">[^<]+<\/script>/;
if (jsonLdPattern.test(index)) {
  index = index.replace(jsonLdPattern, homeJsonLd);
} else {
  index = index.replace('</head>', homeJsonLd + '\n</head>');
}
if (!index.includes('rel="canonical"')) {
  index = index.replace('</head>', '<link rel="canonical" href="' + origin + '/">\n</head>');
}
index = index.replace(/<link[^>]*type="text\/markdown"[^>]*>\s*/g, '');
index = index.replace('</head>', `<link rel="alternate" type="text/markdown" href="${origin}/index.md" title="Markdown">\n</head>`);
index = index.replace(/<!-- PROFESSIONAL_FALLBACK_START -->[\s\S]*?<!-- PROFESSIONAL_FALLBACK_END -->/, '<div id="root"></div>');
fs.writeFileSync(indexPath, index);
console.log('Generated SEO for the Spanish and English landing only');
