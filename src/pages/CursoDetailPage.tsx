import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, ChevronDown, Layers } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { AulaDetailModal } from "../components/cursos/AulaDetailModal";
import { useAulas, useCurso, useModulos } from "../hooks/useLiveData";
import { aulaService, moduloService } from "../services";
import { cls, statusColor, statusLabel } from "../lib/utils";
import type { Aula } from "../types";

function ModuloForm({ cursoId, onClose }: { cursoId: string; onClose: () => void }) {
  const modulos = useModulos(cursoId);
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState((modulos?.length ?? 0) + 1);
  const [descricao, setDescricao] = useState("");

  async function salvar() {
    if (!nome.trim()) return;
    await moduloService.create({ cursoId, nome, numero, descricao, status: "nao_iniciado" });
    onClose();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <input className="input col-span-2" placeholder="Nome do módulo" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input type="number" className="input" placeholder="Nº" value={numero} onChange={(e) => setNumero(+e.target.value)} />
      </div>
      <textarea className="input" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      <button className="btn btn-primary w-full justify-center" onClick={salvar}>Adicionar módulo</button>
    </div>
  );
}

function AulaForm({ moduloId, onClose }: { moduloId: string; onClose: () => void }) {
  const aulas = useAulas(moduloId);
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState((aulas?.length ?? 0) + 1);

  async function salvar() {
    if (!nome.trim()) return;
    await aulaService.create({ moduloId, nome, numero, status: "nao_iniciado", skills: [] });
    onClose();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <input className="input col-span-2" placeholder="Nome da aula" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input type="number" className="input" placeholder="Nº" value={numero} onChange={(e) => setNumero(+e.target.value)} />
      </div>
      <button className="btn btn-primary w-full justify-center" onClick={salvar}>Adicionar aula</button>
    </div>
  );
}

function ModuloCard({ moduloId, nome, numero, cursoLabel, cursoId }: { moduloId: string; nome: string; numero: number; cursoLabel: string; cursoId: string }) {
  const [open, setOpen] = useState(true);
  const aulas = useAulas(moduloId);
  const [modalAula, setModalAula] = useState(false);
  const [aulaAtiva, setAulaAtiva] = useState<Aula | null>(null);

  const total = aulas?.length ?? 0;
  const concluidas = aulas?.filter((a) => a.status === "concluido").length ?? 0;
  const pct = total ? Math.round((concluidas / total) * 100) : 0;

  return (
    <Card>
      <button className="w-full flex items-center justify-between" onClick={() => setOpen(!open)}>
        <h3 className="font-semibold text-left">Módulo {numero} · {nome}</h3>
        <ChevronDown size={18} className={cls("transition-transform shrink-0", open && "rotate-180")} />
      </button>
      <div className="mt-2">
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>{concluidas}/{total} aulas</span><span>{pct}%</span>
        </div>
        <ProgressBar value={pct} />
      </div>

      {open && (
        <div className="mt-3 border-t border-border pt-3 space-y-2">
          {aulas?.map((a) => (
            <button key={a.id} onClick={() => setAulaAtiva(a)} className="w-full flex items-center justify-between border border-border rounded-lg p-2 text-sm hover:border-brand">
              <span className="truncate">Aula {a.numero} · {a.nome}</span>
              <span className={cls("badge", statusColor(a.status))}>{statusLabel(a.status)}</span>
            </button>
          ))}
          <button className="btn btn-secondary w-full justify-center" onClick={() => setModalAula(true)}>
            <Plus size={14} /> Adicionar aula
          </button>
        </div>
      )}

      <Modal open={modalAula} onClose={() => setModalAula(false)} title="Adicionar aula">
        <AulaForm moduloId={moduloId} onClose={() => setModalAula(false)} />
      </Modal>

      {aulaAtiva && (
        <AulaDetailModal aula={aulaAtiva} cursoLabel={`${cursoLabel} > Módulo ${numero}`} cursoId={cursoId} onClose={() => setAulaAtiva(null)} />
      )}
    </Card>
  );
}

export default function CursoDetailPage() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const curso = useCurso(cursoId);
  const modulos = useModulos(cursoId);
  const [modalModulo, setModalModulo] = useState(false);

  if (!curso) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/cursos")} className="text-sm text-text-muted flex items-center gap-1 hover:text-text">
        <ArrowLeft size={14} /> Voltar para cursos
      </button>

      <Card>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <CardHeader title={curso.nome} subtitle={`${curso.plataforma}${curso.instrutor ? " · " + curso.instrutor : ""}`} />
          <span className={cls("badge", statusColor(curso.status))}>{statusLabel(curso.status)}</span>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Módulos</h2>
        <button className="btn btn-primary" onClick={() => setModalModulo(true)}>
          <Plus size={16} /> Adicionar módulo
        </button>
      </div>

      {(!modulos || modulos.length === 0) && <EmptyState icon={<Layers size={32} />} title="Nenhum módulo cadastrado" />}

      <div className="space-y-3">
        {modulos?.map((m) => (
          <ModuloCard key={m.id} moduloId={m.id} nome={m.nome} numero={m.numero} cursoLabel={curso.nome} cursoId={curso.id} />
        ))}
      </div>

      {cursoId && (
        <Modal open={modalModulo} onClose={() => setModalModulo(false)} title="Adicionar módulo">
          <ModuloForm cursoId={cursoId} onClose={() => setModalModulo(false)} />
        </Modal>
      )}
    </div>
  );
}
