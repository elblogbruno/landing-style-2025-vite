// Spanish copy for the static professional pages. IDs, images, dates and URLs come from the shared data.
export function spanishProfile(data, site) {
  const translated = structuredClone(data);
  Object.assign(translated.person, {
    headline: site.hero.subtitle,
    tagline: 'Convierto tecnología emergente en productos reales.',
    description: 'Bruno Moya, fundador y CEO de Glassear, ingeniero de software en Barcelona y CTO en TopBrokers. En este portfolio personal documento mi contribución, mis decisiones de ingeniería y mi trayectoria en hardware AR, software XR, IA e infraestructura.'
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
    ['CTO', 'Mataró, España · Remoto', 'CTO de una plataforma de automatización con IA en producción para el sector inmobiliario (me incorporé en julio de 2025; CTO desde noviembre de 2025). Lidero un equipo de tres ingenieros, reporto al CEO y trabajo con clientes como Comprarcasa, Housfy y AIC.', [
      'Construí desde cero una granja de dispositivos remota: un sistema distribuido que controla más de 140 móviles Android para operar WhatsApp de forma nativa, monitorizarlos y automatizar mensajería a escala.',
      'Desarrollo servicios Python/FastAPI sobre PostgreSQL con flujos asíncronos en RabbitMQ/Celery, y whatsapp-srv, el servicio de mensajería en TypeScript/Node.js; los flujos de LLM y WhatsApp superan las 1.000 conversaciones en los picos diarios.',
      'Desarrollo el CRM interno en Flutter; construí un editor visual de journeys (React Flow) con un sandbox de chat para los flujos de IA de WhatsApp, y un visor para seguir y reintentar las ejecuciones.',
      'Conecté Codex a Sentry por MCP para que un agente localice en el código los errores de producción y proponga correcciones; construí un servidor MCP para la plataforma interna de tareas (FastMCP, 20 herramientas) y una skill de plugin de Codex para un cambio recurrente entre repositorios.',
      'Reduje el coste de infraestructura en la nube de ~2.500 €/mes a ~600 €/mes rediseñando la arquitectura y migrando.'
    ]],
    ['Fundador y CEO', 'Barcelona, España', 'Fundé Glassear en 2015 y he iterado durante una década en óptica, mecánica, electrónica y software. Hoy construyo un ecosistema de realidad aumentada: Glassear One, Glassear Studio y GlassMusic.', [
      'Glassear One: gafas de realidad aumentada con visión óptica directa que utilizan el móvil como pantalla y ordenador. Menos coste, peso y electrónica propia. Patente en trámite.',
      'Glassear Studio, una plataforma totalmente agéntica para apps XR: agentes de programación oficiales (Claude Code y OpenAI Codex en producción; Copilot, Cursor, OpenCode, Kimi, Mistral Vibe y Kiro tras feature flags) crean, prueban y corrigen apps con más de 100 herramientas MCP y comprueban su trabajo en una vista previa XR privada. Servidor MCP remoto con OAuth; ejecuciones trazadas con Langfuse sobre OpenTelemetry.',
      'Glassear Agent, el agente local, en Rust: un servicio glassear-agentd dividido en crates y distribuido en una app de escritorio Tauri 2.',
      'GlassMusic: realidad aumentada para aprender e interpretar música sin usar las manos. Presentado en 4YFN/MWC 2025 y en 4YFN/MWC 2026 desde el estand de Catalan Arts.',
      'Selección en el catálogo de 50 startups catalanas con mayor potencial de la Catalan Pitch Competition 2025 de ACCIÓ.',
      'Dirección de producto, arquitectura y desarrollo con hardware, Unity, TypeScript, React, Node.js, Python y PostgreSQL.'
    ]],
    ['Ingeniero de producto full-stack (freelance)', 'Remoto', 'Construí el Test Hess de principio a fin para Ciane Consulting: un SaaS de evaluación psicológica para equipos de RR. HH., con React en el frontend y PHP/WordPress en el backend, con arquitectura MVC.', [
      'Stripe como capa de pago, conectando el checkout con el acceso de pago a la evaluación.',
      'Integración de la API de OpenAI para convertir cada cuestionario completado en un resumen en lenguaje claro de las respuestas.',
      'Base de datos, flujos de usuario, correos automáticos, lógica de puntuación y colas de procesamiento dentro de los límites de un hosting compartido.'
    ]],
    ['Responsable técnico', 'Barcelona, España', 'Dirección técnica y requisitos de accesibilidad de Patient73, la plataforma de juegos terapéuticos de FECAMM para pacientes con enfermedades minoritarias (coordinación, no implementación directa).', [
      'Requisitos de los protocolos de integración y de los adaptadores de accesibilidad para periféricos adaptados.',
      'Organización de dos game jams: la primera en remoto desde Montreal (más de 10 videojuegos y más de 3.500 € en premios, entrega en la UPC); la segunda, de un mes, con universidades, el RCD Espanyol y hospitales (más de 100 videojuegos y 11.000 € en premios, entrega en el Ajuntament de Barcelona).'
    ]],
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
    title: 'Cómo estoy construyendo Glassear Studio',
    category: 'IA y XR', role: 'Fundador, arquitecto y desarrollador',
    outcome: 'Plataforma totalmente agéntica donde agentes de programación oficiales crean, prueban y corrigen apps XR interactivas en un IDE web, un simulador WebXR y el runtime de Unity.',
    problem: 'Crear experiencias XR exige herramientas especializadas y coordinar la edición manual con el entorno de ejecución.',
    description: 'Mi trabajo como fundador e ingeniero de Glassear: el usuario describe una app XR y un agente de programación oficial (Claude Code u OpenAI Codex) la construye, la prueba y la corrige.',
    architecture: 'Monorepo TypeScript: IDE en React con Monaco, API Fastify sobre PostgreSQL con streaming por WebSocket, simulador WebXR sobre three.js/IWSDK y un puente que controla Unity mediante parches de escena estructurados. Una capa de adaptadores sobre SDK oficiales, ACP y CLI ejecuta los agentes en un sandbox Docker con proxy de salida y tokens MCP efímeros, o en local con Glassear Agent (Rust, Tauri 2).',
    aiComponent: 'Desde 2026, el agente de programación del proveedor se encarga de la planificación y del bucle de herramientas, en lugar del AI Planner e Intent Graph propios. Los agentes usan más de 100 herramientas MCP, con clics, mirada y agarres simulados y captura de fotogramas, para comprobar su trabajo en una vista previa XR privada. Un servidor MCP remoto con OAuth abre las herramientas a ChatGPT, Claude y otros clientes.',
    deterministicComponent: 'Studio se encarga de las sesiones, la autenticación, el aislamiento, la observabilidad (Langfuse sobre OpenTelemetry) y la validación de compilaciones, maquetación y el contrato de escena GLX. Más de 200 ficheros de tests garantizan los contratos entre capas.',
    principle: 'El agente decide; la plataforma valida.',
    highlights: ['Orquestador de agentes de programación oficiales (Claude Code, Codex).', 'Más de 100 herramientas MCP con autocomprobación en una vista previa XR.', 'Servidor MCP remoto con OAuth.', 'Sandbox Docker y agente local en Rust.', 'Trazas con Langfuse y más de 200 ficheros de tests de contrato.'],
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
