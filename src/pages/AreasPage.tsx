import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { useAreas } from "../hooks/useLiveData";
import { areaService } from "../services";
import type { AreaConhecimento } from "../types";
import { Layers } from "lucide-react";

const CORES = ["#6d5bf8", "#22c55e", "#f59e0b", "#0ea5e9", "#ef4444", "#a855f7", "#14b8a6", "#f97316"];

function AreaForm({ area, onClose }: { area?: AreaConhecimento; onClose: () => void }) {
  const [nome, setNome] = useState(area?.nome ?? "");
  const [descricao, setDescricao] = useState(area?.descricao ?? "");
  const [nivel, setNivel] = useState(area?.nivel ?? 10);
  const [progresso, setProgresso] = useState(area?.progresso ?? 0);
  const [horasEstudadas, setHorasEstudadas] = useState(area?.horasEstudadas ?? 0);
  const [cor, setCor] = useState(area?.cor ?? CORES[0]);

  async function salvar() {
    if (!nome.trim()) return;
    if (area) {
      await areaService.update(area.id, { nome, descricao, nivel, progresso, horasEstudadas, cor });
    } else {
      await areaService.create({ nome, descricao, nivel, progresso, horasEstudadas, cor });
    }
    onClose();
  }

  return (
    <div className="space-y-3">
      <input className="input" placeholder="Nome da área" value={nome} onChange={(e) => setNome(e.target.value)} />
      <textarea className="input" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Nível ({nivel}%)
          <input type="range" min={0} max={100} value={nivel} onChange={(e) => setNivel(+e.target.value)} className="w-full" />
        </label>
        <label className="text-sm">
          Progresso ({progresso}%)
          <input type="range" min={0} max={100} value={progresso} onChange={(e) => setProgresso(+e.target.value)} className="w-full" />
        </label>
      </div>
      <input
        type="number"
        className="input"
        placeholder="Horas estudadas"
        value={horasEstudadas}
        onChange={(e) => setHorasEstudadas(+e.target.value)}
      />
      <div className="flex gap-2">
        {CORES.map((c) => (
          <button
            key={c}
            onClick={() => setCor(c)}
            className="w-7 h-7 rounded-full border-2"
            style={{ backgroundColor: c, borderColor: cor === c ? "var(--color-text)" : "transparent" }}
          />
        ))}
      </div>
      <button className="btn btn-primary w-full justify-center" onClick={salvar}>
        Salvar
      </button>
    </div>
  );
}

export default function AreasPage() {
  const areas = useAreas();
  const [modal, setModal] = useState<"new" | AreaConhecimento | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Áreas de Conhecimento</h1>
          <p className="text-text-muted text-sm mt-1">Acompanhe sua evolução por área de estudo.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("new")}>
          <Plus size={16} /> Nova área
        </button>
      </div>

      {areas?.length === 0 && (
        <EmptyState icon={<Layers size={32} />} title="Nenhuma área cadastrada" description="Crie áreas para organizar seu conhecimento." />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas?.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between">
              <CardHeader title={a.nome} subtitle={a.descricao} />
              <div className="flex gap-1 shrink-0">
                <button className="text-text-muted hover:text-text p-1" onClick={() => setModal(a)}>
                  <Pencil size={14} />
                </button>
                <button className="text-text-muted hover:text-red-500 p-1" onClick={() => areaService.remove(a.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-text-muted">
                <span>Nível</span>
                <span>{a.nivel}%</span>
              </div>
              <ProgressBar value={a.nivel} color={a.cor} />
              <div className="flex justify-between text-xs text-text-muted">
                <span>Progresso</span>
                <span>{a.progresso}%</span>
              </div>
              <ProgressBar value={a.progresso} color={a.cor} />
              <p className="text-xs text-text-muted pt-1">{a.horasEstudadas}h estudadas</p>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "new" ? "Nova área" : "Editar área"}>
        <AreaForm area={modal !== "new" ? (modal as AreaConhecimento) ?? undefined : undefined} onClose={() => setModal(null)} />
      </Modal>
    </div>
  );
}
