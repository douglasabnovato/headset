/*
 * vite.config.ts · Build do front, proxy da API em desenvolvimento
 * (mesma origem: cookies de sessão sem CORS) e testes com Vitest.
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const api = process.env.API_URL ?? "http://localhost:3333";

export default defineConfig({
  plugins: [react()],
  publicDir: "static",
  server: { port: 5173, proxy: { "/api": api, "/uploads": api } },
  preview: { port: 4173, proxy: { "/api": api, "/uploads": api } },
  build: { sourcemap: false, chunkSizeWarningLimit: 600 },
  test: { environment: "jsdom", include: ["src/**/*.test.{ts,tsx}"] },
});
/* fim de vite.config.ts */
