import { Check, ExternalLink, Heart } from "lucide-react";
import { escreverPassos, lerLink, lerPassos } from "../../lib/links";
import type { Capitulo } from "../../types";

/** Visão leve do capítulo: resumo curto, um micro-passo de cada vez e recursos. */
export function ModoFacil({
  capitulo,
  update,
}: {
  capitulo: Capitulo;
  update: (patch: Partial<Capitulo>, imediato?: boolean) => void;
}) {
  const passos = lerPassos(capitulo.principaisConceitos);
  const proximo = passos.findIndex((p) => !p.feito);
  const feitos = passos.filter((p) => p.feito).length;

  function alternar(i: number) {
    const novos = passos.map((p, j) => (j === i ? { ...p, feito: !p.feito } : p));
    const patch: Partial<Capitulo> = { principaisConceitos: escreverPassos(novos) };
    if (capitulo.status === "nao_iniciado") patch.status = "em_andamento";
    update(patch, true);
  }

  return (
    <div className="space-y-5">
      {capitulo.resumo && <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{capitulo.resumo}</p>}

      {passos.length > 0 && (
        <div>
          <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
            <Heart size={12} /> Passos de 10–15 min. Um de cada vez já conta.
          </p>
          <div className="space-y-2">
            {passos.map((p, i) => (
              <button
                key={i}
                onClick={() => alternar(i)}
                className={`w-full text-left flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${
                  i === proximo ? "border-brand bg-brand/5" : "border-border"
                } ${p.feito ? "opacity-60" : ""}`}
              >
                <span className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${p.feito ? "bg-brand border-brand text-white" : "border-border"}`}>
                  {p.feito && <Check size={14} />}
                </span>
                <span className={p.feito ? "line-through" : ""}>
                  {p.texto}
                  {i === proximo && <span className="block text-xs text-brand mt-0.5">Próximo passo</span>}
                </span>
              </button>
            ))}
          </div>
          {proximo === -1 ? (
            <div className="mt-3 rounded-lg bg-emerald-500/10 p-3 text-sm flex flex-wrap items-center gap-2 justify-between">
              <span>Todos os passos feitos. Que orgulho! 💜</span>
              {capitulo.status !== "concluido" && (
                <button className="btn btn-primary" onClick={() => update({ status: "concluido" }, true)}>Marcar capítulo como concluído</button>
              )}
            </div>
          ) : (
            feitos > 0 && <p className="text-xs text-text-muted mt-2">Bora seguir, você já fez {feitos}.</p>
          )}
        </div>
      )}

      {capitulo.links.length > 0 && (
        <div>
          <p className="text-xs text-text-muted mb-2">Para aprender (escolha só um)</p>
          <div className="space-y-1.5">
            {capitulo.links.map((l, i) => {
              const { nome, url } = lerLink(l);
              return (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-brand hover:underline">
                  <ExternalLink size={14} className="shrink-0" /> <span className="truncate">{nome}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {!capitulo.resumo && passos.length === 0 && capitulo.links.length === 0 && (
        <p className="text-sm text-text-muted">
          Ainda não há modo fácil para este capítulo. Na aba Aprendizado, escreva passos como "[ ] ler o resumo" e eles viram uma lista aqui.
        </p>
      )}
    </div>
  );
}
