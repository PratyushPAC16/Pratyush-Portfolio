import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Raise the warning threshold slightly (default 500kB)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Split vendor libraries into separate cacheable chunks
        manualChunks(id) {
          // framer-motion is large — its own chunk
          if (id.includes('framer-motion')) return 'framer-motion';
          // recharts + d3 deps — own chunk
          if (id.includes('recharts') || id.includes('d3-')) return 'charts';
          // react-markdown + its remark plugins
          if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype')) return 'markdown';
          // react core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
          // react-router
          if (id.includes('react-router')) return 'router';
          // everything else in node_modules → vendor
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },

    // sourcemap off in production (oxc minifier is the Vite 8 default)
    sourcemap: false,
  },

  // Pre-bundle heavy deps to speed up cold-start in dev
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
})
