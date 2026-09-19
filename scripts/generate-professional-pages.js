import { spanishProfile } from './professional-spanish.js';
import { withWebContent } from './web-content.js';
import { renderMarkdownPages } from './markdown-pages.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const readTranslation = (lang) => JSON.parse(fs.readFileSync(path.join(root, `src/locales/${lang}/translation.json`), 'utf8'));
const englishSite = readTranslation('en');
const spanishSite = readTranslation('es');
// Awards, talks, press and the project catalogue come from the site's own content.
const data = withWebContent(JSON.parse(fs.readFileSync(path.join(root, 'src/data/professional-data.json'), 'utf8')), englishSite);
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
    { '@type': 'Organization', name: 'Glassear', url: 'https://www.glassear.com/' }
  ],
  alumniOf: data.education.map((item) => ({ '@type': 'EducationalOrganization', name: item.institution })),
  award: data.awards.map((item) => `${item.name} (${item.organization})`),
  knowsLanguage: data.person.languages
};
const glassearJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.glassear.com/#organization',
  name: 'Glassear',
  url: 'https://www.glassear.com/',
  foundingDate: '2015',
  founder: { '@id': personId },
  description: data.building.find((item) => item.name === 'Glassear').summary
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
const awardTypes = { award: 'Award', recognition: 'Recognition', certificate: 'Certification', publication: 'Publication' };
const awardLine = (item) => `- ${item.name} - ${item.organization} (${item.date})${item.type ? `, ${awardTypes[item.type] || item.type}` : ''}${item.project ? `, project: ${item.project}` : ''}${item.url ? ` [Source](${item.url})` : ''}`;
const appearanceLine = (item) => `- ${item.date || 'Undated'} - ${item.name}${item.event ? ` (${item.event})` : ''}${item.url ? ` [Link](${item.url})` : ''}`;
const buildingLine = (item) => `- **${item.name}** (${item.role}${item.since ? `, since ${item.since}` : ''}): ${item.summary}${item.points && item.points.length ? ` Focus: ${item.points.join('; ')}.` : ''}`;
const awardLabel = (item) => item.url ? `<a href="${item.url}">${escapeHtml(item.name)}</a>` : escapeHtml(item.name);
const buildingSection = `<section><h2>What I'm building</h2>${data.building.map((item) => `<article><h3><a href="${item.url}">${escapeHtml(item.name)}</a> - ${escapeHtml(item.role)}${item.since ? ` (since ${item.since})` : ''}</h3><p>${escapeHtml(item.summary)}</p>${item.points && item.points.length ? `<ul>${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}</article>`).join('')}</section>`;
const principlesSection = `<section><h2>How I think</h2>${data.positioning.principles.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`).join('')}</section>`;
const milestonesSection = `<section><h2>Milestones</h2><ul>${data.milestones.map((item) => `<li><time datetime="${item.date}">${item.date}</time> - ${escapeHtml(item.event)}</li>`).join('')}</ul></section>`;
const jsonLdScript = (schemas) => `<script type="application/ld+json">${JSON.stringify(schemas)}</script>`;

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
  "Professional experience": "Experiencia profesional",
  "Hands-on technical ownership": "Responsabilidad técnica, de principio a fin",
  "Production software, backend systems, infrastructure, AI agents and XR.": "Software en producción, sistemas backend, infraestructura, agentes de IA y XR.",
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
  "Milestones": "Hitos"
};
// Filled by generatePages so the nginx token map can be written once both languages exist.
const markdownPages = [];

