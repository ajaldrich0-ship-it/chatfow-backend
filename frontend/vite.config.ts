import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [
      "efficient-trust-production.up.railway.app",
      ".up.railway.app",
    ],
    proxy: {
      "/api": { target: "http://backend:8000", changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, "") },
      "/ws": { target: "ws://backend:8000", ws: true },
    },
  },
});
