/*
 * AuthContext.tsx · Sessão do usuário. O token fica em cookie httpOnly;
 * o front só conhece os dados públicos devolvidos por /api/auth/me.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type Usuario } from "../api/client";

type AuthCtx = {
  user: Usuario | null;
  carregando: boolean;
  entrar: (email: string, password: string) => Promise<Usuario>;
  cadastrar: (name: string, email: string, password: string) => Promise<Usuario>;
  sair: () => Promise<void>;
};
const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);

/* Provedor que recupera a sessão ao abrir o site. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api<{ user: Usuario | null }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (email: string, password: string) => {
    const r = await api<{ user: Usuario }>("/auth/login", { method: "POST", json: { email, password } });
    setUser(r.user);
    return r.user;
  }, []);

  const cadastrar = useCallback(async (name: string, email: string, password: string) => {
    const r = await api<{ user: Usuario }>("/auth/register", { method: "POST", json: { name, email, password } });
    setUser(r.user);
    return r.user;
  }, []);

  const sair = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, carregando, entrar, cadastrar, sair }}>{children}</Ctx.Provider>;
}

/* Hook de acesso à sessão. */
export const useAuth = () => useContext(Ctx);
/* fim de AuthContext.tsx */