function generatePages(data, lang) {
const prefix = lang === 'en' ? '/en' : '';
const label = value => lang === 'es' ? labels[value] || value : value;
const absolute = url => url.startsWith('http') ? url : origin + prefix + url;
const write = (relativePath, value) => {
  const target = path.join(publicDir, prefix, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
};
const formatPeriod = ({ startDate, endDate }) => startDate + ' - ' + (endDate || (lang === 'es' ? 'Actualidad' : 'Present'));
const tags = items => '<ul class="tags" aria-label="' + (lang === 'es' ? 'Tecnologías' : 'Technologies') + '">' + items.map(item => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>';
const buildingSection = `<section><h2>${label("What I'm building")}</h2>${data.building.map((item) => `<article><h3><a href="${item.url}">${escapeHtml(item.name)}</a> - ${escapeHtml(item.role)}${item.since ? ` (${lang === "es" ? "desde" : "since"} ${item.since})` : ''}</h3><p>${escapeHtml(item.summary)}</p>${item.points && item.points.length ? `<ul>${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}</article>`).join('')}</section>`;
const principlesSection = `<section><h2>${label("How I think")}</h2>${data.positioning.principles.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`).join('')}</section>`;
const milestonesSection = `<section><h2>${label("Milestones")}</h2><ul>${data.milestones.map((item) => `<li><time datetime="${item.date}">${item.date}</time> - ${escapeHtml(item.event)}</li>`).join('')}</ul></section>`;
const nav = `<header><a class="brand" href="${prefix}/">BM<span>.</span></a><nav aria-label="${label("Professional profile")}"><a href="${prefix}/experience/">${label("Experience")}</a><a href="${prefix}/projects/">${label("Projects")}</a><a href="${prefix}/resume/">${label("Resume")}</a><a href="/llms.txt">llms.txt</a></nav></header>`;
const footer = `<footer><p>- Bruno Moya</p><nav aria-label="${label("Professional links")}"><a href="${data.links.github}">GitHub</a><a href="${data.links.linkedin}">LinkedIn</a><a href="${data.links.contact}">${label("Contact Bruno Moya")}</a><a href="/profile.json">${label("Profile JSON")}</a></nav></footer>`;
const layout = ({ title, description, canonical, body, schemas = [personJsonLd] }) => `<!doctype html>
<html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="author" content="Bruno Moya">
<meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="${absolute(canonical)}">
<meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${absolute(canonical)}"><meta property="og:image" content="${origin}/images-webp/hero/cover-better.webp">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${origin}/images-webp/hero/cover-better.webp">
<script>try{var t=localStorage.getItem('theme');if(t)document.documentElement.classList.add(t==='dark'?'dark':'light')}catch(e){}</script>
<link rel="stylesheet" href="/professional.css">${jsonLdScript(schemas)}<link rel="alternate" hreflang="es" href="${origin}${canonical}"><link rel="alternate" hreflang="en" href="${origin}/en${canonical}"><link rel="alternate" hreflang="x-default" href="${origin}${canonical}"><link rel="alternate" type="text/markdown" href="${absolute(canonical)}index.md" title="Markdown"></head><body>
<a class="skip-link" href="#main-content">${label("Skip to content")}</a>${nav.replace("</nav>", `<a href="${lang === "es" ? "/en" + canonical : canonical}" lang="${lang === "es" ? "en" : "es"}" hreflang="${lang === "es" ? "en" : "es"}">${lang === "es" ? "English" : "Español"}</a></nav>`)}<main id="main-content">${body}</main>${footer}</body></html>`;

const experienceArticles = data.experience.map((item) => `<article class="detail-card">
<p class="eyebrow"><time datetime="${item.startDate}">${formatPeriod(item)}</time> - ${escapeHtml(item.location)}</p>
<h2>${escapeHtml(item.role)} - <a href="${item.companyUrl}">${escapeHtml(item.company)}</a></h2>
<p>${escapeHtml(item.summary)}</p>
${item.highlights.length ? `<ul>${item.highlights.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}</ul>` : ''}
${tags(item.technologies)}</article>`).join('');

const projectCards = data.projects.map((project) => `<article class="detail-card">
<p class="eyebrow">${escapeHtml(project.category)}</p><h2><a href="${escapeHtml(project.actionUrl || prefix + project.url)}">${escapeHtml(project.title)}</a></h2>
<p class="outcome">${escapeHtml(project.outcome)}</p><p>${escapeHtml(project.description)}</p>${tags(project.technologies)}
<p><a href="${escapeHtml(project.actionUrl || prefix + project.url)}">${escapeHtml(project.actionLabel || `${lang === "es" ? "Ver el proyecto" : "View project"} ${project.name}`)} &rarr;</a></p>
${project.repository && project.repository !== project.actionUrl ? `<p><a href="${project.repository}">${lang === "es" ? "Ver" : "View"} ${escapeHtml(project.name)} ${lang === "es" ? "en" : "on"} GitHub &nearr;</a></p>` : ''}</article>`).join('');

const resumeBody = `<section class="page-hero"><p class="eyebrow">${label("Resume")}</p><h1>${escapeHtml(data.person.name)}</h1><p class="headline">${escapeHtml(data.person.headline)}</p><p>${escapeHtml(data.person.description)}</p>
<div class="actions"><a class="button" href="${data.links.resume}">${label("Download Bruno Moya's resume PDF")}</a><a href="${data.links.contact}">${label("Contact Bruno Moya")}</a></div></section>
<section><h2>${label("About me")}</h2><p><strong>${escapeHtml(data.person.tagline)}</strong></p><p>${escapeHtml(data.positioning.intro)}</p></section>
${buildingSection}${milestonesSection}${principlesSection}
<section><h2>${label("Experience")}</h2>${experienceArticles}</section>
<section><h2>${label("Selected projects")}</h2>${projectCards}</section>
<section><h2>${label("Skills")}</h2>${Object.entries(data.skills).map(([group, skills]) => `<article><h3>${escapeHtml(group)}</h3>${tags(skills)}</article>`).join('')}</section>
<section><h2>${label("Education")}</h2>${data.education.map((item) => `<article><h3>${escapeHtml(item.degree)}</h3><p>${escapeHtml(item.institution)} - <time datetime="${item.startDate}">${item.startDate}-${item.endDate}</time>${item.location ? ` - ${escapeHtml(item.location)}` : ''}</p></article>`).join('')}</section>
<section><h2>${label("Awards & selections")}</h2>${data.awards.map((item) => `<article><h3>${awardLabel(item)}</h3><p>${escapeHtml(item.organization)} - <time datetime="${item.date}">${item.date}</time></p>${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}</article>`).join('')}</section>`;
write('resume/index.html', layout({ title: lang === 'es' ? 'Bruno Moya | Currículum' : 'Bruno Moya | Resume', description: data.person.description, canonical: '/resume/', body: resumeBody, schemas: [personJsonLd, glassearJsonLd, ...data.projects.map(projectJsonLd)] }));
write('experience/index.html', layout({ title: lang === 'es' ? 'Bruno Moya | Experiencia' : 'Bruno Moya | Experience', description: data.person.description, canonical: '/experience/', body: `<section class="page-hero"><p class="eyebrow">${label("Professional experience")}</p><h1>${label("Hands-on technical ownership")}</h1><p>${label("Production software, backend systems, infrastructure, AI agents and XR.")}</p></section><section>${experienceArticles}</section>` }));
write('projects/index.html', layout({
  title: lang === 'es' ? 'Bruno Moya | Proyectos' : 'Bruno Moya | Projects',
  description: data.person.description,
  canonical: '/projects/',
  body: `<section class="page-hero"><p class="eyebrow">${label("Selected projects")}</p><h1>${label("Software, automation and mixed reality")}</h1><p>${label("Architecture, state, tools, validation, automation and human control.")}</p></section><section>` + projectCards + "</section>",
  schemas: [personJsonLd, ...data.projects.map(projectJsonLd)]
}));

for (const project of data.projects) {
  const body = `<article class="project-page"><p class="eyebrow">${escapeHtml(project.category)}</p><h1>${escapeHtml(project.title)}</h1><p class="headline">${escapeHtml(project.description)}</p><p class="outcome">${escapeHtml(project.outcome)}</p>
${project.image ? `<section><h2>Editor</h2><img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.name)} ${lang === "es" ? "— editor de rutas con mapa, itinerario y línea de tiempo" : "route editor with map, itinerary and timeline"}" loading="lazy" style="width:100%;height:auto;display:block"></section>` : ''}
<section><h2>${label("Problem")}</h2><p>${escapeHtml(project.problem)}</p></section>
<section><h2>${label("What I built")}</h2><p>${escapeHtml(project.description)}</p><ul>${project.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
<section><h2>${label("Architecture")}</h2><p>${escapeHtml(project.architecture)}</p></section>
<section><h2>${label("AI / agentic component")}</h2><p>${escapeHtml(project.aiComponent)}</p></section>
<section><h2>${label("Deterministic components")}</h2><p>${escapeHtml(project.deterministicComponent)}</p><blockquote>${escapeHtml(project.principle)}</blockquote></section>
<section><h2>${label("Stack")}</h2>${tags(project.technologies)}</section>
<section><h2>${label("My role")}</h2><p>${escapeHtml(project.role)}</p></section>
<section><h2>${label("Outcome")}</h2><p>${escapeHtml(project.outcome)}</p></section>
<div class="actions">${project.repository ? `<a class="button" href="${project.repository}">${lang === "es" ? "Ver" : "View"} ${escapeHtml(project.name)} ${lang === "es" ? "en" : "on"} GitHub</a>` : ''}<a href="${prefix}/projects/">${label("View all selected projects")}</a></div></article>`;
  write(`projects/${project.id}/index.html`, layout({ title: `${project.title} | Bruno Moya`, description: project.description, canonical: project.url, body, schemas: [personJsonLd, projectJsonLd(project)] }));
}

// A markdown twin beside every page above, served to `Accept: text/markdown` requests.
for (const markdownPage of renderMarkdownPages({ data, lang, label, formatPeriod, origin, prefix })) {
  write(markdownPage.relativePath, markdownPage.markdown);
  markdownPages.push(markdownPage);
}

}
generatePages(data, "en");
generatePages(withWebContent(spanishProfile(data, spanishSite), spanishSite), "es");

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
- [Experience](${origin}/experience/)
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
- [Experience](${origin}/experience/): roles, dates, responsibilities and technologies.
- [Projects](${origin}/projects/): selected work, also as [Markdown](${origin}/projects.md).
${data.projects.map((project) => `- [${project.title}](${absolute(project.url)}): ${project.outcome}`).join('\n')}

Every page above is also available as markdown. Send \`Accept: text/markdown\` and the
response comes back as \`text/markdown\`, with an \`x-markdown-tokens\` estimate, instead of
HTML; or append \`index.md\` to the URL. Spanish is at the root, English under /en/.

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

// Pages that exist in both languages: Spanish at the root, English under /en/.
const translatedRoutes = ['/', '/resume/', '/experience/', '/projects/', ...data.projects.map((project) => project.url)];
// Agent-facing resources are language-neutral, so they carry no alternates.
const standaloneRoutes = ['/profile.json', '/llms.txt', '/llms-full.txt', '/resume.md', '/projects.md'];
const alternates = (route) => ['es', 'en', 'x-default']
  .map((lang) => `<xhtml:link rel=\"alternate\" hreflang=\"${lang}\" href=\"${origin}${lang === 'en' ? '/en' : ''}${route}\"/>`)
  .join('');
const urlEntry = (loc, extra = '') => `  <url><loc>${loc}</loc><lastmod>${data.lastUpdated}</lastmod>${extra}</url>`;
const sitemapUrls = [
  ...translatedRoutes.flatMap((route) => [
    urlEntry(origin + route, alternates(route)),
    urlEntry(origin + '/en' + route, alternates(route))
  ]),
  ...standaloneRoutes.map((route) => urlEntry(origin + route))
];
write('sitemap.xml', `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n${sitemapUrls.join('\n')}\n</urlset>\n`);

// Content Signals (contentsignals.org, draft-romm-aipref-contentsignals). The definitions
// are part of the statement, not decoration: the directive expresses a preference, and it
// only means something if the terms it uses are stated where a reader finds them.
const contentSignals = [
  '# Content Signals: how Bruno Moya prefers this site to be used.',
  '#   search    = building a search index and linking back to the source.',
  '#   ai-input  = using the content as input to an AI answer, without training on it.',
  '#   ai-train  = using the content to train or fine-tune a generative model.',
  '# yes means allowed, no means not allowed. This site is written to be read by agents,',
  '# so all three are allowed; see /llms.txt for the machine-readable index.',
  'Content-Signal: search=yes, ai-input=yes, ai-train=yes'
].join('\n');
write('robots.txt', `User-agent: *\nAllow: /\n${contentSignals}\n\nSitemap: ${origin}/sitemap.xml\n`);

// Every real route has a file on disk, so anything else is genuinely missing. The site
// used to answer those with the React index at 200, which told agents that /.well-known/
// probes and stale asset URLs existed. This page carries the 404 and points onward.
write('404.html', `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Not found | Bruno Moya</title><meta name="robots" content="noindex">
<link rel="stylesheet" href="/professional.css"></head><body>
<main id="main-content"><section class="page-hero"><p class="eyebrow">404</p><h1>This page does not exist</h1>
<p>The address you asked for is not part of this site. Nothing here has moved; this URL was never served.</p></section>
<section><h2>Where to go instead</h2><ul>
<li><a href="/">Home</a> - Bruno Moya, ${escapeHtml(data.person.tagline)}</li>
<li><a href="/resume/">Resume</a>, <a href="/experience/">Experience</a>, <a href="/projects/">Projects</a></li>
<li><a href="/llms.txt">/llms.txt</a> - the agent-facing index of this site</li>
<li><a href="/sitemap.xml">/sitemap.xml</a> - every canonical URL</li>
<li><a href="/profile.json">/profile.json</a> - the full profile as JSON</li>
</ul></section></main></body></html>
`);

// Apache cannot count tokens, so the build writes the numbers into .htaccess between
// markers, the same way index.html carries its generated fallback. One SetEnvIf per route,
// matching it with or without the trailing slash and as an explicit index.md, because all
// three reach the same markdown twin. mod_headers only emits the header when the file
// actually served is a .md, so an HTML response never carries a token count.
const tokenRules = markdownPages
  .map(({ route, tokens }) => `SetEnvIf Request_URI "^${route.replace(/\/$/, '')}/?(index\\.md)?$" MD_TOKENS=${tokens} MD_HREF=${route}index.md`)
  .join('\n');
const htaccessPath = path.join(root, '.htaccess');
const htaccess = fs.readFileSync(htaccessPath, 'utf8');
const tokenBlock = /# MARKDOWN_TOKENS_START[\s\S]*?# MARKDOWN_TOKENS_END/;
if (!tokenBlock.test(htaccess)) {
  throw new Error('.htaccess is missing the MARKDOWN_TOKENS_START/END markers');
}
fs.writeFileSync(htaccessPath, htaccess.replace(
  tokenBlock,
  `# MARKDOWN_TOKENS_START\n<IfModule mod_setenvif.c>\n${tokenRules.split('\n').map((line) => `  ${line}`).join('\n')}\n</IfModule>\n# MARKDOWN_TOKENS_END`
));
fs.copyFileSync(path.join(root, 'src/app/professional.css'), path.join(publicDir, 'professional.css'));

const fallback = `<!-- PROFESSIONAL_FALLBACK_START --><div id="root"></div><div id="profile-fallback"><article><h1>${escapeHtml(data.person.name)}: ${escapeHtml(data.person.tagline)}</h1><p>${escapeHtml(data.person.headline)}</p><p>${escapeHtml(data.person.description)}</p><p>${escapeHtml(data.positioning.intro)}</p>${buildingSection}${milestonesSection}${principlesSection}<section><h2>Current work</h2>${data.experience.slice(0, 2).map((item) => `<article><h3>${escapeHtml(item.role)} - ${escapeHtml(item.company)}</h3><time datetime="${item.startDate}">${formatPeriod(item)}</time><p>${escapeHtml(item.summary)}</p></article>`).join('')}</section><section><h2>Selected projects</h2>${data.projects.map((project) => `<article><h3><a href="${project.url}">${escapeHtml(project.title)}</a></h3><p>${escapeHtml(project.description)}</p></article>`).join('')}</section><p><a href="/resume/">View Bruno Moya's resume</a> - <a href="${data.links.contact}">Contact Bruno Moya</a></p></article></div><script>document.getElementById("profile-fallback").hidden=true</script><!-- PROFESSIONAL_FALLBACK_END -->`;
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
const homeJsonLd = jsonLdScript([personJsonLd, glassearJsonLd, ...data.projects.map(projectJsonLd)]);
const jsonLdPattern = /<script type="application\/ld\+json">[^<]+<\/script>/;
if (jsonLdPattern.test(index)) {
  index = index.replace(jsonLdPattern, homeJsonLd);
} else {
  index = index.replace('</head>', homeJsonLd + '\n</head>');
}
if (!index.includes('rel="canonical"')) {
  index = index.replace('</head>', '<link rel="canonical" href="' + origin + '/">\n</head>');
}
// Advertises the markdown twin, so an agent can find it without knowing to try the
// Accept header first. generate-i18n.js copies this head into /en/ at postbuild.
if (!index.includes('type="text/markdown"')) {
  index = index.replace('</head>', '<link rel="alternate" type="text/markdown" href="' + origin + '/index.md" title="Markdown">\n</head>');
}
index = index.includes('PROFESSIONAL_FALLBACK_START')
  ? index.replace(/<!-- PROFESSIONAL_FALLBACK_START -->[\s\S]*?<!-- PROFESSIONAL_FALLBACK_END -->/, fallback)
  : index.replace('<div id="root"></div>', fallback);
fs.writeFileSync(indexPath, index);
console.log(`Generated ${sitemapUrls.length} canonical resources from professional-data.json`);
