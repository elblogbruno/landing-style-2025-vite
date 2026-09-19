# MapAnim — Route Motion Studio

_Creative tools & geospatial visualization_

A browser-based editor for animated travel maps, with an editable itinerary, camera controls, a timeline, map styles and MP4 export.

**Outcome:** An interactive route-animation editor combining itinerary editing, camera controls, map styling and a frame-by-frame export pipeline.

## Problem

Turning a travel itinerary into a map animation requires coordinating route geometry, camera movement, timing and video rendering.

## What I built

A browser-based editor for animated travel maps, with an editable itinerary, camera controls, a timeline, map styles and MP4 export.

- Editable itineraries, GPX import and route timing on a timeline.
- Camera controls and continuous route transitions.
- Multiple map styles and a Route 66 example from Chicago to Santa Monica.
- Frame-by-frame capture and FFmpeg MP4 encoding.

## Architecture

React and TypeScript power the editor, MapLibre GL renders the map, and Zustand manages project state. A shared scene engine evaluates the route and camera at a given time. Playwright captures frames in Chromium and FFmpeg encodes the video.

## AI / agentic component

The route animation and video export pipeline does not depend on generative AI.

## Deterministic components

The editor preview and frame-by-frame export share getSceneAtTime(project, time), so both use the same route and camera calculations.

> One scene model for interactive preview and exported video.

## Stack

React, TypeScript, MapLibre GL, Zustand, Turf.js, Playwright, FFmpeg

## My role

Product development and software engineering.

[View all selected projects](https://brunomoya.com/en/projects/)

---

Page: https://brunomoya.com/en/projects/mapanim/
This page in Spanish: https://brunomoya.com/projects/mapanim/
Agent index: https://brunomoya.com/llms.txt
Full profile as JSON: https://brunomoya.com/profile.json
Contact: bruno@glassear.com
