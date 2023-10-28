import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {},
  server: {
    port: 3010
  },
  optimizeDeps: {
    include: ["@nlxchat/core", "@nlxchat/react", "@nlxchat/widget"]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /core/, /react/, /widget/]
    }
  }
});
