import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: true,
    port: 5176,
    strictPort: true,      // ← forces this port, won't jump to another
    allowedHosts: ['ervin-vaticinal-undimly.ngrok-free.dev']
  }
})