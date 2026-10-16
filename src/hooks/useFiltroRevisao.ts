import { useEffect, useState } from "react";
import { FILTRO_PADRAO, type FiltroRevisao } from "../lib/flashcards";

const CHAVE = "meiro.filtroRevisao";

/** Filtro de revisão lembrado entre visitas (por navegador). */
export function useFiltroRevisao() {
  const [filtro, setFiltro] = useState<FiltroRevisao>(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      return salvo ? { ...FILTRO_PADRAO, ...JSON.parse(salvo) } : FILTRO_PADRAO;
    } catch {
      return FILTRO_PADRAO;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(filtro));
    } catch {
      // sem armazenamento: o filtro só não é lembrado
    }
  }, [filtro]);
  return [filtro, setFiltro] as const;
}
