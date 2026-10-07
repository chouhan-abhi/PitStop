import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-query': [
            '@tanstack/react-query',
            '@tanstack/react-query-persist-client',
            '@tanstack/query-sync-storage-persister',
          ],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
