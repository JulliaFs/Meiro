import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Edição "ao vivo" de um registro: a tela usa uma cópia local (atualiza na hora)
 * e as mudanças vão para o banco agrupadas, depois de uma pausa na digitação.
 *
 * Antes cada tecla disparava um UPDATE e o campo só mudava quando o servidor
 * respondia: letras sumiam, o cursor pulava e, nos modais, nada parecia mudar.
 */
export function useAutoSave<T extends object>(
  inicial: T,
  salvar: (patch: Partial<T>) => Promise<void>,
  atrasoMs = 600
) {
  const [valor, setValor] = useState(inicial);
  const pendente = useRef<Partial<T>>({});
  const timer = useRef<number | undefined>(undefined);
  const salvarRef = useRef(salvar);

  useEffect(() => {
    salvarRef.current = salvar;
  }, [salvar]);

  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    const patch = pendente.current;
    if (Object.keys(patch).length === 0) return;
    pendente.current = {};
    // o erro já é mostrado na tela pelo service
    salvarRef.current(patch).catch(() => {});
  }, []);

  /** `imediato` para selects, botões e checkboxes; texto espera a pausa. */
  const alterar = useCallback(
    (patch: Partial<T>, imediato = false) => {
      setValor((v) => ({ ...v, ...patch }));
      pendente.current = { ...pendente.current, ...patch };
      window.clearTimeout(timer.current);
      if (imediato) flush();
      else timer.current = window.setTimeout(flush, atrasoMs);
    },
    [flush, atrasoMs]
  );

  // salva o que faltou ao fechar o modal/trocar de anotação ou sair da página
  useEffect(() => {
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [flush]);

  return [valor, alterar] as const;
}
