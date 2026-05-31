# Portfolio Redesign Design

Date: 2026-05-31
Project: brunomoya.com portfolio redesign
Status: Draft for user review

## Goal

Redesign the current portfolio so the interactive elevator remains the core differentiator, but the site becomes a clear professional tool for recruiters first, investors second, and clients third.

The site should explain within the first 5 seconds:

- who Bruno Moya is
- what he builds
- what makes him different
- why the work matters

The redesign must preserve the current stack, keep ES/EN support, maintain responsive behavior, and avoid turning the elevator into a decorative gimmick.

## Product Positioning

Primary audience order:

1. Recruiters
2. Investors
3. Clients

Positioning statement:

"Bruno Moya is a Founder, CTO, and Product Engineer who builds products at the intersection of AR/XR, applied AI, computer vision, and hardware-software integration."

Core differentiation:

- 10+ years building Glassear, a self-driven AR/XR device initiative
- end-to-end product engineering across hardware, software, UX, backend, frontend, and live demos
- ability to communicate complex technology publicly through talks, demos, and applied product storytelling

## Current Code Constraints

Current structure already supports a surgical redesign:

- `src/app/page.tsx` orchestrates the landing with sections and the desktop elevator column
- `src/app/sections/Hero.tsx` is isolated and can be redesigned without rewriting the whole app
- elevator logic is centralized in `src/app/hooks/useElevatorNavigation.tsx`
- section copy and data are driven mostly from `src/locales/es/translation.json` and `src/locales/en/translation.json`
- mobile already has a usable elevator interaction pattern through `MobileElevatorWidget`

This means the redesign should focus on:

- hero composition and copy
- top navigation simplification
- section hierarchy and naming
- stronger featured-project storytelling
- elevator copy and floor semantics
- selected visual cleanup and spacing changes

## Information Architecture

### Top Navigation

Primary top-level items:

- Inicio / Home
- Glassear
- Experiencia / Experience
- Proyectos / Projects
- Charlas / Talks
- Contacto / Contact

Secondary content should remain in-page rather than first-class navigation:

- awards
- education
- news
- personal history

### Elevator Narrative

The elevator becomes professional narrative navigation rather than a general-purpose section switcher.

Recommended floor story:

- `0F` Start: who Bruno is and what he builds
- `1F` Glassear: 10 years building a proprietary AR/XR device
- `2F` Product Engineering: end-to-end product delivery
- `3F` AI & Computer Vision: OpenCV, YOLO, agents, tracking, real-time systems
- `4F` Experience: Topbrokers, ManoMotion, Computer Vision Center, freelance
- `5F` Talks & Communication: public demos, technical talks, workshops
- `6F` Awards & Impact: Maker Faire, Patient73/FECAMM, hackathons, media recognition
- `-1B` Personal Archive: origin story and early curiosity

Implementation note:

The current section ids can stay stable where convenient, but labels, descriptions, and ordering must be updated so the elevator tells this new story.

## Layout Design

### Hero

Desktop hero uses two columns.

Left column:

- eyebrow: `Founder / CTO / Product Engineer`
- primary headline:
  `Construyo productos que conectan el mundo físico y digital.`
  `I build products that connect the physical and digital world.`
- supporting paragraph focused on AR/XR, applied AI, computer vision, Glassear, and hardware-software-product integration
- quick metrics grid with four high-signal facts
- CTA group with one dominant action and two secondary actions

Right column:

- integrated elevator module with avatar
- compact supporting label such as `Explora mi carrera piso a piso`
- cleaner frame, reduced visual noise, better contrast
- the elevator should read as a productized demo of Bruno's career narrative

Hero CTA hierarchy:

1. Primary: `Explorar mi carrera piso a piso` / `Explore my career floor by floor`
2. Secondary: `Ver proyectos` / `View projects`
3. Secondary: `Descargar CV` / `Download CV`

Behavior:

- the primary CTA must trigger or focus the elevator journey directly
- no alternate page navigation
- in desktop, the elevator remains visible in the initial fold
- in mobile, copy comes first and the elevator appears as the next module below the hero text

### Mobile

Mobile behavior should keep the current successful interaction pattern:

