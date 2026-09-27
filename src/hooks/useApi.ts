/*
 * useApi.ts · Busca dados da API com estados de carregando/erro e recarga.
 */
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../api/client";

/* Executa GET no caminho e refaz quando ele muda. */
export function useApi<T>(caminho: string | null) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<ApiError | null>(null);
  const [carregando, setCarregando] = useState(!!caminho);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    if (!caminho) return;
    let ativo = true;
    setCarregando(true);
    setErro(null);
    api<T>(caminho)
      .then((d) => ativo && setDados(d))
      .catch((e) => ativo && setErro(e instanceof ApiError ? e : new ApiError(0, "Erro inesperado.")))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [caminho, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  return { dados, erro, carregando, recarregar };
}
/* fim de useApi.ts */
