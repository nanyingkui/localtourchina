import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {localVisualPreview} from "./scripts/local-visual-preview.mjs";

export default defineConfig({
  build: {
    copyPublicDir: false,
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(),localVisualPreview()],
});
