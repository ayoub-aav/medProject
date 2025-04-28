import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import postcssConfig from '@tailwindcss/postcss'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        postcssConfig,
        // Add your other PostCSS plugins here if any
      ]
    }
  },
  server: {
    headers: {
      "Content-Security-Policy": `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data:;
        connect-src *;
        worker-src blob:;
        object-src 'none';
      `.replace(/\n/g, '') // compact single-line CSP
    }
  },
  build: {
    target: 'esnext' // Helps avoid some eval-related issues
  },
  optimizeDeps: {
    include: ['qr-scanner']
  }
})
