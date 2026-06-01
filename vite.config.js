import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'mushaf/*.json'],
        manifest: {
          name: 'Online Mushaf & Hifdz',
          short_name: 'Mushaf',
          description: 'Aplikasi Al-Quran dan Tracker Hafalan Harian',
          theme_color: '#064e3b',
          background_color: '#fdfaf4',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    server: {
      proxy: {
        '/api/sunnah': {
          target: 'https://api.sunnah.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/sunnah/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.VITE_SUNNAH_API_KEY) {
                proxyReq.setHeader('X-API-Key', env.VITE_SUNNAH_API_KEY)
              }
            })
          }
        }
      }
    }
  }
})
