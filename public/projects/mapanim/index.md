# MapAnim — Route Motion Studio

_Herramientas creativas y visualización geoespacial_

Editor de mapas de viajes animados en el navegador, con itinerarios editables, una línea de tiempo de cámara, estilos de mapa y exportación MP4.

**Resultado:** Editor interactivo de rutas animadas con itinerarios, cámara, estilos de mapa y exportación por fotogramas.

## El problema

Animar un itinerario requiere coordinar la geometría de la ruta, la cámara, los tiempos y el renderizado.

## Qué construí

Editor de mapas de viajes animados en el navegador, con itinerarios editables, una línea de tiempo de cámara, estilos de mapa y exportación MP4.

- Importación GPX y tiempos del itinerario.
- Transiciones continuas de cámara.
- Estilos de mapa y ejemplo de la Ruta 66, de Chicago a Santa Mónica.
- Exportación MP4 por fotogramas con FFmpeg.

## Arquitectura

React, TypeScript, MapLibre GL y Zustand. Un motor de escena compartido calcula la ruta y la cámara para cada instante; Playwright y Chromium capturan los fotogramas y FFmpeg genera el vídeo.

## Componente de IA y agentes

El funcionamiento no depende de IA generativa.

## Componentes deterministas

La vista previa y la exportación comparten getSceneAtTime(project, time) para representar la misma escena en cada instante.

> Un único modelo de escena para la vista previa y la exportación.

## Tecnologías

React, TypeScript, MapLibre GL, Zustand, Turf.js, Playwright, FFmpeg

## Mi papel

Desarrollo de producto e ingeniería de software

[Ver todos los proyectos](https://brunomoya.com/projects/)

---

Página: https://brunomoya.com/projects/mapanim/
Esta página en inglés: https://brunomoya.com/en/projects/mapanim/
Índice para agentes: https://brunomoya.com/llms.txt
Perfil completo en JSON: https://brunomoya.com/profile.json
Contacto: bruno@glassear.com
