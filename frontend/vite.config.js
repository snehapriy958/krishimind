// frontend/vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/predict": { target: "http://localhost:8000", changeOrigin: true },
      "/news":    { target: "http://localhost:8000", changeOrigin: true },
      "/weather": { target: "http://localhost:8000", changeOrigin: true },
      "/chat":    { target: "http://localhost:8000", changeOrigin: true },
      "/health":  { target: "http://localhost:8000", changeOrigin: true },
    },
  },
});