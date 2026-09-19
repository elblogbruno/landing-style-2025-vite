// Markdown twins of the static professional pages, for `Accept: text/markdown`.
//
// Every page generate-professional-pages.js writes as HTML also gets an index.md next to
// it, rendered from the same professional-data.json. nginx picks between the two by the
// Accept header (see deploy/nginx-markdown-negotiation.conf), so the markdown never drifts
// from the HTML: both come from one build, from one source of truth.
//
// This is the per-page counterpart to /llms.txt and /llms-full.txt, which stay whole-site
// dumps at fixed URLs.

// Rough token estimate for the x-markdown-tokens header. Byte-pair encoders land near four
// characters per token for prose like this; the header is a hint for agents budgeting a
// fetch, not an accounting figure, so an approximation beats pulling in a tokenizer.
export const estimateTokens = (text) => Math.ceil([...text].length / 4);

const lines = (values) => values.filter(Boolean).join('\n');
const blocks = (values) => values.filter(Boolean).join('\n\n');
const bullets = (values) => lines((values || []).map((value) => `- ${value}`));

export function renderMarkdownPages({ data, lang, label, formatPeriod, origin, prefix }) {
  const url = (route) => `${origin}${route.startsWith('http') ? '' : prefix}${route}`;
  const es = lang === 'es';

  // Every page carries the same footer: where the agent is, and where the rest lives.
  const footer = (canonical) => blocks([
    '---',
    lines([
      `${es ? 'Página' : 'Page'}: ${url(canonical)}`,
      `${es ? 'Esta página en inglés' : 'This page in Spanish'}: ${origin}${es ? '/en' : ''}${canonical}`,
      `${es ? 'Índice para agentes' : 'Agent index'}: ${origin}/llms.txt`,
      `${es ? 'Perfil completo en JSON' : 'Full profile as JSON'}: ${origin}/profile.json`,
      `${es ? 'Contacto' : 'Contact'}: ${data.person.email}`
    ])
  ]);

  const page = ({ canonical, title, body }) => `${blocks([`# ${title}`, body, footer(canonical)])}\n`;

  const buildingSection = blocks([
    `## ${label("What I'm building")}`,
    blocks(data.building.map((item) => blocks([
      `### ${item.name} - ${item.role}${item.since ? ` (${es ? 'desde' : 'since'} ${item.since})` : ''}`,
      item.summary,
      item.points && item.points.length ? bullets(item.points) : '',
      item.url ? `[${item.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}](${item.url})` : ''
    ])))
  ]);

  const milestonesSection = blocks([
    `## ${label('Milestones')}`,
    bullets(data.milestones.map((item) => `**${item.date}** - ${item.event}`))
  ]);

  const principlesSection = blocks([
    `## ${label('How I think')}`,
    blocks(data.positioning.principles.map((item) => `### ${item.title}\n\n${item.body}`))
  ]);

  const experienceSection = blocks(data.experience.map((item) => blocks([
    `### ${item.role} - [${item.company}](${item.companyUrl})`,
    `${formatPeriod(item)} - ${item.location}`,
    item.summary,
    item.highlights && item.highlights.length ? bullets(item.highlights) : '',
    `**${label('Stack')}:** ${item.technologies.join(', ')}`
  ])));

  // The HTML cards headline whichever link the site promotes, which for some projects is the
  // repository or the live product. The case study still gets its own line, so an agent
  // reading this page can reach the deep pages instead of being sent straight off-site.
  const projectList = blocks(data.projects.map((project) => blocks([
    `### [${project.title}](${project.actionUrl || url(project.url)})`,
    `_${project.category}_`,
    project.description,
    `**${label('Outcome')}:** ${project.outcome}`,
    `**${label('Stack')}:** ${project.technologies.join(', ')}`,
    lines([
      `- [${es ? 'Caso de estudio' : 'Case study'}](${url(project.url)})`,
      project.repository ? `- [${es ? 'Repositorio' : 'Repository'}](${project.repository})` : '',
      project.actionUrl && project.actionUrl !== project.repository ? `- [${project.actionLabel || project.name}](${project.actionUrl})` : ''
    ])
  ])));

  const pages = [];

  // The home page: the same ground the React hero and the no-JS fallback cover.
  pages.push({
    canonical: '/',
    relativePath: 'index.md',
    markdown: page({
      canonical: '/',
      title: `${data.person.name}: ${data.person.tagline}`,
      body: blocks([
        `**${data.person.headline}**`,
        data.person.description,
        data.positioning.intro,
        buildingSection,
        milestonesSection,
        principlesSection,
        blocks([
          `## ${es ? 'Trabajo actual' : 'Current work'}`,
          blocks(data.experience.slice(0, 2).map((item) => blocks([
            `### ${item.role} - [${item.company}](${item.companyUrl})`,
            `${formatPeriod(item)} - ${item.location}`,
            item.summary
          ])))
        ]),
        blocks([`## ${label('Selected projects')}`, projectList]),
        blocks([
          `## ${label('Professional links')}`,
          bullets([
            `[${label('Resume')}](${url('/resume/')})`,
            `[${label('Experience')}](${url('/experience/')})`,
            `[${label('Projects')}](${url('/projects/')})`,
            `[GitHub](${data.links.github})`,
            `[LinkedIn](${data.links.linkedin})`
          ])
        ])
      ])
    })
  });

  pages.push({
    canonical: '/resume/',
    relativePath: 'resume/index.md',
    markdown: page({
      canonical: '/resume/',
      title: data.person.name,
      body: blocks([
        `**${data.person.headline}**`,
        `**${data.person.tagline}**`,
        data.person.description,
        data.positioning.intro,
        `[${label("Download Bruno Moya's resume PDF")}](${origin}${data.links.resume})`,
        buildingSection,
        milestonesSection,
        principlesSection,
        blocks([`## ${label('Experience')}`, experienceSection]),
        blocks([`## ${label('Selected projects')}`, projectList]),
        blocks([
          `## ${label('Skills')}`,
          bullets(Object.entries(data.skills).map(([group, skills]) => `**${group}:** ${skills.join(', ')}`))
        ]),
        blocks([
          `## ${label('Education')}`,
          bullets(data.education.map((item) => `**${item.degree}** - ${item.institution} (${item.startDate}-${item.endDate})${item.location ? `, ${item.location}` : ''}`))
        ]),
        blocks([
          `## ${label('Awards & selections')}`,
          bullets(data.awards.map((item) => `${item.url ? `[${item.name}](${item.url})` : item.name} - ${item.organization} (${item.date})${item.summary ? `. ${item.summary}` : ''}`))
        ])
      ])
    })
  });

  pages.push({
    canonical: '/experience/',
    relativePath: 'experience/index.md',
    markdown: page({
      canonical: '/experience/',
      title: label('Hands-on technical ownership'),
      body: blocks([
        label('Production software, backend systems, infrastructure, AI agents and XR.'),
        experienceSection
      ])
    })
  });

  pages.push({
    canonical: '/projects/',
    relativePath: 'projects/index.md',
    markdown: page({
      canonical: '/projects/',
      title: label('Software, automation and mixed reality'),
      body: blocks([
        label('Architecture, state, tools, validation, automation and human control.'),
        projectList
      ])
    })
  });

  for (const project of data.projects) {
    pages.push({
      canonical: project.url,
      relativePath: `projects/${project.id}/index.md`,
      markdown: page({
        canonical: project.url,
        title: project.title,
        body: blocks([
          `_${project.category}_`,
          project.description,
          `**${label('Outcome')}:** ${project.outcome}`,
          `## ${label('Problem')}\n\n${project.problem}`,
          blocks([
            `## ${label('What I built')}`,
            project.description,
            bullets(project.highlights)
          ]),
          `## ${label('Architecture')}\n\n${project.architecture}`,
          `## ${label('AI / agentic component')}\n\n${project.aiComponent}`,
          blocks([
            `## ${label('Deterministic components')}`,
            project.deterministicComponent,
            `> ${project.principle}`
          ]),
          `## ${label('Stack')}\n\n${project.technologies.join(', ')}`,
          `## ${label('My role')}\n\n${project.role}`,
          project.repository ? `[${es ? 'Ver' : 'View'} ${project.name} ${es ? 'en' : 'on'} GitHub](${project.repository})` : '',
          `[${label('View all selected projects')}](${url('/projects/')})`
        ])
      })
    });
  }

  return pages.map((item) => ({
    ...item,
    route: `${prefix}${item.canonical}`,
    tokens: estimateTokens(item.markdown)
  }));
}
