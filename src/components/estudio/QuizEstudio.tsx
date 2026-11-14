import { useState } from "react";
import { cls } from "../../lib/utils";
import type { QuestaoEstudio } from "../../lib/estudio";

/** Quiz de treino no estilo do fast test. Avisa o resultado quando todas as perguntas foram respondidas. */
export function QuizEstudio({ questoes, onTerminar }: { questoes: QuestaoEstudio[]; onTerminar?: (acertos: number, total: number) => void }) {
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const respondidas = Object.keys(respostas).length;
  const acertos = questoes.filter((q, i) => respostas[i] === q.a).length;

  function responder(qi: number, oi: number) {
    if (respostas[qi] !== undefined) return;
    const novas = { ...respostas, [qi]: oi };
    setRespostas(novas);
    if (Object.keys(novas).length === questoes.length) {
      onTerminar?.(questoes.filter((q, i) => novas[i] === q.a).length, questoes.length);
    }
  }

  return (
    <div className="space-y-5">
      {questoes.map((q, qi) => {
        const escolhida = respostas[qi];
        const respondida = escolhida !== undefined;
        return (
          <div key={qi} className="space-y-2">
            <p className="text-sm font-medium">{qi + 1}. {q.q}</p>
            <div className="space-y-1.5">
              {q.opts.map((o, oi) => (
                <button
                  key={oi}
                  disabled={respondida}
                  onClick={() => responder(qi, oi)}
                  className={cls(
                    "w-full text-left text-sm rounded-lg border px-3 py-2 transition-colors",
                    !respondida && "border-border hover:border-brand",
                    respondida && oi === q.a && "border-emerald-500 bg-emerald-500/10",
                    respondida && oi === escolhida && oi !== q.a && "border-red-500 bg-red-500/10",
                    respondida && oi !== q.a && oi !== escolhida && "border-border opacity-60"
                  )}
                >
                  {String.fromCharCode(97 + oi)}) {o}
                </button>
              ))}
            </div>
            {respondida && q.why && <p className="text-xs text-text-muted bg-surface-2 rounded-lg px-3 py-2">{q.why}</p>}
          </div>
        );
      })}
      {respondidas === questoes.length && (
        <div className="flex items-center justify-between gap-3 flex-wrap rounded-lg bg-brand-light px-3 py-2 text-sm">
          <span>
            <b>{acertos} de {questoes.length}</b> certas. {acertos === questoes.length ? "Pode ir para o fast test." : "Releia o essencial e tente de novo."}
          </span>
          <button className="btn btn-secondary" onClick={() => setRespostas({})}>Refazer</button>
        </div>
      )}
    </div>
  );
}
