import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: true,
    proxy: {
      "/auth": "http://localhost:5000",
      "/products": "http://localhost:5000",
      "/customer": "http://localhost:5000",
      "/seller": "http://localhost:5000",
      "/admin": "http://localhost:5000",
    },
  },
  build: {
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
