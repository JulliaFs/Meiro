import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowUpRight, NotebookPen, ArrowLeft, ChevronRight } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { FilterPopover } from "../components/common/FilterPopover";
import { useAnotacoes, useAreas, useAnos, useFases, useCapitulos, useFase } from "../hooks/useLiveData";
import { useAutoSave } from "../hooks/useAutoSave";
import { anotacaoService } from "../services";
import { textoPlano } from "../lib/anotacaoConteudo";
import { useUiStore } from "../store/useUiStore";
import { cls, confirmar, formatDate, toIsoDate } from "../lib/utils";
import type { Anotacao, AreaConhecimento } from "../types";

// chips sem repetição (área, pasta e tag costumam ter o mesmo texto)
function chipsUnicos(valores: (string | undefined)[]): string[] {
  const vistos = new Set<string>();
  return valores.filter((v): v is string => {
    const k = v?.trim().toLowerCase();
    if (!k || vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

// nota sem conteúdo próprio (vazia ou só o texto do modelo antigo)
function notaVazia(conteudo: string): boolean {
  const t = textoPlano(conteudo);
  return !t || (t.includes("Escreva aqui em markdown") && t.length < 120);
}

// o editor de blocos é pesado: só carrega quando uma anotação é aberta
const EditorBlocos = lazy(() => import("../components/anotacoes/EditorBlocos"));

function BacklinkButton({ anotacao }: { anotacao: Anotacao }) {
  const navigate = useNavigate();
  const fase = useFase(anotacao.faseId);

  if (anotacao.origemTipo === "capitulo" && fase) {
    return (
      <button className="btn btn-secondary" onClick={() => navigate(`/faculdade/${fase.anoId}/${fase.id}`)}>
        <ArrowUpRight size={14} /> Ir para capítulo
      </button>
    );
  }
  if (anotacao.origemTipo === "aula" && anotacao.cursoId) {
    return (
      <button className="btn btn-secondary" onClick={() => navigate(`/cursos/${anotacao.cursoId}`)}>
        <ArrowUpRight size={14} /> Ir para aula
      </button>
    );
  }
  return null;
}

/**
 * O editor trabalha numa cópia local (via useAutoSave) e salva depois de uma
 * pausa na digitação. Antes cada tecla ia direto para o banco e o texto só
 * aparecia quando o servidor respondia — letras sumiam e o cursor pulava.
 */
function AnotacaoEditor({
  anotacao,
  areas,
  onVoltar,
  onExcluir,
}: {
  anotacao: Anotacao;
  areas: AreaConhecimento[] | undefined;
  onVoltar: () => void;
  onExcluir: () => void;
}) {
  const [atual, update] = useAutoSave(anotacao, (patch) => anotacaoService.update(anotacao.id, patch));
  // texto cru das tags, para a vírgula não sumir enquanto se digita
  const [tagsTexto, setTagsTexto] = useState(anotacao.tags.join(", "));
  const [propsAbertas, setPropsAbertas] = useState(false);

  return (
    <>
      {/* barra de ações discreta */}
      <div className="flex items-center gap-2 mb-2">
        <button className="btn btn-secondary sm:hidden" onClick={onVoltar} aria-label="Voltar"><ArrowLeft size={14} /></button>
        <span className="text-2xs text-text-muted truncate flex-1">Editada em {formatDate(anotacao.updatedAt)}</span>
        <BacklinkButton anotacao={atual} />
        <button className="btn btn-secondary text-red-500" onClick={onExcluir} aria-label="Excluir anotação">
          <Trash2 size={14} />
        </button>
      </div>

      {/* título grande, como no Notion */}
      <input
        className="w-full bg-transparent border-0 outline-none text-2xl sm:text-3xl font-bold text-text placeholder:text-text-muted/50 mb-1"
        placeholder="Sem título"
        value={atual.titulo}
        onChange={(e) => update({ titulo: e.target.value })}
      />

      {/* propriedades recolhíveis: fechadas mostram só os chips */}
      <div className="mb-3">
        <button className="flex items-center gap-1.5 flex-wrap text-xs text-text-muted hover:text-text py-1" onClick={() => setPropsAbertas(!propsAbertas)} aria-expanded={propsAbertas}>
          <ChevronRight size={14} className={cls("transition-transform", propsAbertas && "rotate-90")} />
          <span>Propriedades</span>
          {!propsAbertas && (
            <>
              {chipsUnicos([atual.origemLabel, atual.area, atual.pasta, ...atual.tags]).map((t) => <Badge key={t}>{t}</Badge>)}
              {chipsUnicos(atual.skills ?? []).map((sk) => <Badge key={sk} className="bg-brand-light text-brand">{sk}</Badge>)}
            </>
          )}
        </button>
        {propsAbertas && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pl-5">
            {atual.origemLabel && <p className="text-xs text-text-muted sm:col-span-3">Origem: {atual.origemLabel} · Criada em {formatDate(atual.createdAt)}</p>}
            <select className="input" value={atual.area ?? ""} onChange={(e) => update({ area: e.target.value }, true)}>
              <option value="">Sem área</option>
              {areas?.map((ar) => <option key={ar.id} value={ar.nome}>{ar.nome}</option>)}
            </select>
            <input className="input" placeholder="Pasta" value={atual.pasta ?? ""} onChange={(e) => update({ pasta: e.target.value })} />
            <input
              className="input"
              placeholder="Tags (vírgula)"
              value={tagsTexto}
              onChange={(e) => {
                setTagsTexto(e.target.value);
                update({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) });
              }}
            />
          </div>
        )}
      </div>
      <p className="text-2xs text-text-muted mb-1 hidden sm:block">Digite "/" para blocos (títulos, listas, toggle, código). Cole ou arraste imagens.</p>
      <Suspense fallback={<p className="text-sm text-text-muted animate-pulse">Abrindo editor…</p>}>
        <EditorBlocos conteudo={anotacao.conteudo} onChange={(json) => update({ conteudo: json })} />
      </Suspense>
    </>
  );
}

export default function AnotacoesPage() {
  const anotacoes = useAnotacoes();
  const areas = useAreas();
  const anos = useAnos();
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroAno, setFiltroAno] = useState("");
  const [filtroFase, setFiltroFase] = useState("");
  const [filtroCapitulo, setFiltroCapitulo] = useState("");
  const [filtroSkill, setFiltroSkill] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const fasesDoAno = useFases(filtroAno || undefined);
  const capitulosFiltro = useCapitulos(filtroFase || undefined);

  const skillsDisponiveis = useMemo(
    () => Array.from(new Set((anotacoes ?? []).flatMap((a) => a.skills ?? []))),
    [anotacoes]
  );

  const filtradas = useMemo(() => {
    const q = busca.toLowerCase();
    // anotações antigas não gravavam o ano; cai para "a fase pertence ao ano"
    const fasesIds = new Set((fasesDoAno ?? []).map((f) => f.id));
    return (anotacoes ?? []).filter((a) => {
      if (q && !a.titulo.toLowerCase().includes(q) && !a.tags.some((t) => t.toLowerCase().includes(q)) && !textoPlano(a.conteudo).toLowerCase().includes(q)) return false;
      if (filtroAno && a.anoId !== filtroAno && !(a.faseId && fasesIds.has(a.faseId))) return false;
      if (filtroFase && a.faseId !== filtroFase) return false;
      if (filtroCapitulo && a.origemId !== filtroCapitulo) return false;
      if (filtroSkill && !(a.skills ?? []).includes(filtroSkill)) return false;
      if (filtroData && toIsoDate(new Date(a.createdAt)) !== filtroData) return false;
      return true;
    }).sort((x, y) => y.updatedAt.localeCompare(x.updatedAt));
  }, [anotacoes, busca, fasesDoAno, filtroAno, filtroFase, filtroCapitulo, filtroSkill, filtroData]);

  const atual = anotacoes?.find((a) => a.id === selecionada);

  const nova = useCallback(async () => {
    try {
      const a = await anotacaoService.create({
        titulo: "Nova anotação",
        conteudo: "",
        tags: [],
      });
      setSelecionada(a.id);
    } catch {
      // erro já exibido
    }
  }, []);

  function excluir(a: Anotacao) {
    if (!confirmar(`Excluir a anotação "${a.titulo}"?`)) return;
    setSelecionada(null);
    anotacaoService.remove(a.id).catch(() => {});
  }

  const pendingAction = useUiStore((s) => s.pendingAction);
  const setPendingAction = useUiStore((s) => s.setPendingAction);
  useEffect(() => {
    if (pendingAction === "nova-anotacao") {
      setPendingAction(null);
      nova();
    }
  }, [pendingAction, setPendingAction, nova]);

  const filtrosAtivos = [filtroAno, filtroFase, filtroCapitulo, filtroSkill, filtroData].filter(Boolean).length;

  function limparFiltros() {
    setFiltroAno("");
    setFiltroFase("");
    setFiltroCapitulo("");
    setFiltroSkill("");
    setFiltroData("");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-title">Anotações</h1>
        <FilterPopover activeCount={filtrosAtivos} onClear={limparFiltros}>
          <label className="text-xs text-text-muted block">
            Ano
            <select className="input mt-1" value={filtroAno} onChange={(e) => { setFiltroAno(e.target.value); setFiltroFase(""); setFiltroCapitulo(""); }}>
              <option value="">Todos os anos</option>
              {anos?.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </label>
          <label className="text-xs text-text-muted block">
            Fase
            <select className="input mt-1" value={filtroFase} onChange={(e) => { setFiltroFase(e.target.value); setFiltroCapitulo(""); }} disabled={!filtroAno}>
              <option value="">Todas as fases</option>
              {fasesDoAno?.map((f) => <option key={f.id} value={f.id}>Fase {f.numero}</option>)}
            </select>
          </label>
          <label className="text-xs text-text-muted block">
            Capítulo
            <select className="input mt-1" value={filtroCapitulo} onChange={(e) => setFiltroCapitulo(e.target.value)} disabled={!filtroFase}>
              <option value="">Todos os capítulos</option>
              {capitulosFiltro?.map((c) => <option key={c.id} value={c.id}>Cap. {c.numero} · {c.nome}</option>)}
            </select>
          </label>
          <label className="text-xs text-text-muted block">
            Skill
            <select className="input mt-1" value={filtroSkill} onChange={(e) => setFiltroSkill(e.target.value)}>
              <option value="">Todas as skills</option>
              {skillsDisponiveis.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs text-text-muted block">
            Data
            <input type="date" className="input mt-1" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
          </label>
        </FilterPopover>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 h-[calc(100vh-11rem)]">
        <Card className={cls("w-full sm:w-80 shrink-0 flex flex-col p-3", atual && "hidden sm:flex")}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-sm">{filtradas.length} anotação(ões)</h2>
            <button className="btn btn-primary !px-2 !py-1" onClick={nova} aria-label="Nova anotação"><Plus size={14} /></button>
          </div>
          <input className="input mb-2" placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          <div className="flex-1 overflow-y-auto space-y-1">
            {filtradas.length === 0 && <p className="text-xs text-text-muted text-center mt-6">Nenhuma anotação.</p>}
            {filtradas.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelecionada(a.id)}
                className={`w-full text-left px-2 py-2 rounded-lg text-sm ${selecionada === a.id ? "bg-brand-light text-brand" : "hover:bg-surface-2"}`}
              >
                <p className="truncate font-medium flex items-center gap-1.5">
                  <span className="truncate">{a.titulo || "Sem título"}</span>
                  {notaVazia(a.conteudo) && <span className="text-2xs font-normal text-text-muted border border-border rounded px-1 shrink-0">vazia</span>}
                </p>
                {a.origemLabel && <p className="text-xs text-text-muted truncate">{a.origemLabel}</p>}
                {!notaVazia(a.conteudo) && <p className="text-xs text-text-muted line-clamp-2 mt-0.5">{textoPlano(a.conteudo).slice(0, 140)}</p>}
                <p className="text-[11px] text-text-muted">{formatDate(a.updatedAt)}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className={cls("flex-1 flex flex-col p-4 min-w-0", !atual && "hidden sm:flex")}>
          {!atual ? (
            <EmptyState icon={<NotebookPen size={32} />} title="Selecione ou crie uma anotação" />
          ) : (
            <AnotacaoEditor
              key={atual.id}
              anotacao={atual}
              areas={areas}
              onVoltar={() => setSelecionada(null)}
              onExcluir={() => excluir(atual)}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
