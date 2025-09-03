import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Add any external dependencies if needed
    }
  },
  resolve: {
    alias: {
      // Add path aliases if you're using them
    }
  }
})
