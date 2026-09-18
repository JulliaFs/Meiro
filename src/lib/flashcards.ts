import { todayIso } from "./utils";
import type { Flashcard } from "../types";

/** Cartão que precisa ser revisado hoje (nunca revisado, atrasado ou para hoje). */
export function estaVencido(card: Flashcard, hoje = todayIso()): boolean {
  return !card.proximaRevisao || card.proximaRevisao <= hoje;
}
