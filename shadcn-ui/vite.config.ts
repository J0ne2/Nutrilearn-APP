import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteSourceLocator } from "@metagptx/vite-plugin-source-locator";

export default defineConfig(({ mode }) => ({
  plugins: [
    viteSourceLocator({
      prefix: "mgx",
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable brotli compression size reporting to analyze bundle size
    brotliSize: true,

    // Minify with esbuild (default), can use terser for more options if needed
    minify: "esbuild",

    // Target modern browsers for smaller polyfill output
    target: "esnext",

    // Rollup options to split vendor code and optimize caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Bundle all dependencies into a separate chunk
            return "vendor";
          }
        },
      },
    },

    // Enable sourcemaps for production debugging (optional, disable if size is concern)
    sourcemap: false,
  },
}));
