import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    // PostCSS yapılandırması - Tailwind kullanmıyoruz
    postcss: {
      plugins: []
    }
  },
  server: {
    port: 3003,
    strictPort: false,
    host: '0.0.0.0',
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})

