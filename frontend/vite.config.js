import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react({ jsxRuntime: "automatic", fastRefresh: true })],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    open: true,
    hmr: { protocol: "ws", host: "localhost", port: 5173 },
    watch: { usePolling: true },
  },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  optimizeDeps: { include: ["react", "react-dom", "react-router-dom", "jwt-decode"] },
  build: { outDir: "dist", sourcemap: true },
});
