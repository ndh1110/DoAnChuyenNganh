import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'
import basicSsl from '@vitejs/plugin-basic-ssl' // <-- 1. IMPORT MỚI

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // <-- 2. THÊM PLUGIN NÀY
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
      ],
    },
  },
  server: {
    port: 5173, 
    https: true, // <-- 3. QUAN TRỌNG: BẬT HTTPS
    proxy: {
      '/api': {
        target: 'http://localhost:5000', 
        changeOrigin: true, 
        secure: false,      
      }
    }
  }
})