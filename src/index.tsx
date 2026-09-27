/*
 * index.tsx · Ponto de entrada: estilos (Bootstrap + LESS) e montagem do React.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/main.less";
import App from "./App";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
/* fim de index.tsx */
