/* Teste de ponta a ponta: sobe a API com banco em memória e o front já compilado, sem serviço externo */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:4173", locale: "pt-BR" },
  webServer: [
    {
      command: "npm start -w server",
      url: "http://localhost:3333/api/health",
      env: { DATABASE_URL: ":memory:", PORT: "3333" },
      timeout: 90_000,
    },
    { command: "npm run preview", url: "http://localhost:4173", timeout: 60_000 },
  ],
});
/* fim de playwright.config.ts */
