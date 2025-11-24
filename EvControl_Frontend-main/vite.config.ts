import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/gastos": "http://localhost:8080",
      "/financas": "http://localhost:8080",
      "/reservas": "http://localhost:8080",
    },
  },
});
