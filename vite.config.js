import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    base: '/whist-mate-free/',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            includeAssets: [
                'favicon.ico',
                'robots.txt',
                'icons/icon-192.png',
                'icons/icon-512.png'
            ],
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
                    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
                    { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
                ]
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
});
