import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/testlogin': { target: 'https://m-backend.dowinnsys.com', changeOrigin: true },
      '/test01': { target: 'https://m-backend.dowinnsys.com', changeOrigin: true },
      '/test02': { target: 'https://m-backend.dowinnsys.com', changeOrigin: true },
      '/test03': { target: 'https://m-backend.dowinnsys.com', changeOrigin: true },
      '/test04': { target: 'https://m-backend.dowinnsys.com', changeOrigin: true },
    }
  }
})