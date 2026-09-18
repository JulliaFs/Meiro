import { useState } from "react";
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

  if (!card) return null;

  return (
    <Modal open onClose={onClose} title={`Revisão (${idx + 1}/${cards.length})`} wide>
      <div className="border border-border rounded-xl p-8 text-center min-h-[160px] flex items-center justify-center">
        <p className="text-lg font-medium whitespace-pre-wrap">{revelado ? card.resposta : card.pergunta}</p>
      </div>
      {!revelado ? (
        <button className="btn btn-primary w-full justify-center mt-4" onClick={() => setRevelado(true)}>
          Revelar resposta
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button className="btn bg-red-500/15 text-red-600 justify-center" disabled={salvando} onClick={() => marcar("dificil")}>Difícil</button>
          <button className="btn bg-amber-500/15 text-amber-600 justify-center" disabled={salvando} onClick={() => marcar("medio")}>Médio</button>
          <button className="btn bg-emerald-500/15 text-emerald-600 justify-center" disabled={salvando} onClick={() => marcar("facil")}>Fácil</button>
        </div>
      )}
    </Modal>
  );
}
