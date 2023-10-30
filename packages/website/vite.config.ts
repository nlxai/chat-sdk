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
    include: ["@nlx/chat-core", "@nlx/chat-react", "@nlx/chat-widget"]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /chat-core/, /chat-react/, /chat-widget/]
    }
  }
});
