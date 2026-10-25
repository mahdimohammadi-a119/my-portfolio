import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// In development, the Vite dev server forwards API and uploads calls to the CMS server.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
})
