import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Painel administrativo. Roda em http://localhost:5174 (porta diferente do app cliente).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
