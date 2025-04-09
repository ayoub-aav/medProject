import { defineConfig } from 'vite'
import postcssConfig from '@tailwindcss/postcss'

export default defineConfig({
  // Your other Vite configuration options...
  css: {
    postcss: {
      plugins: [
        postcssConfig,
        // Add your other PostCSS plugins here if any
      ]
    }
  },
  // Rest of your configuration...
})