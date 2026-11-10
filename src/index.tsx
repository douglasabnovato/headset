/*
 * index.tsx · Ponto de entrada: estilos (Bootstrap + LESS) e montagem do React.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/bootstrap.scss";
import "./styles/main.less";
import App from "./App";
import { esperarDestaque } from "./lib/esperarDestaque";
import { iniciarMedicao } from "./lib/medicao";

/* O React só troca o esqueleto depois que a imagem do destaque pinta (até 2,5 s) (#15). */
esperarDestaque()
  .catch(() => "erro")
  .then(() =>
    createRoot(document.getElementById("root") as HTMLElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  );

/* Medição de uso só no build de produção e fora de testes automatizados (D5). */
iniciarMedicao(document, { producao: import.meta.env.PROD, automatizado: navigator.webdriver });
/* fim de index.tsx */
