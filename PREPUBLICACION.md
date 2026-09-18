# Revisión previa a publicación — 18/09/2026

Build correcto y 11 pruebas aprobadas. Verificados español/inglés, fotos, botones, rutas estáticas, ascensor y tamaños de 320 a 1920 px. Experiencia precede a Proyectos. Glassear abre su plataforma y JobAgent enlaza a GitHub.

El móvil ya no descarga el ascensor 3D al inicio. El avatar del escenario se monta al acercarse. El build genera /en/ automáticamente y comparte los recursos entre idiomas.

Lighthouse móvil local tras optimización: rendimiento 71/100 (antes 56); accesibilidad, buenas prácticas y SEO 100/100. LCP 3,3 s (antes 5,0 s), bloqueo total 830 ms (antes 1170 ms), CLS 0 (antes 0,017). Queda margen en móviles lentos; es una simulación local, no una medición del alojamiento público. Informes: lighthouse-mobile-before.json y lighthouse-mobile-after.json.

Formulario comprobado con respuestas interceptadas: validación, éxito y error; el texto se conserva ante fallo. No se verificó entrega real de Formspree ni se publicó la web.

Algunos reconocimientos conservan logos o imágenes de proyecto porque no hay fotos de entrega/diplomas disponibles. Las páginas de detalle mantienen su idioma inglés. MapAnim usa una captura real; se descartó su MP4 porque el mapa aparecía incompleto.

Repetir: npm run build, npm test. Con npm run preview -- --host 127.0.0.1 --port 4173, ejecutar scripts/prepublish.browser-check.js mediante Playwright.
Optimización móvil: eliminados desenfoques acumulados en tarjetas y plantas; conservadas las salas. Retrato inicial visible sin espera y una sola descarga. Montserrat reducida de 384 KB a 66 KB, conservando los caracteres presentes en la web. Playwright verifica fuentes cargadas, ausencia de desbordamiento, cero recursos 3D al inicio y navegación a las plantas 1 y 2. Repetir con scripts/mobile-performance.browser-check.js sobre el preview.

Segunda optimización móvil: Lighthouse local 77/100, LCP 2,9 s, TBT 660 ms y CLS 0; las otras tres categorías siguen en 100. Informe: lighthouse-mobile-round2.json. Eliminados los filtros de fondo restantes en tarjetas móviles y los halos desenfocados del hero, logos de experiencia con carga lazy y retirado el backend HTTP de i18next (las traducciones ya están empaquetadas). Build, 11 pruebas y navegación móvil verificados. Para seguir: renderizar la portada en HTML y cargar las plantas al aproximarse, validando los destinos del ascensor y los enlaces directos antes de adoptarlo. El 100 no está alcanzado.
Modales móviles: los diálogos tienen aria-modal, bloquean el scroll del documento y ocultan temporalmente el ascensor inferior; el contenido del propio diálogo conserva su scroll. Build final compilado y servido por preview.
