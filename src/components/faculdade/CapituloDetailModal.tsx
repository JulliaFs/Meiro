import { useState } from "react";
import { FileUp, Link as LinkIcon, Plus, Sparkles, Trash2, FileText, NotebookPen } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { SkillTagInput } from "../common/SkillTagInput";
import { ProfessorIaModal } from "../common/ProfessorIaModal";
import { capituloService, arquivoService, materialService } from "../../services";
import { criarAnotacaoComOrigem } from "../../lib/anotacoes";
import { useMateriais } from "../../hooks/useLiveData";
import { cls, statusColor, statusLabel } from "../../lib/utils";
import type { Capitulo, Dificuldade, Status } from "../../types";

const TABS = ["materiais", "desempenho", "aprendizado", "skills"] as const;
type Tab = typeof TABS[number];

export function CapituloDetailModal({
  capitulo,
  faseLabel,
  onClose,
}: {
  capitulo: Capitulo;
  faseLabel: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("materiais");
  const [openIa, setOpenIa] = useState(false);
  const [novoLink, setNovoLink] = useState("");
  const materiaisTodos = useMateriais();
  const materiaisCapitulo = materiaisTodos?.filter((m) => m.origemTipo === "capitulo" && m.origemId === capitulo.id) ?? [];

  function update(patch: Partial<Capitulo>) {
    capituloService.update(capitulo.id, patch);
  }

  async function uploadArquivo(file: File) {
    const arquivo = await arquivoService.upload(file);
    const tipo = file.type === "application/pdf" ? "pdf" : file.type.startsWith("image/") ? "imagem" : "docx";
    await materialService.create({
      titulo: file.name,
      tipo,
      tags: [],
      arquivoId: arquivo.path,
      dataUpload: new Date().toISOString().slice(0, 10),
      origemTipo: "capitulo",
      origemId: capitulo.id,
    });
  }

  function addLink() {
    if (!novoLink.trim()) return;
    update({ links: [...capitulo.links, novoLink.trim()] });
    setNovoLink("");
  }

  async function novaAnotacao() {
    const label = `${faseLabel} > Capítulo ${capitulo.numero} - ${capitulo.nome}`;
    await criarAnotacaoComOrigem({
      origemTipo: "capitulo",
      origemId: capitulo.id,
      origemLabel: label,
      faseId: capitulo.faseId,
      skills: capitulo.skills,
    });
  }

  return (
    <Modal open onClose={onClose} title={`Capítulo ${capitulo.numero} · ${capitulo.nome}`} wide>
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Nome do capítulo" value={capitulo.nome} onChange={(e) => update({ nome: e.target.value })} />
          <select
            value={capitulo.status}
            onChange={(e) => update({ status: e.target.value as Status })}
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
          <input type="date" className="input mt-1 w-auto" value={capitulo.dataEstudo ?? ""} onChange={(e) => update({ dataEstudo: e.target.value })} />
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
          <label className="btn btn-secondary cursor-pointer w-full justify-center">
            <FileUp size={14} /> Upload de PDF, DOCX ou imagem
            <input type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadArquivo(e.target.files[0])} />
          </label>
          <div className="space-y-2">
            {materiaisCapitulo.map((m) => (
              <div key={m.id} className="flex items-center justify-between border border-border rounded-lg p-2 text-sm">
                <span className="flex items-center gap-2 truncate"><FileText size={14} /> {m.titulo}</span>
                <button className="text-text-muted hover:text-red-500" onClick={() => materialService.remove(m.id)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input" placeholder="Adicionar link externo" value={novoLink} onChange={(e) => setNovoLink(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLink()} />
            <button className="btn btn-secondary" onClick={addLink}><Plus size={14} /></button>
          </div>
          <div className="flex flex-col gap-1">
            {capitulo.links.map((l, i) => (
              <a key={i} href={l} target="_blank" rel="noreferrer" className="text-xs text-brand flex items-center gap-1">
                <LinkIcon size={12} /> {l}
              </a>
            ))}
          </div>
        </div>
      )}

      {tab === "desempenho" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-text-muted">
              Nota do Fast Test
              <input type="number" className="input mt-1" value={capitulo.notaFastTest ?? ""} onChange={(e) => update({ notaFastTest: +e.target.value })} />
            </label>
            <label className="text-xs text-text-muted">
              Nota de exercícios
              <input type="number" className="input mt-1" value={capitulo.notaExercicios ?? ""} onChange={(e) => update({ notaExercicios: +e.target.value })} />
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
                  onClick={() => update({ dificuldade: d })}
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
          <SkillTagInput value={capitulo.skills} onChange={(skills) => update({ skills })} />
        </div>
      )}

      {capitulo.skills.length > 0 && tab !== "skills" && (
        <div className="flex gap-1 flex-wrap mt-3">{capitulo.skills.map((s) => <Badge key={s}>{s}</Badge>)}</div>
      )}

      {openIa && <ProfessorIaModal open onClose={() => setOpenIa(false)} titulo={capitulo.nome} />}
    </Modal>
  );
}
