import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.indexOf("node_modules") === -1) return undefined;
          if (id.indexOf("@mui") >= 0) return "mui";
          if (id.indexOf("react") >= 0) return "react-vendor";
          if (id.indexOf("yaml") >= 0) return "i18n-vendor";
          return "vendor";
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
