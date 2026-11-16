/* Teste de ponta a ponta: sobe a API com banco em memória e o front já compilado, sem serviço externo */
import { defineConfig } from "@playwright/test";

/* Portas trocáveis por variável: vários projetos na mesma máquina não disputam a 3333 e a 4173 */
const portaApi = process.env.E2E_API_PORT ?? "3333";
const portaWeb = process.env.E2E_WEB_PORT ?? "4173";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  use: { baseURL: `http://localhost:${portaWeb}`, locale: "pt-BR" },
  webServer: [
    {
      command: "npm start -w server",
      url: `http://localhost:${portaApi}/api/health`,
      env: { DATABASE_URL: ":memory:", PORT: portaApi },
      timeout: 90_000,
    },
    {
      command: `npm run preview -- --port ${portaWeb} --strictPort`,
      url: `http://localhost:${portaWeb}`,
      env: { API_URL: `http://localhost:${portaApi}` },
      timeout: 60_000,
    },
  ],
});
/* fim de playwright.config.ts */
