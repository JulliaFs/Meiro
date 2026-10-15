import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { flashcardService } from "../../services";
import { toIsoDate, todayIso } from "../../lib/utils";
import type { Dificuldade, Flashcard } from "../../types";

export function StudyMode({ cards: cardsIniciais, onClose }: { cards: Flashcard[]; onClose: () => void }) {
  // A fila é fixada ao abrir: cada resposta atualiza o banco e a lista da página
  // é recarregada, o que antes mudava a ordem e fazia pular/repetir cartões.
  const [cards] = useState(cardsIniciais);
  const [idx, setIdx] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const card = cards[idx];

  async function marcar(dif: Dificuldade) {
    if (salvando) return;
    const ajuste = dif === "facil" ? 2.5 : dif === "medio" ? 1.5 : 0.5;
    const novoIntervalo = Math.max(1, Math.round(card.intervaloDias * ajuste));
    const proxima = new Date();
    proxima.setDate(proxima.getDate() + novoIntervalo);
    setSalvando(true);
    try {
      await flashcardService.update(card.id, {
        dificuldade: dif,
        intervaloDias: novoIntervalo,
        proximaRevisao: toIsoDate(proxima),
        ultimaRevisao: todayIso(),
        acertosSeguidos: dif === "dificil" ? 0 : card.acertosSeguidos + 1,
      });
    } catch {
      return; // erro já exibido; fica no mesmo cartão para tentar de novo
    } finally {
      setSalvando(false);
    }
    if (idx + 1 < cards.length) {
      setIdx(idx + 1);
      setRevelado(false);
    } else {
      onClose();
    }
  }

  // Atalhos: espaço/Enter revela; 1, 2, 3 = difícil, médio, fácil
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!revelado && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setRevelado(true);
      } else if (revelado && ["1", "2", "3"].includes(e.key)) {
        marcar(e.key === "1" ? "dificil" : e.key === "2" ? "medio" : "facil");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!card) return null;

  // Texto longo ou com alternativas fica alinhado à esquerda para ler melhor
  const curto = (t: string) => t.length < 120 && !t.includes("\n");

  return (
    <Modal open onClose={onClose} title={`Revisão (${idx + 1}/${cards.length})`} wide>
      <div className="h-1 rounded-full bg-border overflow-hidden mb-4">
        <div className="h-full bg-brand transition-all" style={{ width: `${(idx / cards.length) * 100}%` }} />
      </div>
      {card.categoria && <p className="text-xs text-text-muted mb-2">{card.categoria}</p>}
      <div className="border border-border rounded-xl p-4 sm:p-6 min-h-[140px] max-h-[55vh] overflow-y-auto">
        <p className={`text-base sm:text-lg font-medium whitespace-pre-wrap ${curto(card.pergunta) ? "text-center" : "text-left"}`}>
          {card.pergunta}
        </p>
        {revelado && (
          <p className={`mt-4 pt-4 border-t border-border text-sm sm:text-base whitespace-pre-wrap text-emerald-600 ${curto(card.resposta) ? "text-center" : "text-left"}`}>
            {card.resposta}
          </p>
        )}
      </div>
      {!revelado ? (
        <button className="btn btn-primary w-full justify-center mt-4" onClick={() => setRevelado(true)}>
          Revelar resposta <span className="hidden sm:inline text-xs opacity-70">(espaço)</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button className="btn bg-red-500/15 text-red-600 justify-center" disabled={salvando} onClick={() => marcar("dificil")}>Difícil <span className="hidden sm:inline text-xs opacity-70">1</span></button>
          <button className="btn bg-amber-500/15 text-amber-600 justify-center" disabled={salvando} onClick={() => marcar("medio")}>Médio <span className="hidden sm:inline text-xs opacity-70">2</span></button>
          <button className="btn bg-emerald-500/15 text-emerald-600 justify-center" disabled={salvando} onClick={() => marcar("facil")}>Fácil <span className="hidden sm:inline text-xs opacity-70">3</span></button>
        </div>
      )}
    </Modal>
  );
}
