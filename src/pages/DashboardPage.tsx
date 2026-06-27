import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock, CheckCircle2, Sparkles, FileText, NotebookPen, BookOpen,
  CircleDot, Target, TrendingUp, GraduationCap, Award,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardHeader } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
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
  const revisoesAtrasadasOuHoje = flashcards?.filter((f) => !f.proximaRevisao || f.proximaRevisao <= hoje) ?? [];

  function progressoCurso(cursoId: string) {
    const modIds = (modulos ?? []).filter((m) => m.cursoId === cursoId).map((m) => m.id);
    const aulasCurso = (aulas ?? []).filter((a) => modIds.includes(a.moduloId));
    if (aulasCurso.length === 0) return 0;
    return Math.round((aulasCurso.filter((a) => a.status === "concluido").length / aulasCurso.length) * 100);
  }

  function proximaAulaPendente(cursoId: string) {
    const modIds = (modulos ?? []).filter((m) => m.cursoId === cursoId).map((m) => m.id);
    return (aulas ?? []).find((a) => modIds.includes(a.moduloId) && a.status !== "concluido");
  }

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

  const chartSemana = useMemo(() => {
    if (!sessoes) return [];
    const last14 = [...sessoes].sort((a, b) => a.data.localeCompare(b.data)).slice(-14);
    return last14.map((s) => ({
      dia: new Date(s.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      horas: +(s.minutos / 60).toFixed(1),
    }));
  }, [sessoes]);

  // tarefas do dia: derivadas de dados reais, todas acionáveis
  const tarefasHoje = useMemo(() => {
    const tarefas: { id: string; label: string; to: string }[] = [];

    if (capituloAtual) {
      tarefas.push({ id: "cap", label: `Estudar: ${capituloAtual.nome}`, to: "/faculdade" });
      if (capituloAtual.notaFastTest === undefined) {
        tarefas.push({ id: "fast", label: "Fazer Fast Test do capítulo atual", to: "/faculdade" });
      }
    }

    if (revisoesAtrasadasOuHoje.length > 0) {
      tarefas.push({ id: "rev", label: `Revisar ${revisoesAtrasadasOuHoje.length} flashcard(s)`, to: "/revisoes" });
    }

    cursosEmAndamento.slice(0, 2).forEach((c) => {
      const aulaPendente = proximaAulaPendente(c.id);
      tarefas.push(
        aulaPendente
          ? { id: `curso-${c.id}`, label: `Aula pendente: ${aulaPendente.nome} (${c.nome})`, to: `/cursos/${c.id}` }
          : { id: `curso-${c.id}`, label: `Continuar curso: ${c.nome}`, to: `/cursos/${c.id}` }
      );
    });

    return tarefas;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capituloAtual, revisoesAtrasadasOuHoje, cursosEmAndamento, modulos, aulas]);

  // timeline de atividades recentes a partir de timestamps reais
  const atividades = useMemo(() => {
    const itens: { id: string; label: string; icon: typeof CheckCircle2; data: string }[] = [];
    capitulos?.forEach((c) => {
      if (c.status === "concluido") itens.push({ id: `c-${c.id}`, label: `Capítulo concluído: ${c.nome}`, icon: CheckCircle2, data: c.updatedAt });
    });
    aulas?.forEach((a) => {
      if (a.status === "concluido") itens.push({ id: `a-${a.id}`, label: `Aula concluída: ${a.nome}`, icon: CheckCircle2, data: a.updatedAt });
    });
    anotacoes?.forEach((a) => {
      itens.push({ id: `n-${a.id}`, label: `Anotação criada: ${a.titulo}`, icon: NotebookPen, data: a.createdAt });
    });
    certificados?.forEach((c) => {
      itens.push({ id: `ce-${c.id}`, label: `Certificado adicionado: ${c.nome}`, icon: Award, data: c.createdAt });
    });
    return itens.sort((a, b) => b.data.localeCompare(a.data)).slice(0, 6);
  }, [capitulos, aulas, anotacoes, certificados]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER — saudação + data, somente */}
      <div>
        <h1 className="page-title text-text">{greeting()}, Estudante</h1>
        <p className="text-text-muted text-sm mt-1 capitalize">{dataFmt}</p>
      </div>

      {/* KPI principal único — largura total */}
      <Card className="card-dark p-5">
        <p className="label-mono text-white/60 mb-1.5 flex items-center gap-1.5">
          <TrendingUp size={12} /> Horas estudadas · semana
        </p>
        <div className="flex items-baseline gap-2">
          <p className="metric-number text-white">{horasSemanaAtual.toFixed(1)}h</p>
          <span className="text-xs text-white/60">meta {META_SEMANAL_HORAS}h</span>
        </div>
        <div className="h-2 rounded-full bg-white/15 overflow-hidden mt-2">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pctMetaSemanal}%` }} />
        </div>
        <p className="text-xs text-white/60 mt-1.5">
          {pctMetaSemanal}% da meta {deltaSemanal !== 0 && <span>· {deltaSemanal > 0 ? "+" : ""}{deltaSemanal}% vs. semana passada</span>}
        </p>
      </Card>

      {/* 2. HOJE — prioridade máxima, tudo acionável */}
      <Card>
        <CardHeader title="Hoje" subtitle="O que você precisa fazer agora" action={<Target size={16} className="text-text-muted" />} />
        {tarefasHoje.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={24} />}
            title="Nada pendente por agora"
            description="Inicie um capítulo da faculdade ou um curso para ver suas tarefas do dia aqui."
            action={<Link to="/faculdade" className="btn btn-primary">Ir para faculdade</Link>}
          />
        ) : (
          <div className="space-y-1">
            {tarefasHoje.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={t.to} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-surface-2 transition-colors">
                  <CircleDot size={15} className="text-brand shrink-0" />
                  <span>{t.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. PROGRESSO SEMANAL — gráfico simples, sem excesso de métricas */}
      <Card>
        <CardHeader title="Progresso semanal" subtitle="Horas estudadas nos últimos 14 dias" />
        {chartSemana.length === 0 ? (
          <EmptyState icon={<Clock size={22} />} title="Ainda sem dados de estudo" description="Registre sessões de estudo para visualizar sua evolução aqui." />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
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

      {/* 4. CONTEXTO ATUAL — fase atual + cursos ativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="flex flex-col">
          <CardHeader title="Fase atual da faculdade" />
          <div className="flex-1 flex flex-col">
            {faseAtual ? (
              <>
                <p className="text-sm font-medium text-text mb-1">{faseAtual.nome}</p>
                <p className="text-sm text-text-muted mb-3">{faseAtual.descricao}</p>
                <ProgressBar
                  value={
                    capitulos && capitulos.length
                      ? Math.round(
                          ((capitulos.filter((c) => c.faseId === faseAtual.id && c.status === "concluido").length) /
                            (capitulos.filter((c) => c.faseId === faseAtual.id).length || 1)) *
                            100
                        )
                      : 0
                  }
                />
              </>
            ) : (
              <EmptyState icon={<GraduationCap size={22} />} title="Nenhuma fase cadastrada" action={<Link to="/faculdade" className="btn btn-primary">Cadastrar fase</Link>} />
            )}
          </div>
          <Link to="/faculdade" className="text-sm text-brand font-medium mt-3 inline-block">Ver faculdade →</Link>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="Cursos em andamento" />
          <div className="flex-1 flex flex-col">
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
                    <ProgressBar value={progressoCurso(c.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link to="/cursos" className="text-sm text-brand font-medium mt-3 inline-block">Ver cursos →</Link>
        </Card>
      </div>

      {/* 5. ATIVIDADES RECENTES — timeline simples */}
      <Card>
        <CardHeader title="Atividades recentes" action={<Clock size={16} className="text-text-muted" />} />
        {atividades.length === 0 ? (
          <EmptyState icon={<FileText size={22} />} title="Nenhuma atividade ainda" description="Conclua capítulos, aulas ou crie anotações para ver seu histórico aqui." />
        ) : (
          <div className="space-y-3">
            {atividades.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-brand-light text-brand flex items-center justify-center shrink-0">
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
  );
}
