import { useState } from "react";
import { FileUp, Trash2, FileText, NotebookPen } from "lucide-react";
import { Modal } from "../ui/Modal";
import { SkillTagInput } from "../common/SkillTagInput";
import { aulaService, arquivoService, materialService } from "../../services";
import { criarAnotacaoComOrigem } from "../../lib/anotacoes";
import { useMateriais } from "../../hooks/useLiveData";
import { cls, statusColor, statusLabel } from "../../lib/utils";
import type { Aula, Status } from "../../types";

const TABS = ["materiais", "aprendizado", "skills"] as const;
type Tab = typeof TABS[number];

export function AulaDetailModal({
  aula,
  cursoLabel,
  cursoId,
  onClose,
}: {
  aula: Aula;
  cursoLabel: string;
  cursoId: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("materiais");
  const materiaisTodos = useMateriais();
  const materiaisAula = materiaisTodos?.filter((m) => m.origemTipo === "aula" && m.origemId === aula.id) ?? [];

  function update(patch: Partial<Aula>) {
    aulaService.update(aula.id, patch);
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
      origemTipo: "aula",
      origemId: aula.id,
    });
  }

  async function novaAnotacao() {
    const label = `${cursoLabel} > Aula ${aula.numero} - ${aula.nome}`;
    await criarAnotacaoComOrigem({
      origemTipo: "aula",
      origemId: aula.id,
      origemLabel: label,
      cursoId,
      skills: aula.skills,
    });
  }

  return (
    <Modal open onClose={onClose} title={`Aula ${aula.numero} · ${aula.nome}`} wide>
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Nome da aula" value={aula.nome} onChange={(e) => update({ nome: e.target.value })} />
          <select
            value={aula.status}
            onChange={(e) => update({ status: e.target.value as Status })}
            className={cls("badge border-0 outline-none cursor-pointer justify-self-start", statusColor(aula.status))}
          >
            <option value="nao_iniciado">{statusLabel("nao_iniciado")}</option>
            <option value="em_andamento">{statusLabel("em_andamento")}</option>
            <option value="concluido">{statusLabel("concluido")}</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-text-muted">
            Data
            <input type="date" className="input mt-1" value={aula.data ?? ""} onChange={(e) => update({ data: e.target.value })} />
          </label>
          <label className="text-xs text-text-muted">
            Duração (min)
            <input type="number" className="input mt-1" value={aula.duracaoMinutos ?? ""} onChange={(e) => update({ duracaoMinutos: +e.target.value })} />
          </label>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap mb-3 border-b border-border pb-3">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? "btn-primary" : "btn-secondary"}`}>
            {t === "materiais" ? "Materiais" : t === "aprendizado" ? "Aprendizado" : "Skills"}
          </button>
        ))}
        <button className="btn btn-secondary ml-auto" onClick={novaAnotacao}><NotebookPen size={14} /> Nova Anotação</button>
      </div>

      {tab === "materiais" && (
        <div className="space-y-3">
          <label className="btn btn-secondary cursor-pointer w-full justify-center">
            <FileUp size={14} /> Upload de PDF / material complementar / certificado parcial
            <input type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadArquivo(e.target.files[0])} />
          </label>
          <div className="space-y-2">
            {materiaisAula.map((m) => (
              <div key={m.id} className="flex items-center justify-between border border-border rounded-lg p-2 text-sm">
                <span className="flex items-center gap-2 truncate"><FileText size={14} /> {m.titulo}</span>
                <button className="text-text-muted hover:text-red-500" onClick={() => materialService.remove(m.id)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "aprendizado" && (
        <div className="space-y-3">
          <textarea className="input h-20" placeholder="Resumo" value={aula.resumo ?? ""} onChange={(e) => update({ resumo: e.target.value })} />
          <textarea className="input h-20" placeholder="Aprendizados" value={aula.aprendizados ?? ""} onChange={(e) => update({ aprendizados: e.target.value })} />
          <textarea className="input h-20" placeholder="Observações" value={aula.observacoes ?? ""} onChange={(e) => update({ observacoes: e.target.value })} />
        </div>
      )}

      {tab === "skills" && (
        <div>
          <p className="text-xs text-text-muted mb-2">
            Ao concluir esta aula, as skills vinculadas atualizam automaticamente o progresso no Mapa de Carreira.
          </p>
          <SkillTagInput value={aula.skills} onChange={(skills) => update({ skills })} />
        </div>
      )}
    </Modal>
  );
}
