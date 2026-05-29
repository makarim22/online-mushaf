import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/',
    plugins: [react(), tailwindcss()],
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
