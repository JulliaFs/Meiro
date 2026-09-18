import { useState } from "react";
import { FileUp, Link as LinkIcon, Plus, Sparkles, Trash2, FileText, NotebookPen, Loader2, X } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { SkillTagInput } from "../common/SkillTagInput";
import { ProfessorIaModal } from "../common/ProfessorIaModal";
import { capituloService, criarMaterialComArquivo, excluirMaterial } from "../../services";
import { criarAnotacaoComOrigem } from "../../lib/anotacoes";
import { useMateriais } from "../../hooks/useLiveData";
import { useAutoSave } from "../../hooks/useAutoSave";
import { notificarSucesso } from "../../store/useToastStore";
import { cls, confirmar, statusColor, statusLabel } from "../../lib/utils";
import type { Capitulo, Dificuldade, Status } from "../../types";

const TABS = ["materiais", "desempenho", "aprendizado", "skills"] as const;
type Tab = typeof TABS[number];

function numeroOuVazio(valor: string): number | undefined {
  return valor === "" ? undefined : +valor;
}

export function CapituloDetailModal({
  capitulo: capituloInicial,
  faseLabel,
  anoId,
  onClose,
}: {
  capitulo: Capitulo;
  faseLabel: string;
  anoId?: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("materiais");
  const [openIa, setOpenIa] = useState(false);
  const [novoLink, setNovoLink] = useState("");
  const [enviando, setEnviando] = useState(false);
  const materiaisTodos = useMateriais();
  const [capitulo, update] = useAutoSave(capituloInicial, (patch) => capituloService.update(capituloInicial.id, patch));
  const materiaisCapitulo = materiaisTodos?.filter((m) => m.origemTipo === "capitulo" && m.origemId === capitulo.id) ?? [];

  async function uploadArquivo(file: File) {
    setEnviando(true);
    try {
      await criarMaterialComArquivo(file, { origemTipo: "capitulo", origemId: capitulo.id });
    } catch {
      // erro já exibido
    } finally {
      setEnviando(false);
    }
  }

  function addLink() {
    if (!novoLink.trim()) return;
    update({ links: [...capitulo.links, novoLink.trim()] }, true);
    setNovoLink("");
  }

  function removerLink(idx: number) {
    update({ links: capitulo.links.filter((_, i) => i !== idx) }, true);
  }

  async function novaAnotacao() {
    const label = `${faseLabel} > Capítulo ${capitulo.numero} - ${capitulo.nome}`;
    try {
      await criarAnotacaoComOrigem({
        origemTipo: "capitulo",
        origemId: capitulo.id,
        origemLabel: label,
        anoId,
        faseId: capitulo.faseId,
        skills: capitulo.skills,
      });
      notificarSucesso("Anotação criada em Anotações.");
    } catch {
      // erro já exibido
    }
  }

  return (
    <Modal open onClose={onClose} title={`Capítulo ${capitulo.numero} · ${capitulo.nome}`} wide>
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Nome do capítulo" value={capitulo.nome} onChange={(e) => update({ nome: e.target.value })} />
          <select
            value={capitulo.status}
            onChange={(e) => update({ status: e.target.value as Status }, true)}
            className={cls("badge border-0 outline-none cursor-pointer justify-self-start", statusColor(capitulo.status))}
          >
            <option value="nao_iniciado">{statusLabel("nao_iniciado")}</option>
            <option value="em_andamento">{statusLabel("em_andamento")}</option>
            <option value="concluido">{statusLabel("concluido")}</option>
          </select>
        </div>
        <textarea className="input" placeholder="Descrição" value={capitulo.descricao ?? ""} onChange={(e) => update({ descricao: e.target.value })} />
        <label className="text-xs text-text-muted block">
          Data de estudo
          <input
            type="date"
            className="input mt-1 w-auto"
            value={capitulo.dataEstudo ?? ""}
            onChange={(e) => update({ dataEstudo: e.target.value || undefined }, true)}
          />
        </label>
      </div>

      <div className="flex gap-1 flex-wrap mb-3 border-b border-border pb-3">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? "btn-primary" : "btn-secondary"}`}>
            {t === "materiais" ? "Materiais" : t === "desempenho" ? "Desempenho" : t === "aprendizado" ? "Aprendizado" : "Skills"}
          </button>
        ))}
        <button className="btn btn-secondary ml-auto" onClick={() => setOpenIa(true)}><Sparkles size={14} /> Gerar Aula Completa</button>
        <button className="btn btn-secondary" onClick={novaAnotacao}><NotebookPen size={14} /> Nova Anotação</button>
      </div>

      {tab === "materiais" && (
        <div className="space-y-3">
          <label className={cls("btn btn-secondary cursor-pointer w-full justify-center", enviando && "opacity-60 pointer-events-none")}>
            {enviando ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
            {enviando ? "Enviando..." : "Upload de PDF, DOCX ou imagem"}
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="hidden"
              disabled={enviando}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) uploadArquivo(file);
              }}
            />
          </label>
          <div className="space-y-2">
            {materiaisCapitulo.map((m) => (
              <div key={m.id} className="flex items-center justify-between border border-border rounded-lg p-2 text-sm">
                <span className="flex items-center gap-2 truncate"><FileText size={14} /> {m.titulo}</span>
                <button
                  className="text-text-muted hover:text-red-500"
                  onClick={() => confirmar(`Excluir "${m.titulo}"?`) && excluirMaterial(m).catch(() => {})}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input" placeholder="Adicionar link externo" value={novoLink} onChange={(e) => setNovoLink(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLink()} />
            <button className="btn btn-secondary" onClick={addLink}><Plus size={14} /></button>
          </div>
          <div className="flex flex-col gap-1">
            {capitulo.links.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <a href={l} target="_blank" rel="noreferrer" className="text-xs text-brand flex items-center gap-1 truncate">
                  <LinkIcon size={12} className="shrink-0" /> {l}
                </a>
                <button className="text-text-muted hover:text-red-500 shrink-0" onClick={() => removerLink(i)} aria-label="Remover link">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "desempenho" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-text-muted">
              Nota do Fast Test
              <input
                type="number"
                className="input mt-1"
                value={capitulo.notaFastTest ?? ""}
                onChange={(e) => update({ notaFastTest: numeroOuVazio(e.target.value) })}
              />
            </label>
            <label className="text-xs text-text-muted">
              Nota de exercícios
              <input
                type="number"
                className="input mt-1"
                value={capitulo.notaExercicios ?? ""}
                onChange={(e) => update({ notaExercicios: numeroOuVazio(e.target.value) })}
              />
            </label>
          </div>
          <textarea className="input" placeholder="Observações" value={capitulo.observacoesDesempenho ?? ""} onChange={(e) => update({ observacoesDesempenho: e.target.value })} />
        </div>
      )}

      {tab === "aprendizado" && (
        <div className="space-y-3">
          <textarea className="input h-24" placeholder="Resumo do capítulo" value={capitulo.resumo ?? ""} onChange={(e) => update({ resumo: e.target.value })} />
          <textarea className="input h-24" placeholder="Principais conceitos" value={capitulo.principaisConceitos ?? ""} onChange={(e) => update({ principaisConceitos: e.target.value })} />
          <div>
            <p className="text-xs text-text-muted mb-1">Dificuldade percebida</p>
            <div className="flex gap-2">
              {(["facil", "medio", "dificil"] as Dificuldade[]).map((d) => (
                <button
                  key={d}
                  onClick={() => update({ dificuldade: d }, true)}
                  className={cls("btn flex-1 justify-center", capitulo.dificuldade === d ? "btn-primary" : "btn-secondary")}
                >
                  {d === "facil" ? "Fácil" : d === "medio" ? "Médio" : "Difícil"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "skills" && (
        <div>
          <p className="text-xs text-text-muted mb-2">
            Skills vinculadas a este capítulo. Ao concluir o capítulo, elas são automaticamente contabilizadas no Mapa de Carreira.
          </p>
          <SkillTagInput value={capitulo.skills} onChange={(skills) => update({ skills }, true)} />
        </div>
      )}

      {capitulo.skills.length > 0 && tab !== "skills" && (
        <div className="flex gap-1 flex-wrap mt-3">{capitulo.skills.map((s) => <Badge key={s}>{s}</Badge>)}</div>
      )}

      {openIa && <ProfessorIaModal open onClose={() => setOpenIa(false)} titulo={capitulo.nome} />}
    </Modal>
  );
}
