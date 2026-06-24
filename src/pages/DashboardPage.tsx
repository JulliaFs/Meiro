import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame, BookOpen, Award, GraduationCap, Clock, CheckCircle2, Sparkles,
  FileText, NotebookPen, Layers, CircleDot,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardHeader } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Badge } from "../components/ui/Badge";
import { MetricCard } from "../components/ui/MetricCard";
import { EmptyState } from "../components/ui/EmptyState";
import {
  useAnotacoes,
  useCertificados,
  useCursos,
  useFases,
  useFlashcards,
  useSessoes,
  useTodasAulas,
  useTodosCapitulos,
  useTodosModulos,
} from "../hooks/useLiveData";
import { todayIso } from "../lib/utils";
import { categoriaStyle } from "../lib/categories";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const META_SEMANAL_HORAS = 10;

export default function DashboardPage() {
  const fases = useFases();
  const capitulos = useTodosCapitulos();
  const cursos = useCursos();
  const modulos = useTodosModulos();
  const aulas = useTodasAulas();
  const certificados = useCertificados();
  const sessoes = useSessoes();
  const flashcards = useFlashcards();
  const anotacoes = useAnotacoes();

  const hoje = todayIso();
  const dataFmt = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  const capituloAtual = capitulos?.find((c) => c.status === "em_andamento");
  const faseAtual = fases?.find((f) => f.id === capituloAtual?.faseId) ?? fases?.[0];
  const cursosEmAndamento = cursos?.filter((c) => c.status === "em_andamento") ?? [];
  const revisoesHoje = flashcards?.filter((f) => !f.proximaRevisao || f.proximaRevisao <= hoje) ?? [];
  const capitulosPendentes = capitulos?.filter((c) => c.status !== "concluido") ?? [];

  function progressoCurso(cursoId: string) {
    const modIds = (modulos ?? []).filter((m) => m.cursoId === cursoId).map((m) => m.id);
    const aulasCurso = (aulas ?? []).filter((a) => modIds.includes(a.moduloId));
    if (aulasCurso.length === 0) return 0;
    return Math.round((aulasCurso.filter((a) => a.status === "concluido").length / aulasCurso.length) * 100);
  }

  const horasTotais = useMemo(() => (sessoes ?? []).reduce((acc, s) => acc + s.minutos, 0) / 60, [sessoes]);

  const { horasSemanaAtual, horasSemanaAnterior } = useMemo(() => {
    const agora = new Date();
    const inicioSemana = new Date(agora);
    inicioSemana.setDate(agora.getDate() - agora.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    const inicioSemanaAnterior = new Date(inicioSemana);
    inicioSemanaAnterior.setDate(inicioSemana.getDate() - 7);

    let atual = 0;
    let anterior = 0;
    (sessoes ?? []).forEach((s) => {
      const d = new Date(s.data);
      if (d >= inicioSemana) atual += s.minutos;
      else if (d >= inicioSemanaAnterior && d < inicioSemana) anterior += s.minutos;
    });
    return { horasSemanaAtual: atual / 60, horasSemanaAnterior: anterior / 60 };
  }, [sessoes]);

  const deltaSemanal = horasSemanaAnterior > 0 ? Math.round(((horasSemanaAtual - horasSemanaAnterior) / horasSemanaAnterior) * 100) : 0;
  const pctMetaSemanal = Math.min(100, Math.round((horasSemanaAtual / META_SEMANAL_HORAS) * 100));

  const streak = useMemo(() => {
    if (!sessoes) return 0;
    const dias = new Set(sessoes.map((s) => s.data));
    let count = 0;
    const cursor = new Date();
    while (true) {
      const iso = cursor.toISOString().slice(0, 10);
      if (dias.has(iso)) {
        count++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
    return count;
  }, [sessoes]);

  const chartSemana = useMemo(() => {
    if (!sessoes) return [];
    const last14 = [...sessoes].sort((a, b) => a.data.localeCompare(b.data)).slice(-14);
    return last14.map((s) => ({
      dia: new Date(s.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      horas: +(s.minutos / 60).toFixed(1),
    }));
  }, [sessoes]);

  const capitulosConcluidos = capitulos?.filter((c) => c.status === "concluido").length ?? 0;
  const totalCapitulos = capitulos?.length ?? 0;

  // tarefas do dia: derivadas de dados reais (capítulo em andamento, fast test pendente, revisões, cursos)
  const tarefasHoje = useMemo(() => {
    const tarefas: { id: string; label: string; done: boolean; to: string }[] = [];
    if (capituloAtual) {
      tarefas.push({ id: "cap", label: `Estudar ${capituloAtual.nome}`, done: false, to: "/faculdade" });
      if (capituloAtual.notaFastTest === undefined) {
        tarefas.push({ id: "fast", label: "Fazer Fast Test do capítulo atual", done: false, to: "/faculdade" });
      }
    }
    if (revisoesHoje.length > 0) {
      tarefas.push({ id: "rev", label: `Revisar ${revisoesHoje.length} flashcard(s)`, done: false, to: "/revisoes" });
    }
    cursosEmAndamento.slice(0, 2).forEach((c) => {
      tarefas.push({ id: `curso-${c.id}`, label: `Continuar curso ${c.nome}`, done: false, to: `/cursos/${c.id}` });
    });
    return tarefas;
  }, [capituloAtual, revisoesHoje, cursosEmAndamento]);

  // timeline de atividades recentes a partir de timestamps reais
  const atividades = useMemo(() => {
    const itens: { id: string; label: string; icon: typeof CheckCircle2; data: string; cor: string }[] = [];
    capitulos?.forEach((c) => {
      if (c.status === "concluido") itens.push({ id: `c-${c.id}`, label: `Capítulo concluído: ${c.nome}`, icon: CheckCircle2, data: c.updatedAt, cor: categoriaStyle("faculdade").color });
    });
    aulas?.forEach((a) => {
      if (a.status === "concluido") itens.push({ id: `a-${a.id}`, label: `Aula concluída: ${a.nome}`, icon: CheckCircle2, data: a.updatedAt, cor: categoriaStyle("cursos").color });
    });
    cursos?.forEach((c) => {
      itens.push({ id: `cu-${c.id}`, label: `Curso iniciado: ${c.nome}`, icon: BookOpen, data: c.createdAt, cor: categoriaStyle("cursos").color });
    });
    certificados?.forEach((c) => {
      itens.push({ id: `ce-${c.id}`, label: `Certificado adicionado: ${c.nome}`, icon: Award, data: c.createdAt, cor: categoriaStyle("certificados").color });
    });
    anotacoes?.forEach((a) => {
      itens.push({ id: `n-${a.id}`, label: `Anotação criada: ${a.titulo}`, icon: NotebookPen, data: a.createdAt, cor: "var(--color-brand)" });
    });
    return itens.sort((a, b) => b.data.localeCompare(a.data)).slice(0, 8);
  }, [capitulos, aulas, cursos, certificados, anotacoes]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-text">{greeting()}, Estudante 👋</h1>
        <p className="text-text-muted text-sm mt-1 capitalize">{dataFmt}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Horas estudadas" value={`${horasSemanaAtual.toFixed(1)}h`} icon={Clock} deltaPct={deltaSemanal} deltaLabel="vs semana passada" />
        <MetricCard label="Capítulos concluídos" value={`${capitulosConcluidos}/${totalCapitulos}`} icon={CheckCircle2} color={categoriaStyle("faculdade").color} bg={categoriaStyle("faculdade").backgroundColor} />
        <MetricCard label="Cursos concluídos" value={cursos?.filter((c) => c.status === "concluido").length ?? 0} icon={BookOpen} color={categoriaStyle("cursos").color} bg={categoriaStyle("cursos").backgroundColor} />
        <MetricCard label="Certificados" value={certificados?.length ?? 0} icon={Award} color={categoriaStyle("certificados").color} bg={categoriaStyle("certificados").backgroundColor} />
        <MetricCard label="Horas totais" value={`${horasTotais.toFixed(1)}h`} icon={GraduationCap} />
        <MetricCard label="Sequência de estudos" value={`${streak} dias`} icon={Flame} color="#ea580c" bg="rgba(234,88,12,0.12)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="🎯 Hoje" subtitle="O que você precisa fazer agora" />
          {tarefasHoje.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={24} />}
              title="Nada pendente por agora"
              description="Inicie um capítulo da faculdade ou um curso para ver suas tarefas do dia aqui."
              action={<Link to="/faculdade" className="btn btn-primary">Ir para faculdade</Link>}
            />
          ) : (
            <>
              <div className="space-y-2 mb-3">
                {tarefasHoje.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link to={t.to} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-surface-2 transition-colors">
                      <CircleDot size={15} className="text-brand shrink-0" />
                      <span>{t.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                <span>Progresso do dia</span>
                <span>0/{tarefasHoje.length}</span>
              </div>
              <ProgressBar value={0} />
            </>
          )}
        </Card>

        <Card>
          <CardHeader title="📈 Evolução da Semana" />
          <p className="metric-number text-text">{horasSemanaAtual.toFixed(1)}h</p>
          <p className="text-xs text-text-muted mb-3">Meta semanal: {META_SEMANAL_HORAS}h</p>
          <ProgressBar value={pctMetaSemanal} />
          <p className="text-xs text-text-muted mt-1.5">{pctMetaSemanal}% da meta concluída</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Fase atual da faculdade" subtitle={faseAtual?.nome ?? "—"} />
          {faseAtual ? (
            <>
              <p className="text-sm text-text-muted mb-3">{faseAtual.descricao}</p>
              <ProgressBar
                value={
                  totalCapitulos
                    ? Math.round(
                        ((capitulos?.filter((c) => c.faseId === faseAtual.id && c.status === "concluido").length ?? 0) /
                          (capitulos?.filter((c) => c.faseId === faseAtual.id).length || 1)) *
                          100
                      )
                    : 0
                }
                color={categoriaStyle("faculdade").color}
              />
              <Link to="/faculdade" className="text-sm text-brand font-medium mt-3 inline-block">Ver faculdade →</Link>
            </>
          ) : (
            <EmptyState icon={<GraduationCap size={22} />} title="Nenhuma fase cadastrada" action={<Link to="/faculdade" className="btn btn-primary">Cadastrar fase</Link>} />
          )}
        </Card>

        <Card>
          <CardHeader title="Cursos em andamento" />
          {cursosEmAndamento.length === 0 ? (
            <EmptyState icon={<BookOpen size={22} />} title="Nenhum curso em andamento" action={<Link to="/cursos" className="btn btn-primary">Criar Curso</Link>} />
          ) : (
            <div className="space-y-3">
              {cursosEmAndamento.slice(0, 3).map((c) => (
                <div key={c.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">{c.nome}</span>
                    <span className="text-text-muted">{progressoCurso(c.id)}%</span>
                  </div>
                  <ProgressBar value={progressoCurso(c.id)} color={categoriaStyle("cursos").color} />
                </div>
              ))}
            </div>
          )}
          <Link to="/cursos" className="text-sm text-brand font-medium mt-3 inline-block">Ver cursos →</Link>
        </Card>

        <Card>
          <CardHeader title="Capítulos pendentes" />
          {capitulosPendentes.length === 0 ? (
            <EmptyState icon={<Layers size={22} />} title="Tudo em dia por aqui" />
          ) : (
            <div className="space-y-2">
              {capitulosPendentes.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{c.nome}</span>
                  <Badge style={categoriaStyle("faculdade")}>{c.status === "em_andamento" ? "Em andamento" : "Pendente"}</Badge>
                </div>
              ))}
            </div>
          )}
          <Link to="/faculdade" className="text-sm text-brand font-medium mt-3 inline-block">Ver faculdade →</Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Horas estudadas (últimos 14 dias)" />
          {chartSemana.length === 0 ? (
            <EmptyState icon={<Clock size={22} />} title="Ainda sem dados de estudo" description="Registre sessões de estudo para visualizar sua evolução aqui." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartSemana}>
                <defs>
                  <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="dia" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
                <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="horas" stroke="var(--color-brand)" fill="url(#colorHoras)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader title="🕐 Atividades Recentes" />
          {atividades.length === 0 ? (
            <EmptyState icon={<FileText size={22} />} title="Nenhuma atividade ainda" description="Conclua capítulos, aulas ou crie anotações para ver seu histórico aqui." />
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {atividades.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--color-surface-2)", color: a.cor }}>
                    <a.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{a.label}</p>
                    <p className="text-2xs text-text-muted">{new Date(a.data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
