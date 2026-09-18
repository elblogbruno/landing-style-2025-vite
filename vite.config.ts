import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite' 
import mkcert from 'vite-plugin-mkcert'
import { visualizer } from 'rollup-plugin-visualizer'  
import fs from 'node:fs'
import path from 'node:path'
import type { Connect, Plugin } from 'vite'

// Vite's SPA fallback answers "/projects/x/" with the app's index.html.
// Serve the static pages generated in public/ (or dist/ on preview) instead.
function staticDirectoryIndex(): Plugin {
  const rewrite = (baseDir: string): Connect.NextHandleFunction => (req, _res, next) => {
    const [pathname, query] = (req.url ?? '').split('?')
    if (pathname !== '/' && pathname.endsWith('/')) {
      const indexFile = path.join(baseDir, decodeURIComponent(pathname), 'index.html')
      if (fs.existsSync(indexFile)) {
        req.url = `${pathname}index.html${query ? `?${query}` : ''}`
      }
    }
    next()
  }
  return {
    name: 'static-directory-index',
    configureServer(server) {
      server.middlewares.use(rewrite(server.config.publicDir))
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite(path.resolve(server.config.root, server.config.build.outDir)))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mkcert(), 
    staticDirectoryIndex(),
    visualizer({
      filename: './stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  // base: '/new',
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kB (1MB)
    // modulePreload: true, // Habilitar module preload para JS
    cssCodeSplit: true, // Dividir CSS por chunk para evitar CSS no utilizado
    minify: 'terser', // Usar Terser para una mejor minificación
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        pure_funcs: ['console.log'], // Eliminar funciones puras como console.log
      },
    },
    reportCompressedSize: false, // Acelerar la construcción
    rollupOptions: {
      output: {
        format: 'es', // Formato de salida ES para compatibilidad con navegadores modernos
        manualChunks(id) {
          // Keep shared runtime helpers out of the optional 3D bundle.
          if (id.includes('commonjsHelpers') || id.includes('vite/preload-helper')) return 'vendor-react';
          if (!id.includes('node_modules/')) return;
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'vendor-react';
          if (/node_modules\/(three|@react-three|three-stdlib)\//.test(id)) return 'vendor-three';
          if (id.includes('node_modules/framer-motion/')) return 'vendor-ui';
          if (/node_modules\/(i18next[^/]*|react-i18next)\//.test(id)) return 'vendor-i18n';
        },

        // Generar nombres de archivos con hash para cache-busting óptimo
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  
  // Configuración para manejo de idiomas i18n con generación estática
  experimental: {
    renderBuiltUrl(filename) {
      return '/' + filename;
    }
  }
})