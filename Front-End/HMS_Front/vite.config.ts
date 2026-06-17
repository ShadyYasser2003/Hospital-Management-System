import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // All requests to /chatbot-api/* are forwarded to the AWS chatbot server.
      // The browser only ever talks to localhost, so CORS is never triggered.
      "/chatbot-api": {
        target: "http://54.163.18.81:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chatbot-api/, ""),
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
