import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/whist-mate-free/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Whist Mate Free',
        short_name: 'WhistMate',
        description: 'Free offline Whist card scorer. Track bids & results; auto-score.',
        theme_color: '#0f172a',
        background_color: '#0b1220',
        display: 'standalone',
        start_url: '/whist-mate-free/',
        scope: '/whist-mate-free/',
        icons: [
          { src: '/whist-mate-free/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/whist-mate-free/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/whist-mate-free/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/whist-mate-free/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2,ttf}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})