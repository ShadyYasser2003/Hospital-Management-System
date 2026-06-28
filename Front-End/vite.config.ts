import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // sockjs-client uses CommonJS `global` — polyfill it for the browser
  define: {
    global: "globalThis",
  },
  server: {
    host: "::",
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      // All requests to /chatbot-api/* are forwarded to the AWS chatbot server.
      // The browser only ever talks to localhost, so CORS is never triggered.
      "/chatbot-api": {
        target: "http://35.172.118.64:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chatbot-api/, ""),
      },
      // WebSocket proxy — forward /ws/* to Spring Boot backend
      "/ws": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
      },
      // API proxy — forward /api/* to Spring Boot backend
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
