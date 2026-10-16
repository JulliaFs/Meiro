import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Estado guardado na URL (ex.: ?capitulo=<id>), como o Notion faz com páginas abertas:
 * recarregar mantém a janela aberta e o botão Voltar fecha.
 */
export function useParamUrl(nome: string): [string | null, (valor: string | null) => void] {
  const [params, setParams] = useSearchParams();
  const valor = params.get(nome);
  const setValor = useCallback(
    (novo: string | null) => {
      setParams(
        (atual) => {
          const p = new URLSearchParams(atual);
          if (novo) p.set(nome, novo);
          else p.delete(nome);
          return p;
        },
        { replace: !novo }
      );
    },
    [nome, setParams]
  );
  return [valor, setValor];
}
