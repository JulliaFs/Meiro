import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Eye, Pencil as PencilIcon, ArrowUpRight } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { FilterPopover } from "../components/common/FilterPopover";
import { useAnotacoes, useAreas, useAnos, useFases, useCapitulos, useFase } from "../hooks/useLiveData";
import { anotacaoService } from "../services";
import { markdownToHtml } from "../lib/markdown";
import { NotebookPen } from "lucide-react";
import { useUiStore } from "../store/useUiStore";
import { cls } from "../lib/utils";
import { ArrowLeft } from "lucide-react";
import type { Anotacao } from "../types";

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

export default function AnotacoesPage() {
  const anotacoes = useAnotacoes();
  const areas = useAreas();
  const anos = useAnos();
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [preview, setPreview] = useState(false);
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
    return (anotacoes ?? []).filter((a) => {
      if (q && !a.titulo.toLowerCase().includes(q) && !a.tags.some((t) => t.includes(q))) return false;
      if (filtroAno && a.anoId !== filtroAno) return false;
      if (filtroFase && a.faseId !== filtroFase) return false;
      if (filtroCapitulo && a.origemId !== filtroCapitulo) return false;
      if (filtroSkill && !(a.skills ?? []).includes(filtroSkill)) return false;
      if (filtroData && a.createdAt.slice(0, 10) !== filtroData) return false;
      return true;
    });
  }, [anotacoes, busca, filtroAno, filtroFase, filtroSkill, filtroData]);

  const atual = anotacoes?.find((a) => a.id === selecionada);

  async function nova() {
    const a = await anotacaoService.create({
      titulo: "Nova anotação",
      conteudo: "# Nova anotação\n\nEscreva aqui em **markdown**...\n\n- [ ] Tarefa 1\n- [ ] Tarefa 2",
      tags: [],
    });
    setSelecionada(a.id);
  }

  function update(patch: Partial<Anotacao>) {
    if (!atual) return;
    anotacaoService.update(atual.id, patch);
  }

  const pendingAction = useUiStore((s) => s.pendingAction);
  const setPendingAction = useUiStore((s) => s.setPendingAction);
  useEffect(() => {
    if (pendingAction === "nova-anotacao") {
      setPendingAction(null);
      nova();
    }
  }, [pendingAction]);

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
            <button className="btn btn-primary !px-2 !py-1" onClick={nova}><Plus size={14} /></button>
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
                <p className="truncate font-medium">{a.titulo}</p>
                {a.origemLabel && <p className="text-xs text-text-muted truncate">{a.origemLabel}</p>}
                <p className="text-[11px] text-text-muted">{new Date(a.updatedAt).toLocaleDateString("pt-BR")}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className={cls("flex-1 flex flex-col p-4 min-w-0", !atual && "hidden sm:flex")}>
          {!atual ? (
            <EmptyState icon={<NotebookPen size={32} />} title="Selecione ou crie uma anotação" />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <button className="btn btn-secondary sm:hidden" onClick={() => setSelecionada(null)}><ArrowLeft size={14} /></button>
                <input className="input flex-1 font-semibold" value={atual.titulo} onChange={(e) => update({ titulo: e.target.value })} />
                <button className="btn btn-secondary" onClick={() => setPreview(!preview)}>
                  {preview ? <PencilIcon size={14} /> : <Eye size={14} />}
                  {preview ? "Editar" : "Visualizar"}
                </button>
                <BacklinkButton anotacao={atual} />
                <button className="btn btn-secondary text-red-500" onClick={() => { anotacaoService.remove(atual.id); setSelecionada(null); }}>
                  <Trash2 size={14} />
                </button>
              </div>
              {atual.origemLabel && (
                <p className="text-xs text-text-muted mb-2">
                  Origem: {atual.origemLabel} · Criada em {new Date(atual.createdAt).toLocaleDateString("pt-BR")} · Última edição {new Date(atual.updatedAt).toLocaleDateString("pt-BR")}
                </p>
              )}
              <div className="flex gap-2 mb-3 flex-wrap">
                <select className="input w-auto" value={atual.area ?? ""} onChange={(e) => update({ area: e.target.value })}>
                  <option value="">Sem área</option>
                  {areas?.map((ar) => <option key={ar.id} value={ar.nome}>{ar.nome}</option>)}
                </select>
                <input className="input w-auto" placeholder="Pasta" value={atual.pasta ?? ""} onChange={(e) => update({ pasta: e.target.value })} />
                <input
                  className="input w-auto"
                  placeholder="Tags (vírgula)"
                  value={atual.tags.join(", ")}
                  onChange={(e) => update({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                />
              </div>
              {(atual.tags.length > 0 || (atual.skills ?? []).length > 0) && (
                <div className="flex gap-1 mb-2 flex-wrap">
                  {atual.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                  {(atual.skills ?? []).map((s) => <Badge key={s} className="bg-brand-light text-brand">{s}</Badge>)}
                </div>
              )}
              {preview ? (
                <div className="flex-1 overflow-y-auto text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: markdownToHtml(atual.conteudo) }} />
              ) : (
                <textarea className="input flex-1 resize-none font-mono text-sm" value={atual.conteudo} onChange={(e) => update({ conteudo: e.target.value })} />
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
