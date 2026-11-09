/*
 * index.tsx · Ponto de entrada: estilos (Bootstrap + LESS) e montagem do React.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/bootstrap.scss";
import "./styles/main.less";
import App from "./App";
import { esperarDestaque } from "./lib/esperarDestaque";

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
/* fim de index.tsx */
