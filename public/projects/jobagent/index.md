# JobAgent — Búsqueda de empleo y candidaturas con IA

_IA y sistemas de agentes_

Sistema de agentes para descubrir ofertas, analizar su encaje, adaptar el CV y asistir en las candidaturas mediante automatización controlada del navegador.

**Resultado:** Utilizo JobAgent para gestionar mi propia búsqueda de empleo.

## El problema

Buscar empleo y gestionar candidaturas combina interpretación semántica con procesos que deben ser precisos, trazables y estar bajo el control del candidato.

## Qué construí

Sistema de agentes para descubrir ofertas, analizar su encaje, adaptar el CV y asistir en las candidaturas mediante automatización controlada del navegador.

- Descubrimiento de ofertas en varias fuentes.
- Análisis semántico del encaje con el perfil.
- Aprobación humana antes de enviar candidaturas.
- Integración con Telegram.
- Observabilidad y registro de auditoría.

## Arquitectura

FastAPI y Celery coordinan procesos sobre PostgreSQL, con una interfaz React/TypeScript y despliegue en Docker. El ciclo de vida se representa mediante una máquina de estados explícita, con observabilidad y auditoría.

## Componente de IA y agentes

Modelos de lenguaje para evaluar el encaje y ayudar a adaptar el CV, con integración de OpenAI, Anthropic y Gemini, y conexión con Reactive Resume mediante REST y MCP.

## Componentes deterministas

Playwright, puntos de aprobación humana, Candidate Answer Vault, transiciones de estado y controles para evitar respuestas inventadas.

> Uso modelos de lenguaje cuando aporta valor el razonamiento semántico, y reglas deterministas cuando importan la fiabilidad, la integridad y la repetibilidad.

## Tecnologías

Python, FastAPI, Celery, PostgreSQL, React, TypeScript, Docker, Playwright, MCP, OpenAI, Anthropic, Gemini

## Mi papel

Creador y desarrollador

[Ver JobAgent en GitHub](https://github.com/elblogbruno/JobAgent)

[Ver todos los proyectos](https://brunomoya.com/projects/)

---

Página: https://brunomoya.com/projects/jobagent/
Esta página en inglés: https://brunomoya.com/en/projects/jobagent/
Índice para agentes: https://brunomoya.com/llms.txt
Perfil completo en JSON: https://brunomoya.com/profile.json
Contacto: bruno@glassear.com
