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

// ---------- Filtros: assunto, tipo e capítulo derivados da categoria ----------
// Ex.: "FIAP Fase 6 · Questões · Cap 3" → assunto "FIAP Fase 6", tipo "questao", cap 3.

export type TipoCartao = "cartao" | "questao";

export function assuntoDe(card: Flashcard): string {
  return (card.categoria || "Sem categoria").split(" · ")[0];
}

export function capituloDe(card: Flashcard): number | undefined {
  const m = /· Cap (\d+)/.exec(card.categoria ?? "");
  return m ? Number(m[1]) : undefined;
}

export interface Questao {
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  correta: string;
}

/** Lê uma questão de múltipla escolha no formato "enunciado\n\nA) ...\nB) ..." com resposta "C) ...". */
export function lerQuestao(card: Flashcard): Questao | null {
  const linhas = card.pergunta.split("\n");
  const alternativas = linhas
    .map((l) => /^([A-E])\) (.*)$/.exec(l.trim()))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({ letra: m[1], texto: m[2] }));
  const correta = /^([A-E])\)/.exec(card.resposta.trim())?.[1];
  if (alternativas.length < 2 || !correta) return null;
  const enunciado = linhas.filter((l) => !/^[A-E]\) /.test(l.trim())).join("\n").trim();
  return { enunciado, alternativas, correta };
}

export function tipoDe(card: Flashcard): TipoCartao {
  return lerQuestao(card) ? "questao" : "cartao";
}

export interface FiltroRevisao {
  assunto: string; // "todos" ou nome do assunto
  tipo: "todos" | TipoCartao;
  cap: number; // 0 = todos
}

export const FILTRO_PADRAO: FiltroRevisao = { assunto: "todos", tipo: "todos", cap: 0 };

export function aplicarFiltro(cards: Flashcard[], f: FiltroRevisao): Flashcard[] {
  return cards.filter(
    (c) =>
      (f.assunto === "todos" || assuntoDe(c) === f.assunto) &&
      (f.tipo === "todos" || tipoDe(c) === f.tipo) &&
      (f.cap === 0 || capituloDe(c) === f.cap)
  );
}
