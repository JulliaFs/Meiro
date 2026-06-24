import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, FileText } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { Badge } from "../components/ui/Badge";
import { CapituloDetailModal } from "../components/faculdade/CapituloDetailModal";
import { useCapitulos, useFase } from "../hooks/useLiveData";
import { capituloService, faseService } from "../services";
import { cls, statusColor, statusLabel } from "../lib/utils";
import type { Capitulo, StatusFase } from "../types";

function CapituloForm({ faseId, onClose }: { faseId: string; onClose: () => void }) {
  const capitulos = useCapitulos(faseId);
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState((capitulos?.length ?? 0) + 1);
  const [descricao, setDescricao] = useState("");

  async function salvar() {
    if (!nome.trim()) return;
    await capituloService.create({
      faseId,
      nome,
      numero,
      descricao,
      status: "nao_iniciado",
      links: [],
      skills: [],
    });
    onClose();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <input className="input col-span-2" placeholder="Nome do capítulo" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input type="number" className="input" placeholder="Nº" value={numero} onChange={(e) => setNumero(+e.target.value)} />
      </div>
      <textarea className="input" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      <button className="btn btn-primary w-full justify-center" onClick={salvar}>Adicionar capítulo</button>
    </div>
  );
}

export default function FasePage() {
  const { faseId } = useParams();
  const navigate = useNavigate();
  const fase = useFase(faseId);
  const capitulos = useCapitulos(faseId);
  const [modalCapitulo, setModalCapitulo] = useState(false);
  const [capituloAtivo, setCapituloAtivo] = useState<Capitulo | null>(null);

  if (!fase) return null;

  const total = capitulos?.length ?? 0;
  const concluidos = capitulos?.filter((c) => c.status === "concluido").length ?? 0;
  const pct = total ? Math.round((concluidos / total) * 100) : 0;
  const faseLabel = `Faculdade > Fase ${fase.numero}`;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(`/faculdade`)} className="text-sm text-text-muted flex items-center gap-1 hover:text-text">
        <ArrowLeft size={14} /> Voltar para faculdade
      </button>

      <Card>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex-1 min-w-[240px]">
            <CardHeader title={`Fase ${fase.numero} · ${fase.nome}`} subtitle={fase.descricao} />
            <div className="flex gap-2 flex-wrap mb-2">
              {fase.dataInicio && <Badge>Início: {new Date(fase.dataInicio).toLocaleDateString("pt-BR")}</Badge>}
              {fase.dataTermino && <Badge>Término: {new Date(fase.dataTermino).toLocaleDateString("pt-BR")}</Badge>}
            </div>
            {fase.observacoes && <p className="text-xs text-text-muted">{fase.observacoes}</p>}
          </div>
          <select
            value={fase.status}
            onChange={(e) => faseService.update(fase.id, { status: e.target.value as StatusFase })}
            className={cls("badge border-0 outline-none cursor-pointer", statusColor(fase.status))}
          >
            <option value="pendente">{statusLabel("pendente")}</option>
            <option value="em_andamento">{statusLabel("em_andamento")}</option>
            <option value="concluida">{statusLabel("concluida")}</option>
          </select>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span>{concluidos}/{total} capítulos concluídos</span>
            <span>{pct}%</span>
          </div>
          <ProgressBar value={pct} />
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Capítulos</h2>
        <button className="btn btn-primary" onClick={() => setModalCapitulo(true)}>
          <Plus size={16} /> Adicionar Capítulo
        </button>
      </div>

      {total === 0 && <EmptyState icon={<FileText size={32} />} title="Nenhum capítulo cadastrado" />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {capitulos?.map((c) => (
          <button key={c.id} onClick={() => setCapituloAtivo(c)} className="card p-4 text-left hover:border-brand transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm truncate">Cap. {c.numero} · {c.nome}</span>
            </div>
            <span className={cls("badge", statusColor(c.status))}>{statusLabel(c.status)}</span>
            {c.skills.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-2">{c.skills.slice(0, 3).map((s) => <Badge key={s}>{s}</Badge>)}</div>
            )}
          </button>
        ))}
      </div>

      <Modal open={modalCapitulo} onClose={() => setModalCapitulo(false)} title="Adicionar Capítulo">
        {faseId && <CapituloForm faseId={faseId} onClose={() => setModalCapitulo(false)} />}
      </Modal>

      {capituloAtivo && (
        <CapituloDetailModal capitulo={capituloAtivo} faseLabel={faseLabel} onClose={() => setCapituloAtivo(null)} />
      )}
    </div>
  );
}
