import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5235', // typical .NET 8 https port
        changeOrigin: true,
        secure: false, // Useful for local dev with self-signed certs
      },
      '/downloads': {
        target: 'http://localhost:5235',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
