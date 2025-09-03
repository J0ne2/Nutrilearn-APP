import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration
export default defineConfig({
  plugins: [react()],
  root: '.', // root is the project folder (index.html is here)
  build: {
    outDir: 'dist',     // where the production build goes
    emptyOutDir: true,  // clean before build
  },
  resolve: {
    alias: {
      '@': '/src', // now you can import with "@/..." instead of long paths
    },
  },
  server: {
    port: 5173,  // dev server port
    open: true,  // auto-open in browser on dev
  },
})
