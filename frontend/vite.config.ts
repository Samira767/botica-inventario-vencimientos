import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // En desarrollo el navegador llama a /api en este mismo origen y Vite lo reenvía
    // al backend: así no hace falta CORS ni escribir la URL del backend en el código.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
