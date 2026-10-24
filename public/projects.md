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
- **Case study:** https://brunomoya.com/#projects
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
- **Case study:** https://brunomoya.com/#projects
- **Repository:** https://github.com/OriolRoura/TalentGapAnalyzer-UABTheHack

## How I am building Glassear Studio

My work as the founder and engineer of Glassear: the user describes an XR app, and an official coding agent (Claude Code or OpenAI Codex) builds it, tests it and fixes it.

- **Problem:** Creating interactive XR applications normally requires specialized tooling and manual coordination between authoring systems and runtime state.
- **Architecture:** A TypeScript monorepo: React IDE with Monaco, Fastify API on PostgreSQL with WebSocket streaming, a WebXR simulator on three.js/IWSDK and a bridge that drives Unity through structured scene patches. A provider adapter layer over official SDKs, ACP and CLIs runs the agents in a Docker sandbox with an egress proxy and ephemeral MCP tokens, or locally through Glassear Agent (Rust, Tauri 2).
- **AI / agentic:** Since 2026 the provider's coding agent owns planning and the tool loop, replacing the earlier in-house AI Planner and Intent Graph. Agents use 100+ MCP tools, including simulated clicks, gaze, grabs and frame capture, to check their own work in a private XR preview. A remote MCP server with OAuth opens the tools to ChatGPT, Claude and other clients.
- **Deterministic:** Studio owns sessions, authentication, isolation, observability (Langfuse over OpenTelemetry) and validation of builds, layouts and the GLX scene contract. 200+ test files enforce cross-layer contracts.
- **Role:** Founder, architect and hands-on engineer
- **Outcome:** A fully agentic platform where official coding agents build, test and fix interactive XR apps across a web IDE, a WebXR simulator and the Unity runtime.
- **Stack:** TypeScript, React, Fastify, PostgreSQL, Unity, three.js, WebXR, Rust, Tauri, Docker, MCP, Claude Code, OpenAI Codex, Langfuse
- **Case study:** https://glassear.com/studio/

## MapAnim — Route Motion Studio

A browser-based editor for animated travel maps, with an editable itinerary, camera controls, a timeline, map styles and MP4 export.

- **Problem:** Turning a travel itinerary into a map animation requires coordinating route geometry, camera movement, timing and video rendering.
- **Architecture:** React and TypeScript power the editor, MapLibre GL renders the map, and Zustand manages project state. A shared scene engine evaluates the route and camera at a given time. Playwright captures frames in Chromium and FFmpeg encodes the video.
- **AI / agentic:** The route animation and video export pipeline does not depend on generative AI.
- **Deterministic:** The editor preview and frame-by-frame export share getSceneAtTime(project, time), so both use the same route and camera calculations.
- **Role:** Product development and software engineering.
- **Outcome:** An interactive route-animation editor combining itinerary editing, camera controls, map styling and a frame-by-frame export pipeline.
- **Stack:** React, TypeScript, MapLibre GL, Zustand, Turf.js, Playwright, FFmpeg
- **Case study:** https://brunomoya.com/#projects
- **Repository:** https://github.com/elblogbruno/MapAnim
