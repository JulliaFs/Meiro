import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { cls, parseDate, todayIso } from "../../lib/utils";
import type { PlanoEstudio, ProgressoEstudio, TarefaPlano } from "../../lib/estudio";

const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function rotuloDia(iso: string) {
  const d = parseDate(iso);
  return `${DIAS_SEMANA[d.getDay()]} ${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

function Tarefa({ t, feita, alternar, abrir }: { t: TarefaPlano; feita: boolean; alternar: () => void; abrir: (aba: string) => void }) {
  const externo = t.link?.startsWith("http");
  return (
    <div className={cls("flex items-start gap-3 rounded-lg border border-border bg-surface p-3", feita && "opacity-60")}>
      <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--color-brand)]" checked={feita} onChange={alternar} id={`tarefa-${t.id}`} />
      <label htmlFor={`tarefa-${t.id}`} className="flex-1 min-w-0 cursor-pointer">
        <span className={cls("block text-sm font-medium", feita && "line-through")}>{t.titulo}</span>
        {t.texto && <span className="block text-xs text-text-muted mt-0.5">{t.texto}</span>}
      </label>
      {t.link && externo && (
        <a href={t.link} target="_blank" rel="noreferrer" className="text-xs text-brand flex items-center gap-1 shrink-0 mt-0.5">
          FIAP <ExternalLink size={12} />
        </a>
      )}
      {t.link === "revisoes" && (
        <Link to="/revisoes" className="text-xs text-brand flex items-center gap-1 shrink-0 mt-0.5">
          Revisões <ArrowRight size={12} />
        </Link>
      )}
      {t.link && !externo && t.link !== "revisoes" && (
        <button onClick={() => abrir(t.link!.replace(":", "-"))} className="text-xs text-brand flex items-center gap-1 shrink-0 mt-0.5">
          abrir <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

export function HojeView({
  plano,
  progresso,
  alternarTarefa,
  abrir,
}: {
  plano: PlanoEstudio;
  progresso: ProgressoEstudio;
  alternarTarefa: (id: string) => void;
  abrir: (aba: string) => void;
}) {
  const hoje = todayIso();
  const [diaAberto, setDiaAberto] = useState<string | null>(null);
  const todas = plano.dias.flatMap((d) => d.tarefas);
  const feitas = todas.filter((t) => progresso.feitas[t.id]).length;
  const diaHoje = plano.dias.find((d) => d.data === hoje);
  const antes = hoje < plano.dias[0].data;
  const depois = hoje > plano.dias[plano.dias.length - 1].data;
  const atrasadas = plano.dias.filter((d) => d.data < hoje).flatMap((d) => d.tarefas).filter((t) => !progresso.feitas[t.id]);
  const foco = diaHoje ?? (antes ? plano.dias[0] : undefined);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="label-mono">{rotuloDia(hoje)}{diaHoje ? ` · ${diaHoje.horas}` : ""}</p>
            <h2 className="section-title mt-1">
              {depois ? "A fase acabou" : foco ? foco.foco : "Dia livre no plano"}
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              {depois
                ? `${todas.length - feitas} tarefas ficaram sem marcar.`
                : antes
                  ? `O plano começa em ${rotuloDia(plano.dias[0].data)}.`
                  : foco && foco.tarefas.length
                    ? "Faça nesta ordem e marque cada uma quando terminar."
                    : "Use o dia para o que ficou atrasado."}
            </p>
          </div>
          <div className="w-full sm:w-56 space-y-1">
            <ProgressBar value={todas.length ? (feitas / todas.length) * 100 : 0} />
            <p className="text-xs text-text-muted text-right tabular-nums">{feitas} de {todas.length} tarefas</p>
          </div>
        </div>
      </Card>

      {atrasadas.length > 0 && (
        <div className="space-y-2">
          <p className="label-mono text-amber-600 dark:text-amber-400">Atrasadas</p>
          {atrasadas.map((t) => <Tarefa key={t.id} t={t} feita={false} alternar={() => alternarTarefa(t.id)} abrir={abrir} />)}
        </div>
      )}

      {foco && foco.tarefas.length > 0 && (
        <div className="space-y-2">
          <p className="label-mono">Hoje</p>
          {foco.tarefas.map((t) => <Tarefa key={t.id} t={t} feita={!!progresso.feitas[t.id]} alternar={() => alternarTarefa(t.id)} abrir={abrir} />)}
        </div>
      )}

      <div className="space-y-2">
        <p className="label-mono">Até o fim da fase</p>
        <p className="text-xs text-text-muted">Dias úteis têm menos tempo porque você trabalha; 20/11 é feriado. Toque num dia para ver as tarefas.</p>
        <div className="space-y-1.5">
          {plano.dias.map((d) => {
            const n = d.tarefas.length;
            const k = d.tarefas.filter((t) => progresso.feitas[t.id]).length;
            const aberto = diaAberto === d.data;
            return (
              <div key={d.data} className="space-y-1.5">
                <button
                  onClick={() => setDiaAberto(aberto ? null : d.data)}
                  className={cls(
                    "w-full grid grid-cols-[84px_1fr_auto] items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm",
                    d.data === hoje ? "border-brand bg-brand-light" : "border-border bg-surface",
                    d.data < hoje && "opacity-70"
                  )}
                  aria-expanded={aberto}
                >
                  <span className="font-mono text-xs">{rotuloDia(d.data)}</span>
                  <span className="truncate">{d.foco}</span>
                  <span className="font-mono text-xs text-text-muted">{n ? `${k}/${n} · ` : ""}{d.horas}</span>
                </button>
                {aberto && n > 0 && (
                  <div className="space-y-1.5 pl-3">
                    {d.tarefas.map((t) => <Tarefa key={t.id} t={t} feita={!!progresso.feitas[t.id]} alternar={() => alternarTarefa(t.id)} abrir={abrir} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
