/*
 * usePersistedState.ts · useState que persiste no localStorage.
 * Tolera armazenamento bloqueado (modo privado) e JSON corrompido.
 */
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/* Estado com persistência por chave. */
function usePersistedState<T>(key: string, initialState: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const salvo = localStorage.getItem(key);
      return salvo ? (JSON.parse(salvo) as T) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* armazenamento indisponível: mantém só em memória */
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistedState;
/* fim de usePersistedState.ts */
