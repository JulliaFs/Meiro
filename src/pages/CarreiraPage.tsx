import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, Clock, BookOpen, Award, Layers, Flame, BookMarked } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { Card, CardHeader } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { MetricCard } from "../components/ui/MetricCard";
import {
  useCertificados,
  useFases,
  useHabilidades,
  useSessoes,
  useTodasAulas,
  useTodosCapitulos,
  useTodosModulos,
  useCursos,
} from "../hooks/useLiveData";
import { habilidadeService } from "../services";
import { computeSkillStats } from "../lib/skillsStats";
import { categoriaStyle } from "../lib/categories";
import type { Habilidade } from "../types";

function HabilidadeForm({ hab, onClose }: { hab?: Habilidade; onClose: () => void }) {
  const [nome, setNome] = useState(hab?.nome ?? "");
  const [nivelAtual, setNivelAtual] = useState(hab?.nivelAtual ?? 0);
  const [meta, setMeta] = useState(hab?.meta ?? 100);

  async function salvar() {
    if (!nome.trim()) return;
    if (hab) await habilidadeService.update(hab.id, { nome, nivelAtual, meta });
    else await habilidadeService.create({ nome, nivelAtual, meta });
    onClose();
  }

  return (
    <div className="space-y-3">
      <input className="input" placeholder="Nome da habilidade" value={nome} onChange={(e) => setNome(e.target.value)} />
      <label className="text-sm block">
        Nível atual ({nivelAtual}%)
        <input type="range" min={0} max={100} value={nivelAtual} onChange={(e) => setNivelAtual(+e.target.value)} className="w-full" />
      </label>
      <label className="text-sm block">
        Meta ({meta}%)
        <input type="range" min={0} max={100} value={meta} onChange={(e) => setMeta(+e.target.value)} className="w-full" />
      </label>
      <button className="btn btn-primary w-full justify-center" onClick={salvar}>Salvar</button>
    </div>
  );
}

export default function CarreiraPage() {
  const habilidades = useHabilidades();
  const capitulos = useTodosCapitulos();
  const aulas = useTodasAulas();
  const modulos = useTodosModulos();
  const cursos = useCursos();
  const fases = useFases();
  const certificados = useCertificados();
  const sessoes = useSessoes();
  const [modal, setModal] = useState<"new" | Habilidade | null>(null);

  const streak = useMemo(() => {
    if (!sessoes) return 0;
    const dias = new Set(sessoes.map((s) => s.data));
    let count = 0;
    const cursor = new Date();
    while (true) {
      const iso = cursor.toISOString().slice(0, 10);
      if (dias.has(iso)) { count++; cursor.setDate(cursor.getDate() - 1); } else break;
    }
    return count;
  }, [sessoes]);

  const horasAcumuladas = useMemo(() => (sessoes ?? []).reduce((acc, s) => acc + s.minutos, 0) / 60, [sessoes]);
  const conteudosEstudados =
    (capitulos?.filter((c) => c.status === "concluido").length ?? 0) + (aulas?.filter((a) => a.status === "concluido").length ?? 0);

  const stats = useMemo(
    () =>
      computeSkillStats({
        capitulos: capitulos ?? [],
        aulas: aulas ?? [],
        modulos: modulos ?? [],
        cursos: cursos ?? [],
        fases: fases ?? [],
        certificados: certificados ?? [],
        habilidades: habilidades ?? [],
      }),
    [capitulos, aulas, modulos, cursos, fases, certificados, habilidades]
  );

  const radarData = stats.map((s) => ({ nome: s.nome, atual: s.nivelAtual, meta: s.meta }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Mapa de Carreira</h1>
          <p className="text-text-muted text-sm mt-1">
            Objetivo: trabalhar com desenvolvimento de software. Skills consolidadas a partir da faculdade, cursos e certificados.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("new")}><Plus size={16} /> Nova habilidade / meta</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Dias consecutivos" value={`${streak} 🔥`} icon={Flame} color="#ea580c" bg="rgba(234,88,12,0.12)" />
        <MetricCard label="Conteúdos estudados" value={conteudosEstudados} icon={BookMarked} color={categoriaStyle("skills").color} bg={categoriaStyle("skills").backgroundColor} />
        <MetricCard label="Certificados" value={certificados?.length ?? 0} icon={Award} color={categoriaStyle("certificados").color} bg={categoriaStyle("certificados").backgroundColor} />
        <MetricCard label="Horas acumuladas" value={`${horasAcumuladas.toFixed(1)}h`} icon={Clock} />
      </div>

      <Card>
        <CardHeader title="Radar de competências" subtitle="Nível atual x meta definida" />
        {radarData.length === 0 ? (
          <EmptyState title="Sem skills ainda" description="Vincule skills a capítulos da faculdade ou aulas de cursos para começar." />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="nome" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <Radar name="Atual" dataKey="atual" stroke="var(--color-brand)" fill="var(--color-brand)" fillOpacity={0.35} />
              <Radar name="Meta" dataKey="meta" stroke="var(--color-text-muted)" fill="transparent" strokeDasharray="4 4" />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div>
        <h2 className="font-semibold mb-3">Conteúdos estudados por skill</h2>
        {stats.length === 0 && (
          <EmptyState
            icon={<Layers size={24} />}
            title="Nenhuma skill registrada ainda"
            description="Vincule skills a capítulos concluídos da faculdade ou aulas concluídas de cursos para vê-las aqui."
          />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s, i) => {
            const hab = habilidades?.find((h) => h.nome.toLowerCase() === s.nome.toLowerCase());
            const cor = categoriaStyle("skills");
            return (
              <motion.div key={s.nome} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cor.backgroundColor, color: cor.color }}>
                        <BookMarked size={15} />
                      </div>
                      <CardHeader title={s.nome} subtitle={`${s.conteudosEstudados} conteúdo(s) estudado(s)`} />
                    </div>
                    {hab && (
                      <div className="flex gap-1 shrink-0">
                        <button className="text-text-muted hover:text-text p-1" onClick={() => setModal(hab)}><Pencil size={14} /></button>
                        <button className="text-text-muted hover:text-red-500 p-1" onClick={() => habilidadeService.remove(hab.id)}><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-text-muted mb-1">
                    <span>Nível atual</span><span>{s.nivelAtual}%</span>
                  </div>
                  <ProgressBar value={s.nivelAtual} color={cor.color} />
                  <div className="flex gap-3 mt-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Clock size={12} /> {s.horasEstudadas.toFixed(1)}h</span>
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {s.cursosRelacionados.length} curso(s)</span>
                    <span className="flex items-center gap-1"><Award size={12} /> {s.certificadosRelacionados.length} certificado(s)</span>
                  </div>
                  {s.fasesRelacionadas.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">{s.fasesRelacionadas.map((f) => <Badge key={f}>{f}</Badge>)}</div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "new" ? "Nova habilidade / meta" : "Editar habilidade"}>
        <HabilidadeForm hab={modal !== "new" ? (modal as Habilidade) ?? undefined : undefined} onClose={() => setModal(null)} />
      </Modal>
    </div>
  );
}
