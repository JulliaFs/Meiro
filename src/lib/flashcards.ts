import { todayIso } from "./utils";
import type { Flashcard } from "../types";

/** Cartão que precisa ser revisado hoje (nunca revisado, atrasado ou para hoje). */
export function estaVencido(card: Flashcard, hoje = todayIso()): boolean {
  return !card.proximaRevisao || card.proximaRevisao <= hoje;
}

/** Opções de tamanho de sessão de revisão (0 = todos). */
export const TAMANHOS_SESSAO = [10, 20, 50, 0] as const;

/** Monta a fila de uma sessão: mais atrasados primeiro, limitada ao tamanho escolhido. */
export function montarFila(cards: Flashcard[], limite: number): Flashcard[] {
  const ordenados = [...cards].sort((a, b) => (a.proximaRevisao ?? "").localeCompare(b.proximaRevisao ?? ""));
  return limite > 0 ? ordenados.slice(0, limite) : ordenados;
}
