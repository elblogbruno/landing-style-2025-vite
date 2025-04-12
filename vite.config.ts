import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite' 
import mkcert from 'vite-plugin-mkcert'
import { visualizer } from 'rollup-plugin-visualizer'  

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mkcert(), 
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
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react/jsx-runtime'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-ui': ['framer-motion'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
          'vendor-utils': [],
          'components': [],
          'utils': []
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