import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Removed lovable-tagger import

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:8000', // Assuming backend runs on port 8000
        changeOrigin: true, // Recommended for virtual hosted sites
        // No rewrite needed, as the backend expects the /api prefix
      },
    },
  },
  plugins: [
    react(),
    // Removed componentTagger() usage
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
