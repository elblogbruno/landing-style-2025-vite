# JobAgent - Autonomous AI Job Search & Application System

_AI & Agentic Systems_

An autonomous, agentic job-search platform for role discovery, semantic matching, job analysis, CV tailoring and controlled browser-assisted applications.

**Outcome:** I use JobAgent to manage my own job search.

## Problem

Job discovery and application management combine semantic judgment with workflows that must remain accurate, traceable and under candidate control.

## What I built

An autonomous, agentic job-search platform for role discovery, semantic matching, job analysis, CV tailoring and controlled browser-assisted applications.

- Multi-source job discovery
- Semantic job matching
- Human-in-the-loop approval
- Telegram notifications
- Observability and auditability

## Architecture

FastAPI and Celery services coordinate PostgreSQL-backed workflows with a React/TypeScript interface and Docker deployment. The application lifecycle is represented as an explicit state machine with observability and audit trails.

## AI / agentic component

LLMs analyze role fit, tailor CV content and support agent workflows through an OpenAI, Anthropic and Gemini abstraction. Reactive Resume is integrated through REST and MCP.

## Deterministic components

Playwright automation, approval gates, the Candidate Answer Vault, application state transitions and anti-hallucination safeguards keep actions repeatable and reviewable.

> LLMs are used where semantic reasoning is useful; deterministic software is used where reliability, integrity and repeatability matter.

## Stack

Python, FastAPI, Celery, PostgreSQL, React, TypeScript, Docker, Playwright, MCP, OpenAI, Anthropic, Gemini

## My role

Creator and engineer

[View JobAgent on GitHub](https://github.com/elblogbruno/JobAgent)

[View all selected projects](https://brunomoya.com/en/projects/)

---

Page: https://brunomoya.com/en/projects/jobagent/
This page in Spanish: https://brunomoya.com/projects/jobagent/
Agent index: https://brunomoya.com/llms.txt
Full profile as JSON: https://brunomoya.com/profile.json
Contact: bruno@glassear.com
