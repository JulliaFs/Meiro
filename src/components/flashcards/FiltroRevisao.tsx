import { useEffect, useMemo } from "react";
import { assuntoDe, capituloDe, FILTRO_PADRAO, type FiltroRevisao } from "../../lib/flashcards";
import type { Flashcard } from "../../types";

export function FiltroRevisaoBar({
  cards,
  pendentes,
  filtro,
  onChange,
}: {
  cards: Flashcard[];
  pendentes: Flashcard[];
  filtro: FiltroRevisao;
  onChange: (f: FiltroRevisao) => void;
}) {
  const assuntos = useMemo(() => {
    const contagem = new Map<string, number>();
    cards.forEach((c) => contagem.set(assuntoDe(c), contagem.get(assuntoDe(c)) ?? 0));
    pendentes.forEach((c) => contagem.set(assuntoDe(c), (contagem.get(assuntoDe(c)) ?? 0) + 1));
    return [...contagem.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR", { numeric: true }));
  }, [cards, pendentes]);

  const caps = useMemo(() => {
    const doAssunto = cards.filter((c) => filtro.assunto === "todos" || assuntoDe(c) === filtro.assunto);
    return [...new Set(doAssunto.map(capituloDe).filter((n): n is number => n !== undefined))].sort((a, b) => a - b);
  }, [cards, filtro.assunto]);

  // assunto salvo que não existe mais volta para "todos"
  useEffect(() => {
    if (filtro.assunto !== "todos" && cards.length > 0 && !assuntos.some(([a]) => a === filtro.assunto)) {
      onChange(FILTRO_PADRAO);
    }
  }, [assuntos, cards.length, filtro.assunto, onChange]);

  const chip = (ativo: boolean) =>
    `px-3 py-1.5 rounded-full text-sm border transition-colors ${
      ativo ? "bg-brand text-white border-brand" : "border-border text-text-muted hover:text-text"
    }`;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button className={chip(filtro.assunto === "todos")} onClick={() => onChange({ ...filtro, assunto: "todos", cap: 0 })}>
          Todos <span className="opacity-70">{pendentes.length}</span>
        </button>
        {assuntos.map(([a, n]) => (
          <button key={a} className={chip(filtro.assunto === a)} onClick={() => onChange({ ...filtro, assunto: a, cap: 0 })}>
            {a} <span className="opacity-70">{n}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="text-text-muted text-xs">Tipo</span>
          <select className="input mt-1" value={filtro.tipo} onChange={(e) => onChange({ ...filtro, tipo: e.target.value as FiltroRevisao["tipo"] })}>
            <option value="todos">Tudo</option>
            <option value="cartao">Cartões</option>
            <option value="questao">Questões (A–D)</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-text-muted text-xs">Capítulo</span>
          <select className="input mt-1" value={filtro.cap} disabled={caps.length === 0} onChange={(e) => onChange({ ...filtro, cap: Number(e.target.value) })}>
            <option value={0}>Todos</option>
            {caps.map((c) => <option key={c} value={c}>Cap {c}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
