/*
 * ToastContext.tsx · Avisos flutuantes acessíveis (role="status"/"alert")
 * para confirmar ações: item adicionado, erro de rede, pedido concluído.
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Tipo = "sucesso" | "erro" | "info";
type Aviso = { id: number; texto: string; tipo: Tipo };
const Ctx = createContext<(texto: string, tipo?: Tipo) => void>(() => {});

/* Provedor que desenha a pilha de avisos. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const avisar = useCallback((texto: string, tipo: Tipo = "sucesso") => {
    const id = Date.now() + Math.random();
    setAvisos((a) => [...a.slice(-2), { id, texto, tipo }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), tipo === "erro" ? 6000 : 3500);
  }, []);
  return (
    <Ctx.Provider value={avisar}>
      {children}
      <div className="avisos" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`aviso aviso--${a.tipo}`} role={a.tipo === "erro" ? "alert" : "status"}>
            <span aria-hidden="true">{a.tipo === "erro" ? "!" : a.tipo === "info" ? "i" : "✓"}</span>
            {a.texto}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

/* Hook para disparar avisos. */
export const useToast = () => useContext(Ctx);
/* fim de ToastContext.tsx */
