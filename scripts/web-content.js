// The React site renders src/locales/<lang>/translation.json; the agent-facing layer
// (llms.txt, profile.json, resume.md, projects.md and the static pages) renders
// src/data/professional-data.json. The lists that churn - awards, talks, press and the
// project catalogue - are derived here from the site's own content so both stay in sync:
// edit an award, a talk or a project on the website and the agent layer follows.
//
// professional-data.json stays the curated source for the things the site does not state
// in a machine-readable way: the person, the positioning, the experience entries, the four
// deep case studies, education and the milestone list.

const normalizeUrl = (url) => String(url || '').replace(/\/+$/, '').toLowerCase();

// Sorts newest first and pushes undated entries to the end.
const byDateDesc = (a, b) => {
  if (!a.date) return b.date ? 1 : 0;
  if (!b.date) return -1;
  return b.date.localeCompare(a.date);
};

// Structured metadata the award cards have no place for: which project earned the award.
const awardProject = {
  15: 'Glassear',          // Top 50 Catalan startups - ACCIO 2025
  16: 'GlassMusic',        // GlassMusic at 4YFN / MWC 2026
  1: 'Glassear',           // 2nd Professional Prize - Maker Faire Galicia 2018
  2: 'Doctor Strange AR Filter',
  3: 'ManoMojies',
  6: 'Glassear',           // TDR Excellence Award
  9: 'Whatshate',          // Most Creative Project - Mamuthack 2020
  10: 'Glassear',          // Maker of Merit
  11: 'GlassFood',         // Final degree project
  14: 'TalentGapAnalyzer'  // Winner - UAB The Hack 2025
};

export function deriveAwards(site) {
  return site.awards.items
    .map((item) => ({
      name: item.title,
      organization: item.organization,
      date: item.date,
      type: item.type,
      ...(awardProject[item.id] ? { project: awardProject[item.id] } : {}),
      summary: item.description || null,
      url: item.url || null
    }))
    .sort(byDateDesc);
}

export function deriveAppearances(site) {
  const talks = site.talks.items.map((item) => ({
    kind: 'talk',
    name: item.title,
    event: item.event || null,
    date: item.date || null,
    location: item.location || null,
    note: item.description || null,
    url: item.videoUrl || item.postUrl || null,
    postUrl: item.postUrl || null,
    featured: Boolean(item.featured)
  }));
  const press = site.news.items.map((item) => ({
    kind: 'press',
    name: item.title,
    event: item.source || null,
    date: item.date || null,
    location: null,
    note: item.description || null,
    url: item.url || item.postUrl || (item.videoId ? `https://www.youtube.com/watch?v=${item.videoId}` : null),
    postUrl: item.postUrl || null,
    featured: Boolean(item.featured)
  }));
  return [...talks, ...press].sort(byDateDesc);
}

// Featured projects on the website, minus the ones that already have a full case study,
// appended to the curated entries that the site has no card for (Glassear One and the
// pre-portfolio work). Several projects legitimately share a URL - Glassear One and
// GlassMusic both live on glassear.com - so only the case studies are matched by URL.
export function deriveBroaderProjects(site, caseStudies, curated = []) {
  const normalizeName = (name) => String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const caseStudyUrls = new Set(
    caseStudies.flatMap((project) => [project.url, project.repository, project.actionUrl])
      .filter(Boolean).map(normalizeUrl)
  );
  const names = new Set([...caseStudies, ...curated].map((project) => normalizeName(project.name)));

  const derived = [];
  for (const item of site.projects.items) {
    if (!item.featured) continue;
    const url = item.demoUrl || item.githubUrl || null;
    if (!url || caseStudyUrls.has(normalizeUrl(url))) continue;
    if (names.has(normalizeName(item.title))) continue;
    names.add(normalizeName(item.title));
    derived.push({
      name: item.title,
      description: item.description,
      url,
      technologies: item.skills || [],
      ...(item.date ? { date: item.date } : {})
    });
  }
  return [...curated, ...derived.sort(byDateDesc)];
}

// Name, role and the bullet points shown on the site's "What I'm building" cards.
export function deriveBuilding(building, site) {
  return building.map((item, index) => {
    const card = site.building?.items?.[index];
    return card ? { ...item, name: card.name, role: card.role, points: card.points || [] } : { ...item, points: [] };
  });
}

// Applies every site-derived list to a professional-data payload for one language.
export function withWebContent(data, site) {
  return {
    ...data,
    building: deriveBuilding(data.building, site),
    awards: deriveAwards(site),
    appearances: deriveAppearances(site),
    broaderProjects: deriveBroaderProjects(site, data.projects, data.broaderProjects)
  };
}
