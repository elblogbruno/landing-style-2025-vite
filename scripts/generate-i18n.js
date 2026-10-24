// Script para generar la estructura de carpetas i18n después de la construcción
import fs from 'fs';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { metadataByLang } from './i18n-metadata.js';


// Obtener el directorio actual con ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const LANGS = ['es', 'en']; // Idiomas soportados
const DEFAULT_LANG = 'es';   // Idioma predeterminado (español)

// Comprobar si el directorio dist existe
if (!fs.existsSync(DIST_DIR)) {
  console.error('⛔ Error: El directorio "dist" no existe. Ejecuta "npm run build" primero.');
  process.exit(1);
}

// Función para actualizar los metadatos HTML según el idioma
function updateMetadata(html, lang) {
  const metadata = metadataByLang[lang];
  if (!metadata) {
    console.warn(`⚠️ No hay metadatos definidos para el idioma: ${lang}`);
    return html;
  }

  console.log(`🔄 Actualizando metadatos para idioma: ${lang}`);

  // Reemplazar los metadatos en el HTML
  let updatedHtml = html;

  // Actualizar el atributo lang del HTML
  updatedHtml = updatedHtml.replace(/<html lang="[^"]*"/, `<html lang="${metadata.language}"`);

  // Actualizar el título de la página
  updatedHtml = updatedHtml.replace(/<title>.*?<\/title>/, `<title>${metadata.title}</title>`);

  // Actualizar la descripción
  updatedHtml = updatedHtml.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${metadata.description}"`
  );

  // Actualizar meta language
  updatedHtml = updatedHtml.replace(
    /<meta name="language" content="[^"]*"/,
    `<meta name="language" content="${metadata.language}"`
  );

  // Actualizar meta OG title
  updatedHtml = updatedHtml.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${metadata.ogTitle}"`
  );

  // Actualizar meta OG description
  updatedHtml = updatedHtml.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${metadata.ogDescription}"`
  );

  // Actualizar meta OG locale
  updatedHtml = updatedHtml.replace(
    /<meta property="og:locale" content="[^"]*"/,
    `<meta property="og:locale" content="${metadata.ogLocale}"`
  );

  // Actualizar meta Twitter title
  updatedHtml = updatedHtml.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${metadata.twitterTitle}"`
  );

  // Actualizar meta Twitter description
  updatedHtml = updatedHtml.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${metadata.twitterDescription}"`
  );

  // Actualizar meta keywords
  updatedHtml = updatedHtml.replace(
    /<meta name="keywords" content="[^"]*"/,
    `<meta name="keywords" content="${metadata.keywords}"`
  );

  const canonical = 'https://brunomoya.com/' + (lang === 'en' ? 'en/' : '');
  updatedHtml = updatedHtml.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${canonical}"`);
  updatedHtml = updatedHtml.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${canonical}"`);
  updatedHtml = updatedHtml.replace(/(<link rel="alternate" type="text\/markdown" href=")[^"]*/, `$1${canonical}index.md`);
  return updatedHtml;
}

async function createI18nDirs() {
  console.log('🌐 Creando estructura de directorios para multilenguaje...');

  const server = await createServer({
    configFile: false,
    mode: 'production',
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true },
    appType: 'custom',
    esbuild: { jsx: 'automatic' },
  });
  try {
  const { render } = await server.ssrLoadModule('/src/prerender.tsx');
  const prerender = async (html, lang) => html.replace('<div id="root"></div>',
    '<div id="root" data-language="' + lang + '">' + await render(lang) + '</div>');

  // Leer el archivo index.html original
  const indexPath = path.join(DIST_DIR, 'index.html');
  const originalHtml = fs.readFileSync(indexPath, 'utf-8');

  // Actualizar el archivo index.html para el idioma predeterminado
  const defaultLangHtml = await prerender(updateMetadata(originalHtml, DEFAULT_LANG), DEFAULT_LANG);
  fs.writeFileSync(indexPath, defaultLangHtml);
  console.log(`✅ Actualizados metadatos del idioma predeterminado (${DEFAULT_LANG}) en index.html`);

  // Crear carpetas para cada idioma
  for (const lang of LANGS) {
    if (lang !== DEFAULT_LANG) { // No necesitamos crear carpeta para el idioma predeterminado (español)
      const langDir = path.join(DIST_DIR, lang);
      
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir);
        console.log(`✅ Carpeta creada: ${lang}`);
      }
      
      // Generar index.html para este idioma con metadatos actualizados
      const langHtml = await prerender(updateMetadata(originalHtml, lang), lang);
      const indexDest = path.join(langDir, 'index.html');
      
      fs.writeFileSync(indexDest, langHtml);
      console.log(`📄 Creado ${lang}/index.html con metadatos traducidos`);
      
      // Assets use absolute URLs and are shared by both languages.

    }
  }

  fs.copyFileSync(path.resolve(__dirname, '../.htaccess'), path.join(DIST_DIR, '.htaccess'));
  } finally { await server.close(); }
  console.log('✨ Estructura multilenguaje creada con éxito');
}

// Ejecutar la función principal
createI18nDirs().catch(err => {
  console.error('❌ Error al crear la estructura de idiomas:', err);
  process.exit(1);
});