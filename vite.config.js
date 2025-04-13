import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import postcssConfig from '@tailwindcss/postcss'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        postcssConfig,
        // Add other PostCSS plugins if needed
      ]
    }
  },
  server: {
    headers: {
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
    }
  },
  build: {
    target: 'esnext' // Helps avoid some eval-related issues
  },
  optimizeDeps: {
    include: ['qr-scanner']
  }
})