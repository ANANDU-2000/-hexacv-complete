import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    esbuild: {
        // Disable TypeScript errors during build
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
    server: {
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL || 'http://localhost:3001',
                changeOrigin: true
            }
        }
    },
    build: {
        // Production build optimizations
        minify: 'esbuild',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': ['lucide-react', '@radix-ui/react-slot'],
                    'pdf-vendor': ['pdfjs-dist', 'html2canvas', 'jspdf'],
                    'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
                }
            }
        },
        chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
        include: ['pdfjs-dist']
    }
})
