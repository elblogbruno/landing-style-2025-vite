# Bruno Moya - Selected Projects

## JobAgent - Autonomous AI Job Search & Application System

An autonomous, agentic job-search platform for role discovery, semantic matching, job analysis, CV tailoring and controlled browser-assisted applications.

- **Problem:** Job discovery and application management combine semantic judgment with workflows that must remain accurate, traceable and under candidate control.
- **Architecture:** FastAPI and Celery services coordinate PostgreSQL-backed workflows with a React/TypeScript interface and Docker deployment. The application lifecycle is represented as an explicit state machine with observability and audit trails.
- **AI / agentic:** LLMs analyze role fit, tailor CV content and support agent workflows through an OpenAI, Anthropic and Gemini abstraction. Reactive Resume is integrated through REST and MCP.
- **Deterministic:** Playwright automation, approval gates, the Candidate Answer Vault, application state transitions and anti-hallucination safeguards keep actions repeatable and reviewable.
- **Role:** Creator and engineer
- **Outcome:** I use JobAgent to manage my own job search.
- **Stack:** Python, FastAPI, Celery, PostgreSQL, React, TypeScript, Docker, Playwright, MCP, OpenAI, Anthropic, Gemini
- **Case study:** https://brunomoya.com/projects/jobagent/
- **Repository:** https://github.com/elblogbruno/JobAgent

## TalentGapAnalyzer - AI Workforce Intelligence

AI-powered workforce intelligence and talent gap analysis platform built as a team project at UAB The Hack 2025.

- **Problem:** Organizations need a defensible way to understand skill gaps, role compatibility and workforce development opportunities.
- **Architecture:** A Python/FastAPI analysis backend uses Pandas and Scikit-learn, with a React interface, provider fallback, caching and cost/token tracking.
- **AI / agentic:** OpenAI, Anthropic and Gemini generate career recommendations, development plans, organizational insights and explainable narratives.
- **Deterministic:** Structured compatibility analysis, caching, cost tracking, bias checks, guardrails and audit data constrain and explain generated output.
- **Role:** Team project contributor
- **Outcome:** Winner - UAB The Hack 2025
- **Stack:** Python, FastAPI, Pandas, Scikit-learn, React, OpenAI, Anthropic, Gemini
- **Case study:** https://brunomoya.com/projects/talent-gap-analyzer/
- **Repository:** https://github.com/OriolRoura/TalentGapAnalyzer-UABTheHack

## Glassear Studio - Natural Language to Interactive XR

Glassear Studio translates natural-language intent into structured, synchronized changes to interactive XR applications.

- **Problem:** Creating interactive XR applications normally requires specialized tooling and manual coordination between authoring systems and runtime state.
- **Architecture:** An AI Planner and Intent Graph coordinate tool-based operations, MCP integrations, structured scene patches and runtime synchronization between a TypeScript/React/Node.js web platform and Unity.
- **AI / agentic:** LLMs interpret intent and plan tool calls within explicit system constraints.
- **Deterministic:** Typed operations, validation, reconciliation and runtime acknowledgements control how planned changes become scene state.
- **Role:** Founder, architect and hands-on engineer
- **Outcome:** An AI-native platform for building and modifying interactive XR applications across a web authoring environment and Unity runtime.
- **Stack:** TypeScript, React, Node.js, Unity, Python, PostgreSQL, MCP, LLM APIs, XR
- **Case study:** https://brunomoya.com/projects/glassear-studio/
