// Spanish copy for the static professional pages. IDs, images, dates and URLs come from the shared data.
export function spanishProfile(data, site) {
  const translated = structuredClone(data);
  Object.assign(translated.person, {
    headline: site.hero.subtitle,
    tagline: 'Convierto tecnología emergente en productos reales.',
    description: 'Ingeniero de software en Barcelona. Fundador y CEO de Glassear, gafas de realidad aumentada que utilizan el móvil como pantalla y ordenador, y CTO en TopBrokers. Trabajo en software, computación espacial, hardware e infraestructura de producción.'
  });
  translated.links.resume = data.links.resumeSpanish;
  translated.positioning = { ...data.positioning, intro: site.about.intro, principles: site.principles.items };
  translated.building = data.building.map((item, i) => ({ ...item, summary: site.building.items[i].body }));
  const milestones = [
    'Empecé a construir Glassear.',
    'Glassear recibió el segundo premio profesional en Maker Faire Galicia.',
    'Me gradué en Ingeniería Informática en la UAB, después de una estancia en ÉTS Montréal.',
    'Presenté GlassMusic, el primer caso de uso de Glassear, en 4YFN / MWC 2025 con la UAB.',
    'TalentGapAnalyzer ganó UAB The Hack 2025.',
    'Glassear fue seleccionada para el catálogo de 50 startups catalanas con mayor potencial de la Catalan Pitch Competition 2025 de ACCIÓ (Deep Tech).',
    'Me incorporé como CTO en TopBrokers.io.',
    'Presenté GlassMusic by Glassear en 4YFN / MWC 2026, en el estand de Catalan Arts. Los visitantes probaron Glassear One.'
  ];
  translated.milestones = data.milestones.map((item, i) => ({ ...item, event: milestones[i] }));
  const experience = [
    ['CTO', 'Barcelona, España', 'Responsabilidad técnica de una plataforma inmobiliaria con IA y automatización: desde la arquitectura y el desarrollo hasta el despliegue y las operaciones.', [
      'Diseño y desarrollo de sistemas backend, API, plataformas de automatización y servicios distribuidos.',
      'Operación de PostgreSQL, Docker, Linux, redes, copias de seguridad, monitorización e infraestructura local y en la nube.',
      'Gestión de dispositivos y flotas, automatización de navegadores y dispositivos, y sistemas de comunicación.',
      'Migraciones y optimización de infraestructura centradas en fiabilidad y costes.',
      'Decisiones de arquitectura y desarrollo directo de sistemas en producción.'
    ]],
    ['Fundador y CEO', 'Barcelona, España', 'Fundé Glassear en 2015 y he iterado durante una década en óptica, mecánica, electrónica y software. Hoy construyo un ecosistema de realidad aumentada: Glassear One, Glassear Studio y GlassMusic.', [
      'Glassear One: gafas de realidad aumentada con visión óptica directa que utilizan el móvil como pantalla y ordenador. Menos coste, peso y electrónica propia. Patente en trámite.',
      'Glassear Studio transforma instrucciones en lenguaje natural en aplicaciones espaciales interactivas: integración con Unity, runtime propio, GLX, parches y revisiones de escena, sincronización, AI Planner, Intent Graph y herramientas para agentes.',
      'GlassMusic: realidad aumentada para aprender e interpretar música sin usar las manos. Presentado en 4YFN/MWC 2025 y en 4YFN/MWC 2026 desde el estand de Catalan Arts.',
      'Selección en el catálogo de 50 startups catalanas con mayor potencial de la Catalan Pitch Competition 2025 de ACCIÓ.',
      'Dirección de producto, arquitectura y desarrollo con hardware, Unity, TypeScript, React, Node.js, Python y PostgreSQL.'
    ]],
    ['Desarrollador freelance', 'Remoto', 'Desarrollé la aplicación web del Test de Hess para evaluación psicológica en selección de personal, con React y un backend WordPress/PHP.', [
      'Almacenamiento de datos, gestión de usuarios y envío automático de correos.',
      'Colas de procesamiento para funcionar dentro de los límites de un alojamiento compartido, con soporte para distintos dispositivos y navegadores.'
    ]],
    ['Responsable técnico', 'Barcelona, España', 'Colaboré con FECAMM, una entidad dedicada a las enfermedades minoritarias, para llevar juegos accesibles a la plataforma Patient73.', ['Colaboración en la organización de game jams de un mes con la UAB, la UPC y hospitales participantes.']],
    ['Prácticas de seguimiento de manos en AR/VR', 'Estocolmo, Suecia', 'Desarrollé y optimicé aplicaciones e interfaces de realidad aumentada con seguimiento de manos de ManoMotion, Unity y visión artificial.', []],
    ['Prácticas de visión artificial', 'Barcelona, España', 'Desarrollé una aplicación Android en Java para seguimiento de poses, caras y objetos durante mis prácticas en el Computer Vision Center.', []]
  ];
  translated.experience = data.experience.map((item, i) => ({ ...item, role: experience[i][0], location: experience[i][1], summary: experience[i][2], highlights: experience[i][3] }));
  const degrees = ['Ingeniería Informática', 'Intercambio de Ingeniería Informática', 'Doble bachillerato francés y español (Bachibac)', 'Graduado en ESO y Educación Primaria'];
  translated.education = data.education.map((item, i) => ({ ...item, degree: degrees[i], location: item.location === null ? null : (i === 1 ? 'Montreal, Canadá' : 'Barcelona, España') }));
  const groups = ['Backend y sistemas distribuidos', 'Frontend', 'Infraestructura', 'XR y computación espacial', 'Herramientas e integración de IA', 'Hardware'];
  translated.skills = Object.fromEntries(Object.values(data.skills).map((skills, i) => [groups[i], skills]));
  translated.projects = data.projects.map(project => ({ ...project, ...projects[project.id] }));
  return translated;
}

