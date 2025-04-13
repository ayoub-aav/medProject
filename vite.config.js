import { defineConfig } from 'vite'
<<<<<<< HEAD
import postcssConfig from '@tailwindcss/postcss'

export default defineConfig({
  // Your other Vite configuration options...
=======
import react from '@vitejs/plugin-react'
import postcssConfig from '@tailwindcss/postcss'

export default defineConfig({
  plugins: [react()],
>>>>>>> 26e1b5685e5a8b761c26fd02d637b3289302c9df
  css: {
    postcss: {
      plugins: [
        postcssConfig,
<<<<<<< HEAD
        // Add your other PostCSS plugins here if any
      ]
    }
  },
  // Rest of your configuration...
=======
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
>>>>>>> 26e1b5685e5a8b761c26fd02d637b3289302c9df
})