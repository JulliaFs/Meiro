import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, ExternalLink, Award, Clock, BookOpen, CheckCircle2 } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { useCursos, useTodasAulas, useTodosModulos } from "../hooks/useLiveData";
import { cursoService } from "../services";
import { cls, statusColor, statusLabel } from "../lib/utils";
import { useUiStore } from "../store/useUiStore";
import type { CategoriaCurso, Curso, StatusCurso } from "../types";

const CATEGORIAS: CategoriaCurso[] = ["Programação", "Design", "Inglês", "Faculdade", "Produtividade", "Negócios", "Outros"];
const STATUSES: StatusCurso[] = ["planejado", "em_andamento", "concluido", "pausado"];

function CursoForm({ curso, onClose }: { curso?: Curso; onClose: () => void }) {
  const [nome, setNome] = useState(curso?.nome ?? "");
  const [plataforma, setPlataforma] = useState(curso?.plataforma ?? "");
  const [link, setLink] = useState(curso?.link ?? "");
  const [categoria, setCategoria] = useState<CategoriaCurso>(curso?.categoria ?? "Programação");
  const [instrutor, setInstrutor] = useState(curso?.instrutor ?? "");
  const [cargaHoraria, setCargaHoraria] = useState(curso?.cargaHoraria ?? 0);
  const [dataInicio, setDataInicio] = useState(curso?.dataInicio ?? "");
  const [dataConclusao, setDataConclusao] = useState(curso?.dataConclusao ?? "");
  const [status, setStatus] = useState<StatusCurso>(curso?.status ?? "planejado");

  async function salvar() {
    if (!nome.trim()) return;
    const payload = { nome, plataforma, link, categoria, instrutor, cargaHoraria, dataInicio, dataConclusao, status };
    if (curso) await cursoService.update(curso.id, payload);
    else await cursoService.create(payload);
    onClose();
  }

  return (
    <div className="space-y-3">
      <input className="input" placeholder="Nome do curso" value={nome} onChange={(e) => setNome(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <input className="input" placeholder="Plataforma" value={plataforma} onChange={(e) => setPlataforma(e.target.value)} />
        <input className="input" placeholder="Instrutor" value={instrutor} onChange={(e) => setInstrutor(e.target.value)} />
      </div>
      <input className="input" placeholder="Link do curso" value={link} onChange={(e) => setLink(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <select className="input" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaCurso)}>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value as StatusCurso)}>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </div>
      <input type="number" className="input" placeholder="Carga horária (h)" value={cargaHoraria} onChange={(e) => setCargaHoraria(+e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-text-muted">
          Início
          <input type="date" className="input mt-1" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </label>
        <label className="text-xs text-text-muted">
          Conclusão
          <input type="date" className="input mt-1" value={dataConclusao} onChange={(e) => setDataConclusao(e.target.value)} />
        </label>
      </div>
      <button className="btn btn-primary w-full justify-center" onClick={salvar}>Salvar</button>
    </div>
  );
}

export default function CursosPage() {
  const cursos = useCursos();
  const modulos = useTodosModulos();
  const aulas = useTodasAulas();
  const navigate = useNavigate();
  const [modal, setModal] = useState<"new" | Curso | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const pendingAction = useUiStore((s) => s.pendingAction);
  const setPendingAction = useUiStore((s) => s.setPendingAction);
  useEffect(() => {
    if (pendingAction === "novo-curso") {
      setPendingAction(null);
      setModal("new");
    }
  }, [pendingAction]);

  const filtrados = useMemo(
    () => (cursos ?? []).filter((c) => (filtroStatus === "todos" || c.status === filtroStatus) && (filtroCategoria === "todas" || c.categoria === filtroCategoria)),
    [cursos, filtroStatus, filtroCategoria]
  );

  function progressoCurso(cursoId: string) {
    const modIds = (modulos ?? []).filter((m) => m.cursoId === cursoId).map((m) => m.id);
    const aulasCurso = (aulas ?? []).filter((a) => modIds.includes(a.moduloId));
    if (aulasCurso.length === 0) return 0;
    return Math.round((aulasCurso.filter((a) => a.status === "concluido").length / aulasCurso.length) * 100);
  }

  const stats = {
    ativos: cursos?.filter((c) => c.status === "em_andamento").length ?? 0,
    concluidos: cursos?.filter((c) => c.status === "concluido").length ?? 0,
    horas: cursos?.reduce((acc, c) => acc + c.cargaHoraria, 0) ?? 0,
    certificados: cursos?.filter((c) => c.certificadoId).length ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Meus Cursos</h1>
          <p className="text-text-muted text-sm mt-1">Cursos externos organizados como trilha: módulos e aulas.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("new")}><Plus size={16} /> Novo curso</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><BookOpen size={18} className="text-brand mb-2" /><p className="text-xl font-semibold">{stats.ativos}</p><p className="text-xs text-text-muted">Cursos ativos</p></Card>
        <Card className="p-4"><CheckCircle2 size={18} className="text-brand mb-2" /><p className="text-xl font-semibold">{stats.concluidos}</p><p className="text-xs text-text-muted">Concluídos</p></Card>
        <Card className="p-4"><Clock size={18} className="text-brand mb-2" /><p className="text-xl font-semibold">{stats.horas}h</p><p className="text-xs text-text-muted">Horas totais</p></Card>
        <Card className="p-4"><Award size={18} className="text-brand mb-2" /><p className="text-xl font-semibold">{stats.certificados}</p><p className="text-xs text-text-muted">Certificados</p></Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select className="input w-auto" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="todos">Todos os status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <select className="input w-auto" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="todas">Todas as categorias</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtrados.length === 0 && (
        <EmptyState
          icon={<BookOpen size={24} />}
          title="Nenhum curso por aqui ainda"
          description="Adicione seu primeiro curso para começar a construir sua jornada de aprendizado."
          action={<button className="btn btn-primary" onClick={() => setModal("new")}><Plus size={16} /> Criar Curso</button>}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between">
              <button className="text-left flex-1" onClick={() => navigate(`/cursos/${c.id}`)}>
                <CardHeader title={c.nome} subtitle={`${c.plataforma}${c.instrutor ? " · " + c.instrutor : ""}`} />
              </button>
              <div className="flex gap-1 shrink-0">
                <button className="text-text-muted hover:text-text p-1" onClick={() => setModal(c)}><Pencil size={14} /></button>
                <button className="text-text-muted hover:text-red-500 p-1" onClick={() => cursoService.remove(c.id)}><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={cls("badge", statusColor(c.status))}>{statusLabel(c.status)}</span>
              <Badge>{c.categoria}</Badge>
              {c.cargaHoraria > 0 && <Badge>{c.cargaHoraria}h</Badge>}
            </div>
            <ProgressBar value={progressoCurso(c.id)} />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-text-muted">{progressoCurso(c.id)}% concluído</span>
              {c.link && (
                <a href={c.link} target="_blank" rel="noreferrer" className="text-xs text-brand flex items-center gap-1">
                  Acessar <ExternalLink size={12} />
                </a>
              )}
            </div>
            <button className="btn btn-secondary w-full justify-center mt-3" onClick={() => navigate(`/cursos/${c.id}`)}>
              Ver módulos e aulas
            </button>
          </Card>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "new" ? "Novo curso" : "Editar curso"} wide>
        <CursoForm curso={modal !== "new" ? (modal as Curso) ?? undefined : undefined} onClose={() => setModal(null)} />
      </Modal>
    </div>
  );
}