const projects = {
  jobagent: {
    title: 'JobAgent — Búsqueda de empleo y candidaturas con IA',
    category: 'IA y sistemas de agentes', role: 'Creador y desarrollador',
    outcome: 'Utilizo JobAgent para gestionar mi propia búsqueda de empleo.',
    problem: 'Buscar empleo y gestionar candidaturas combina interpretación semántica con procesos que deben ser precisos, trazables y estar bajo el control del candidato.',
    description: 'Sistema de agentes para descubrir ofertas, analizar su encaje, adaptar el CV y asistir en las candidaturas mediante automatización controlada del navegador.',
    architecture: 'FastAPI y Celery coordinan procesos sobre PostgreSQL, con una interfaz React/TypeScript y despliegue en Docker. El ciclo de vida se representa mediante una máquina de estados explícita, con observabilidad y auditoría.',
    aiComponent: 'Modelos de lenguaje para evaluar el encaje y ayudar a adaptar el CV, con integración de OpenAI, Anthropic y Gemini, y conexión con Reactive Resume mediante REST y MCP.',
    deterministicComponent: 'Playwright, puntos de aprobación humana, Candidate Answer Vault, transiciones de estado y controles para evitar respuestas inventadas.',
    principle: 'Uso modelos de lenguaje cuando aporta valor el razonamiento semántico, y reglas deterministas cuando importan la fiabilidad, la integridad y la repetibilidad.',
    highlights: ['Descubrimiento de ofertas en varias fuentes.', 'Análisis semántico del encaje con el perfil.', 'Aprobación humana antes de enviar candidaturas.', 'Integración con Telegram.', 'Observabilidad y registro de auditoría.'],
    actionLabel: 'Ver JobAgent en GitHub'
  },
  'talent-gap-analyzer': {
    title: 'TalentGapAnalyzer — Análisis de talento con IA',
    category: 'IA y sistemas de agentes', role: 'Colaborador en un proyecto de equipo',
    outcome: 'Ganador de UAB The Hack 2025.',
    problem: 'Identificar carencias de competencias, compatibilidad con puestos y oportunidades de desarrollo con criterios que puedan explicarse.',
    description: 'Proyecto de equipo para analizar competencias y necesidades de formación con IA, desarrollado en UAB The Hack 2025.',
    architecture: 'Python y FastAPI con Pandas, scikit-learn y React. Incluye proveedores alternativos de IA, caché y seguimiento del coste y los tokens.',
    aiComponent: 'OpenAI, Anthropic y Gemini generan recomendaciones profesionales, planes de desarrollo y conclusiones organizativas explicables.',
    deterministicComponent: 'Análisis estructurado de compatibilidad, caché, seguimiento de costes, comprobaciones de sesgos, límites y auditoría.',
    principle: 'Combinar recomendaciones con análisis medible, controles y explicaciones.',
    highlights: ['Análisis de carencias de competencias.', 'Compatibilidad entre perfiles y puestos.', 'Planes de desarrollo con IA.', 'Comprobaciones de sesgos y controles.', 'Alternancia entre proveedores de modelos.']
  },
  'glassear-studio': {
    title: 'Glassear Studio — Del lenguaje natural a la XR interactiva',
    category: 'IA y XR', role: 'Fundador, arquitecto y desarrollador',
    outcome: 'Plataforma con IA para crear y modificar experiencias XR interactivas, con un editor web y ejecución en Unity.',
    problem: 'Crear experiencias XR exige herramientas especializadas y coordinar la edición manual con el entorno de ejecución.',
    description: 'Plataforma que transforma instrucciones en lenguaje natural en cambios estructurados y sincronizados en experiencias de realidad extendida.',
    architecture: 'AI Planner, Intent Graph, operaciones de herramientas, MCP, parches de escena y sincronización del runtime. Editor web con TypeScript, React y Node.js, conectado a Unity.',
    aiComponent: 'Interpretación de instrucciones y planificación de herramientas con modelos de lenguaje, dentro de restricciones explícitas.',
    deterministicComponent: 'Operaciones tipadas, validación, reconciliación y confirmaciones del runtime para controlar el estado de la escena.',
    principle: 'El razonamiento propone; los contratos deterministas validan, aplican y sincronizan.',
    highlights: ['Creación de aplicaciones desde lenguaje natural.', 'AI Planner e Intent Graph.', 'Herramientas para agentes mediante MCP.', 'Cambios estructurados en escenas y ejecución.', 'Combinación de reglas deterministas y modelos de lenguaje.'],
    actionLabel: 'Abrir Glassear Studio'
  },
  mapanim: {
    title: 'MapAnim — Route Motion Studio',
    category: 'Herramientas creativas y visualización geoespacial', role: 'Desarrollo de producto e ingeniería de software',
    outcome: 'Editor interactivo de rutas animadas con itinerarios, cámara, estilos de mapa y exportación por fotogramas.',
    problem: 'Animar un itinerario requiere coordinar la geometría de la ruta, la cámara, los tiempos y el renderizado.',
    description: 'Editor de mapas de viajes animados en el navegador, con itinerarios editables, una línea de tiempo de cámara, estilos de mapa y exportación MP4.',
    architecture: 'React, TypeScript, MapLibre GL y Zustand. Un motor de escena compartido calcula la ruta y la cámara para cada instante; Playwright y Chromium capturan los fotogramas y FFmpeg genera el vídeo.',
    aiComponent: 'El funcionamiento no depende de IA generativa.',
    deterministicComponent: 'La vista previa y la exportación comparten getSceneAtTime(project, time) para representar la misma escena en cada instante.',
    principle: 'Un único modelo de escena para la vista previa y la exportación.',
    highlights: ['Importación GPX y tiempos del itinerario.', 'Transiciones continuas de cámara.', 'Estilos de mapa y ejemplo de la Ruta 66, de Chicago a Santa Mónica.', 'Exportación MP4 por fotogramas con FFmpeg.']
  }
};
