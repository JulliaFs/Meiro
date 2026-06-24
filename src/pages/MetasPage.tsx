import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { useMetas } from "../hooks/useLiveData";
import { metaService, uid } from "../services";
import type { CategoriaMeta, Meta } from "../types";
import { Target } from "lucide-react";

const CATEGORIAS: CategoriaMeta[] = ["anual", "trimestral", "mensal", "semanal", "diaria"];
const LABEL: Record<CategoriaMeta, string> = { anual: "Anual", trimestral: "Trimestral", mensal: "Mensal", semanal: "Semanal", diaria: "Diária" };

function MetaForm({ onClose }: { onClose: () => void }) {
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [categoria, setCategoria] = useState<CategoriaMeta>("mensal");

  async function salvar() {
    if (!descricao.trim()) return;
    await metaService.create({ descricao, prazo, categoria, progresso: 0, checklist: [] });
    onClose();
  }

  return (
    <div className="space-y-3">
      <input className="input" placeholder="Descrição da meta" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <input type="date" className="input" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
        <select className="input" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaMeta)}>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{LABEL[c]}</option>)}
        </select>
      </div>
      <button className="btn btn-primary w-full justify-center" onClick={salvar}>Salvar</button>
    </div>
  );
}

function MetaCard({ meta }: { meta: Meta }) {
  const [novoItem, setNovoItem] = useState("");

  async function addItem() {
    if (!novoItem.trim()) return;
    const checklist = [...meta.checklist, { id: uid(), texto: novoItem, feito: false }];
    await recalcular(checklist);
    setNovoItem("");
  }

  async function toggleItem(id: string) {
    const checklist = meta.checklist.map((i) => (i.id === id ? { ...i, feito: !i.feito } : i));
    await recalcular(checklist);
  }

  async function recalcular(checklist: Meta["checklist"]) {
    const progresso = checklist.length ? Math.round((checklist.filter((i) => i.feito).length / checklist.length) * 100) : meta.progresso;
    await metaService.update(meta.id, { checklist, progresso });
  }

  return (
    <Card>
      <div className="flex items-start justify-between">
        <CardHeader title={meta.descricao} subtitle={meta.prazo ? `Prazo: ${new Date(meta.prazo).toLocaleDateString("pt-BR")}` : undefined} />
        <button className="text-text-muted hover:text-red-500 p-1" onClick={() => metaService.remove(meta.id)}><Trash2 size={14} /></button>
      </div>
      <ProgressBar value={meta.progresso} />
      <p className="text-xs text-text-muted mt-1 mb-2">{meta.progresso}% concluído</p>
      <div className="space-y-1">
        {meta.checklist.map((i) => (
          <label key={i.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={i.feito} onChange={() => toggleItem(i.id)} />
            <span className={i.feito ? "line-through text-text-muted" : ""}>{i.texto}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input className="input" placeholder="Novo item" value={novoItem} onChange={(e) => setNovoItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} />
        <button className="btn btn-secondary" onClick={addItem}><Plus size={14} /></button>
      </div>
    </Card>
  );
}

export default function MetasPage() {
  const metas = useMetas();
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState<CategoriaMeta>("mensal");

  const filtradas = useMemo(() => (metas ?? []).filter((m) => m.categoria === tab), [metas, tab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Metas</h1>
          <p className="text-text-muted text-sm mt-1">Defina e acompanhe suas metas de estudo.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Nova meta</button>
      </div>

      <div className="flex gap-1 flex-wrap">
        {CATEGORIAS.map((c) => (
          <button key={c} onClick={() => setTab(c)} className={`btn ${tab === c ? "btn-primary" : "btn-secondary"}`}>
            {LABEL[c]}
          </button>
        ))}
      </div>

      {filtradas.length === 0 && <EmptyState icon={<Target size={32} />} title={`Nenhuma meta ${LABEL[tab].toLowerCase()}`} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtradas.map((m) => <MetaCard key={m.id} meta={m} />)}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Nova meta">
        <MetaForm onClose={() => setModal(false)} />
      </Modal>
    </div>
  );
}
