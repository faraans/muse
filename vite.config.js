import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Set the limit to 1000 kB or higher
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      '/like': 'http://localhost:8000',
      '/unlike': 'http://localhost:8000',
      '/favorites': 'http://localhost:8000',
      '/favorite': 'http://localhost:8000',
      '/unfavorite': 'http://localhost:8000',
      '/profile': 'http://localhost:8000',
      '/refresh_token': 'http://localhost:8000',
    },
  },
});
