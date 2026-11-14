import { useEffect, useState } from "react";
import { Compass, Loader2 } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";
import { HojeView } from "../components/estudio/HojeView";
import { GsView } from "../components/estudio/GsView";
import { CapitulosGrade, CapituloDetalhe } from "../components/estudio/CapitulosView";
import { useEstudio } from "../lib/estudio";
import { useParamUrl } from "../hooks/useParamUrl";
import { cls } from "../lib/utils";

const ABAS = [
  { id: "hoje", label: "Hoje" },
  { id: "gs", label: "Global Solution" },
  { id: "capitulos", label: "Capítulos" },
] as const;

function Contagem({ rotulo, em }: { rotulo: string; em: string }) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const ms = new Date(em).getTime() - agora;
  const dias = Math.floor(ms / 864e5);
  const horas = Math.floor((ms % 864e5) / 36e5);
  const cor = ms <= 0 ? "bg-surface-2 text-text-muted" : dias < 2 ? "bg-red-500/15 text-red-600 dark:text-red-400" : dias < 5 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-surface-2 text-text";
  return (
    <span className={cls("inline-flex items-baseline gap-1.5 rounded-full px-3 py-1 text-xs", cor)}>
      {rotulo} <b className="font-mono text-sm">{ms <= 0 ? "encerrado" : `${dias > 0 ? `${dias}d ` : ""}${horas}h`}</b>
    </span>
  );
}

/** Estúdio: estudo guiado da fase atual. Rota só para admin; o conteúdo vem da tabela `estudio` (RLS por usuário). */
export default function EstudioPage() {
  const { carregando, conteudo, progresso, atualizar } = useEstudio();
  const [aba, setAba] = useParamUrl("aba");

  const capAberto = aba?.startsWith("cap-") ? Number(aba.slice(4)) : null;
  const abaAtiva = capAberto ? "capitulos" : (ABAS.find((a) => a.id === aba)?.id ?? "hoje");

  function abrir(destino: string) {
    setAba(destino === "hoje" ? null : destino);
    window.scrollTo({ top: 0 });
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!conteudo || (!conteudo.plano && !conteudo.gs && conteudo.capitulos.length === 0)) {
    return (
      <EmptyState
        icon={<Compass size={24} />}
        title="Nenhum material no Estúdio ainda"
        description="O conteúdo do Estúdio é gravado direto na sua conta, na tabela estudio. Quando ele existir, aparece aqui."
      />
    );
  }

  const cap = capAberto ? conteudo.capitulos.find((c) => c.n === capAberto) : undefined;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="label-mono">Fase 7 · Integration</p>
          <h1 className="page-title">Estúdio</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {conteudo.plano?.prazos.map((p) => <Contagem key={p.rotulo} rotulo={p.rotulo} em={p.em} />)}
        </div>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto scrollbar-none">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => abrir(a.id)}
            className={cls(
              "px-3.5 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors",
              abaAtiva === a.id ? "border-brand text-text font-medium" : "border-transparent text-text-muted hover:text-text"
            )}
          >
            {a.label}
          </button>
        ))}
      </div>

      {abaAtiva === "hoje" && conteudo.plano && (
        <HojeView
          plano={conteudo.plano}
          progresso={progresso}
          abrir={abrir}
          alternarTarefa={(id) =>
            atualizar((p) => {
              const feita = !p.feitas[id];
              const capitulos = { ...p.capitulos };
              const m = /^c(\d+)$/.exec(id);
              if (m && feita) capitulos[m[1]] = { ...capitulos[m[1]], lido: true };
              return { ...p, feitas: { ...p.feitas, [id]: feita }, capitulos };
            })
          }
        />
      )}

      {abaAtiva === "gs" && conteudo.gs && (
        <GsView
          kit={conteudo.gs}
          progresso={progresso}
          alternar={(chave) => atualizar((p) => ({ ...p, gs: { ...p.gs, [chave]: !p.gs[chave] } }))}
          setIdeia={(texto) => atualizar((p) => ({ ...p, ideia: texto }))}
        />
      )}

      {abaAtiva === "capitulos" && !cap && (
        <CapitulosGrade capitulos={conteudo.capitulos} progresso={progresso} abrir={(n) => abrir(`cap-${n}`)} />
      )}

      {cap && (
        <CapituloDetalhe
          cap={cap}
          total={conteudo.capitulos.length}
          progresso={progresso}
          voltar={() => abrir("capitulos")}
          irPara={(n) => abrir(`cap-${n}`)}
          marcar={(n, campo, valor) =>
            atualizar((p) => ({
              ...p,
              capitulos: { ...p.capitulos, [n]: { ...p.capitulos[n], [campo]: valor } },
              feitas: campo === "lido" ? { ...p.feitas, [`c${n}`]: valor } : p.feitas,
            }))
          }
          registrarQuiz={(n, acertos, total) =>
            atualizar((p) => ({
              ...p,
              quizzes: { ...p.quizzes, [n]: { melhor: Math.max(acertos, p.quizzes[n]?.melhor ?? 0), total } },
            }))
          }
        />
      )}
    </div>
  );
}
