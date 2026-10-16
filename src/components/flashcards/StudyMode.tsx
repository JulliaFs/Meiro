import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Modal } from "../ui/Modal";
import { flashcardService } from "../../services";
import { lerQuestao } from "../../lib/flashcards";
import { toIsoDate, todayIso } from "../../lib/utils";
import type { Dificuldade, Flashcard } from "../../types";

type Nota = "errei" | Dificuldade;

const BOTOES: { nota: Nota; label: string; classe: string }[] = [
  { nota: "errei", label: "Errei", classe: "bg-red-500/20 text-red-600 dark:text-red-300" },
  { nota: "dificil", label: "Difícil", classe: "bg-amber-500/20 text-amber-700 dark:text-amber-300" },
  { nota: "medio", label: "Bom", classe: "bg-sky-500/20 text-sky-700 dark:text-sky-300" },
  { nota: "facil", label: "Fácil", classe: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
];

export function StudyMode({ cards: cardsIniciais, onClose }: { cards: Flashcard[]; onClose: () => void }) {
  // A fila é fixada ao abrir: cada resposta atualiza o banco e a lista da página
  // é recarregada, o que antes mudava a ordem e fazia pular/repetir cartões.
  const [fila, setFila] = useState(cardsIniciais);
  const [idx, setIdx] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [acertos, setAcertos] = useState({ certo: 0, total: 0 });
  const card = fila[idx];
  const questao = card ? lerQuestao(card) : null;

  function responder(letra: string) {
    if (revelado || !questao) return;
    setEscolha(letra);
    setRevelado(true);
    setAcertos((a) => ({ certo: a.certo + (letra === questao.correta ? 1 : 0), total: a.total + 1 }));
  }

  async function marcar(nota: Nota) {
    if (salvando) return;
    // "Errei" zera o intervalo e o cartão volta no fim desta sessão (uma vez), como no Anki
    const ajuste = nota === "facil" ? 2.5 : nota === "medio" ? 1.5 : nota === "dificil" ? 1 : 0;
    const novoIntervalo = nota === "errei" ? 1 : Math.max(1, Math.round(card.intervaloDias * ajuste));
    const proxima = new Date();
    proxima.setDate(proxima.getDate() + (nota === "errei" ? 0 : novoIntervalo));
    setSalvando(true);
    try {
      await flashcardService.update(card.id, {
        dificuldade: nota === "errei" ? "dificil" : nota,
        intervaloDias: novoIntervalo,
        proximaRevisao: toIsoDate(proxima),
        ultimaRevisao: todayIso(),
        acertosSeguidos: nota === "errei" || nota === "dificil" ? 0 : card.acertosSeguidos + 1,
      });
    } catch {
      return; // erro já exibido; fica no mesmo cartão para tentar de novo
    } finally {
      setSalvando(false);
    }
    const novaFila = nota === "errei" && fila.indexOf(card) === fila.lastIndexOf(card) ? [...fila, card] : fila;
    setFila(novaFila);
    if (idx + 1 < novaFila.length) {
      setIdx(idx + 1);
      setRevelado(false);
      setEscolha(null);
    } else {
      onClose();
    }
  }

  // Atalhos: espaço/Enter revela; A–E responde a questão; 1–4 = errei, difícil, bom, fácil
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const tecla = e.key.toUpperCase();
      if (!revelado && questao?.alternativas.some((a) => a.letra === tecla)) {
        responder(tecla);
      } else if (!revelado && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setRevelado(true);
      } else if (revelado && ["1", "2", "3", "4"].includes(e.key)) {
        marcar(BOTOES[Number(e.key) - 1].nota);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!card) return null;

  const acertou = questao && escolha === questao.correta;
  // explicação = resposta sem a linha da alternativa correta
  const explicacao = questao ? card.resposta.split("\n").slice(1).join("\n").trim() : "";

  return (
    <Modal open onClose={onClose} title={`Revisão (${idx + 1}/${fila.length})`} wide>
      <div className="h-1 rounded-full bg-border overflow-hidden mb-3">
        <div className="h-full bg-brand transition-all" style={{ width: `${(idx / fila.length) * 100}%` }} />
      </div>
      <div className="flex justify-between text-xs text-text-muted mb-2">
        <span>{card.categoria}</span>
        {acertos.total > 0 && <span>{acertos.certo}/{acertos.total} questões certas</span>}
      </div>

      <div className="border border-border rounded-xl p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
        {questao ? (
          <>
            <p className="text-base sm:text-lg font-medium whitespace-pre-wrap">{questao.enunciado}</p>
            <div className="mt-4 space-y-2">
              {questao.alternativas.map((a) => {
                const certa = revelado && a.letra === questao.correta;
                const errada = revelado && a.letra === escolha && !certa;
                return (
                  <button
                    key={a.letra}
                    disabled={revelado}
                    onClick={() => responder(a.letra)}
                    className={`w-full text-left flex gap-3 items-start rounded-lg border p-3 text-sm sm:text-base transition-colors ${
                      certa
                        ? "border-emerald-500 bg-emerald-500/15"
                        : errada
                        ? "border-red-500 bg-red-500/15"
                        : revelado
                        ? "border-border opacity-60"
                        : "border-border hover:border-brand hover:bg-surface-2"
                    }`}
                  >
                    <span className="font-semibold shrink-0 w-5">{a.letra}</span>
                    <span className="flex-1">{a.texto}</span>
                    {certa && <Check size={18} className="text-emerald-500 shrink-0" />}
                    {errada && <X size={18} className="text-red-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {revelado && (
              <div className={`mt-4 rounded-lg p-3 text-sm sm:text-base ${acertou ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
                <p className="font-semibold">
                  {escolha ? (acertou ? "Certo!" : `Errado. A correta é a ${questao.correta}.`) : `Resposta: ${questao.correta}`}
                </p>
                {explicacao && <p className="mt-1 text-text whitespace-pre-wrap">{explicacao}</p>}
              </div>
            )}
          </>
        ) : (
          <>
            <p className={`text-base sm:text-lg font-medium whitespace-pre-wrap ${card.pergunta.length < 120 ? "text-center" : ""}`}>
              {card.pergunta}
            </p>
            {revelado && (
              <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 sm:p-4">
                <p className="text-base sm:text-lg text-text whitespace-pre-wrap">{card.resposta}</p>
              </div>
            )}
          </>
        )}
      </div>

      {!revelado ? (
        !questao && (
          <button className="btn btn-primary w-full justify-center mt-4" onClick={() => setRevelado(true)}>
            Revelar resposta <span className="hidden sm:inline text-xs opacity-70">(espaço)</span>
          </button>
        )
      ) : (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {BOTOES.map((b, i) => (
            <button
              key={b.nota}
              className={`btn justify-center font-semibold ${b.classe} ${questao && !acertou && b.nota === "errei" ? "ring-2 ring-red-500" : ""}`}
              disabled={salvando}
              onClick={() => marcar(b.nota)}
            >
              {b.label} <span className="hidden sm:inline text-xs opacity-70">{i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