- hero prioritizes copy and CTA clarity
- elevator appears immediately below as a dedicated module
- the existing mobile floor-control pattern and door animation are preserved
- spacing and copy must avoid making the mobile hero feel crowded

## Section Plan

### Trust Band

Immediately below the hero:

- Glassear
- Topbrokers
- ManoMotion
- Computer Vision Center
- ETS Montreal
- UAB
- Maker Faire
- FECAMM

This should be compact and premium, not a loud sponsor wall.

### Why Bruno Is Different

Short high-clarity capability grid built around:

- Hardware + software
- AR/XR + computer vision
- Applied AI + automation
- Product + prototyping
- Full-stack + device integration
- Technical communication + demos

### Floor-Driven Main Content

Each major section should feel like a stronger professional proof point:

- Glassear section: vision, years of work, device, demos, tech surface, impact
- Product Engineering section: how Bruno ships end-to-end systems
- AI & Computer Vision section: practical systems, tracking, LLM/agents, real-time interaction
- Experience section: roles and outcomes, especially Topbrokers and prior technical work
- Talks section: speaking, workshops, demos, public communication
- Awards & Impact section: awards, social impact, public recognition
- Personal Archive section: origin story moved lower in the hierarchy

### Featured Projects

Featured cards should be more case-study-like and less gallery-like.

Target featured set:

- Glassear
- Topbrokers AI Automations
- Brainmate
- Patient73 GameJam
- Hess Test
- OpenCV Detectors

Each featured card should surface:

- problem
- solution
- technologies
- result
- link

### Contact

Close with a direct positioning statement:

`Trabajo en productos donde convergen software, IA, XR y hardware.`
`I work on products where software, AI, XR, and hardware converge.`

Primary contact actions:

- email
- LinkedIn
- CV

## Visual Direction

Desired direction:

- dark and futuristic
- cleaner and more premium
- more whitespace
- stronger text contrast
- less decorative noise in the background
- fewer gratuitous technical overlays
- the elevator should attract attention without overpowering the message

Visual principles:

- emphasize product confidence over experimental spectacle
- keep typography strong and readable
- make recruiter scanning fast
- use motion only where it improves storytelling
- preserve accessibility basics: contrast, focus states, and interactive labels

## Content Strategy

Copy should shift from autobiographical/enthusiast framing toward professional proof and technical authority.

Specific changes:

- hero copy becomes recruiter-first and founder-aware
- elevator floor labels become business-relevant
- project descriptions emphasize problem, implementation, and outcome
- talks and awards become proof of credibility, not side curiosities
- personal story remains present, but is intentionally de-emphasized in the main path

## Technical Plan Boundaries

Implementation should remain surgical, not a full rewrite.

In scope:

- refactor `Hero.tsx`
- adjust `page.tsx` layout where needed for hero/elevator integration
- simplify `Navbar.tsx`
- update floor semantics and labels in translation files
- reorganize/reframe existing sections
- add or refactor supporting UI blocks such as trust band and differentiation section
- improve project card content hierarchy
- preserve ES/EN and responsive behavior

Out of scope for this redesign pass:

- changing the framework or stack
- removing the elevator
- building a separate multi-page site
- introducing heavy new animation systems
- a broad data-model rewrite outside what is needed for content structure

## Validation Requirements

Before completion:

- verify ES and EN render correctly
- verify desktop, tablet, and mobile layout behavior
- verify primary CTA behavior with elevator
- verify build passes
- verify lint passes
- avoid regressions in mobile elevator controls

## Risks and Mitigations

Risk: the elevator still dominates too much visually.
Mitigation: reduce frame noise, rebalance sizing, and strengthen the left-column copy hierarchy.

Risk: section ids and elevator floor mapping drift apart.
Mitigation: centralize any revised mapping and keep floor labels aligned with section anchors.

Risk: content becomes too broad again.
Mitigation: keep the recruiter-first hierarchy and downgrade secondary material to sub-sections.

Risk: responsive hero becomes crowded.
Mitigation: move the elevator below the hero copy on mobile and keep metrics compact.

## Recommended Next Step

After user approval of this design spec:

1. write a concrete implementation plan
2. execute the redesign surgically in the existing codebase
3. verify responsive behavior, translations, build, and lint
