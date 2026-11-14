import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Brain, Check, Copy, Lightbulb, TriangleAlert } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { CopiarPrompt } from "./CopiarPrompt";
import { QuizEstudio } from "./QuizEstudio";
import { cls } from "../../lib/utils";
import { promptDuvida, type CapituloEstudio, type ProgressoEstudio } from "../../lib/estudio";

const ESTILOS = [
  "de um jeito bem simples, passo a passo",
  "com outra analogia do dia a dia",
  "com um exemplo de código curto",
  "do jeito que costuma cair em prova",
];

function etapas(p: ProgressoEstudio, n: number) {
  const c = p.capitulos[n] ?? {};
  return { lido: !!c.lido, maos: !!c.maos, quiz: !!p.quizzes[n] };
}

export function CapitulosGrade({ capitulos, progresso, abrir }: { capitulos: CapituloEstudio[]; progresso: ProgressoEstudio; abrir: (n: number) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted max-w-prose">
        Cada capítulo vira: por que importa, o essencial, uma analogia, um exemplo de código, um mini-desafio prático e um quiz de treino.
        Os flashcards entraram nas suas <Link to="/revisoes" className="text-brand">Revisões</Link>. Fast tests e o quiz que vale nota continuam na FIAP.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {capitulos.map((c) => {
          const e = etapas(progresso, c.n);
          const feito = e.lido && e.maos && e.quiz;
          return (
            <button key={c.n} onClick={() => abrir(c.n)} className="card p-4 text-left flex flex-col gap-2 hover:border-brand transition-colors">
              <span className="font-mono text-2xl font-semibold text-brand leading-none">{String(c.n).padStart(2, "0")}</span>
              <span className="text-sm font-medium leading-snug">{c.title}</span>
              <div className="flex gap-1 mt-1" aria-label="Leitura, desafio e quiz">
                {[e.lido, e.maos, e.quiz].map((ok, i) => (
                  <span key={i} className={cls("h-1 flex-1 rounded-full", ok ? "bg-emerald-500" : "bg-surface-2")} />
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                {c.fastTest && <Badge className="bg-brand-light text-brand">fast test</Badge>}
                <Badge>~{c.minutes} min</Badge>
                {feito && <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">feito</Badge>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BlocoCodigo({ codigo }: { codigo: NonNullable<CapituloEstudio["codigo"]> }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden bg-[#0f1220] text-[#e6e8f2]">
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-mono text-[#9aa3c7] border-b border-white/10">
        <span className="truncate">{codigo.titulo} · {codigo.lang}</span>
        <button
          className="flex items-center gap-1 hover:text-white"
          onClick={() => navigator.clipboard.writeText(codigo.code).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 1400); }).catch(() => {})}
        >
          {copiado ? <Check size={12} /> : <Copy size={12} />} {copiado ? "copiado" : "copiar"}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[12.5px] leading-relaxed font-mono">{codigo.code}</pre>
      {codigo.comenta && <p className="px-3 pb-3 text-xs text-[#9aa3c7]">{codigo.comenta}</p>}
    </div>
  );
}

export function CapituloDetalhe({
  cap,
  progresso,
  marcar,
  registrarQuiz,
  voltar,
  irPara,
  total,
}: {
  cap: CapituloEstudio;
  progresso: ProgressoEstudio;
  marcar: (n: number, campo: "lido" | "maos", valor: boolean) => void;
  registrarQuiz: (n: number, acertos: number, total: number) => void;
  voltar: () => void;
  irPara: (n: number) => void;
  total: number;
}) {
  const [duvida, setDuvida] = useState("");
  const [estilo, setEstilo] = useState(ESTILOS[0]);
  const e = etapas(progresso, cap.n);
  const quiz = progresso.quizzes[cap.n];

  return (
    <div className="space-y-6 max-w-3xl">
      <button onClick={voltar} className="text-sm text-text-muted hover:text-text flex items-center gap-1">
        <ArrowLeft size={14} /> Todos os capítulos
      </button>

      <div className="space-y-2">
        <p className="label-mono">Capítulo {cap.n}{cap.fastTest ? " · tem fast test" : ""} · ~{cap.minutes} min</p>
        <h2 className="text-2xl font-semibold tracking-tight">{cap.title}</h2>
        <p className="text-base leading-relaxed text-text-muted">{cap.why}</p>
      </div>

      <Card>
        <CardHeader title="O essencial" />
        <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
          {cap.essencial.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
        <label className="flex items-center gap-2 text-sm mt-4 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 accent-[var(--color-brand)]" checked={e.lido} onChange={(ev) => marcar(cap.n, "lido", ev.target.checked)} />
          Li o essencial
        </label>
      </Card>

      {cap.analogia && (
        <div className="rounded-xl border-l-4 border-amber-400 bg-amber-400/10 px-4 py-3">
          <p className="label-mono flex items-center gap-1"><Lightbulb size={12} /> Pensa assim</p>
          <p className="text-sm leading-relaxed mt-1">{cap.analogia}</p>
        </div>
      )}

      <div className="space-y-2">
        <p className="section-title">Conceitos</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {cap.conceitos.map((t) => (
            <div key={t.termo} className="rounded-lg bg-surface-2 px-3 py-2">
              <p className="font-mono text-xs text-brand">{t.termo}</p>
              <p className="text-sm mt-0.5">{t.explica}</p>
            </div>
          ))}
        </div>
      </div>

      {cap.codigo?.code && (
        <div className="space-y-2">
          <p className="section-title">Na prática</p>
          <BlocoCodigo codigo={cap.codigo} />
        </div>
      )}

      {cap.pegadinhas && cap.pegadinhas.length > 0 && (
        <div className="space-y-2">
          <p className="section-title">Pegadinhas</p>
          {cap.pegadinhas.map((p, i) => (
            <p key={i} className="text-sm rounded-lg bg-amber-500/10 px-3 py-2 flex gap-2">
              <TriangleAlert size={14} className="text-amber-500 shrink-0 mt-0.5" /> {p}
            </p>
          ))}
        </div>
      )}

      {cap.maos && (
        <div className="rounded-xl border-2 border-dashed border-brand p-4 space-y-3 bg-surface">
          <p className="label-mono">Mão na massa</p>
          <p className="section-title">{cap.maos.titulo}</p>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm">
            {cap.maos.passos.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
          {cap.maos.pronto_quando && <p className="text-sm"><b>Pronto quando:</b> {cap.maos.pronto_quando}</p>}
          {cap.maos.dica && (
            <details className="text-sm">
              <summary className="cursor-pointer text-brand">Travou? Dica</summary>
              <p className="mt-1 text-text-muted">{cap.maos.dica}</p>
            </details>
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="h-4 w-4 accent-[var(--color-brand)]" checked={e.maos} onChange={(ev) => marcar(cap.n, "maos", ev.target.checked)} />
            Fiz o desafio
          </label>
        </div>
      )}

      {cap.quiz.length > 0 && (
        <Card>
          <CardHeader
            title="Quiz de treino"
            subtitle={quiz ? `Melhor resultado: ${quiz.melhor} de ${quiz.total}. Não vale nota.` : "No estilo do fast test. Não vale nota."}
          />
          <QuizEstudio key={cap.n} questoes={cap.quiz} onTerminar={(a, t) => registrarQuiz(cap.n, a, t)} />
        </Card>
      )}

      {cap.gs && (
        <Card>
          <p className="label-mono">Para a Global Solution</p>
          <p className="text-sm mt-1">{cap.gs}</p>
        </Card>
      )}

      <Card className="space-y-3">
        <CardHeader title="Não entendeu?" subtitle="Escreva a dúvida, escolha o jeito e cole o prompt no Claude, ChatGPT ou Gemini." />
        <label htmlFor="duvida" className="label-mono block">Sua dúvida</label>
        <textarea id="duvida" className="input min-h-20" value={duvida} onChange={(ev) => setDuvida(ev.target.value)} placeholder="Ex.: qual a diferença entre props e state?" />
        <label htmlFor="estilo" className="label-mono block">Explica…</label>
        <select id="estilo" className="input" value={estilo} onChange={(ev) => setEstilo(ev.target.value)}>
          {ESTILOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <CopiarPrompt rotulo="Copiar prompt da dúvida" gerar={() => promptDuvida(cap, duvida.trim(), estilo)} />
      </Card>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        {cap.n > 1 ? (
          <button className="btn btn-secondary" onClick={() => irPara(cap.n - 1)}><ArrowLeft size={14} /> Capítulo {cap.n - 1}</button>
        ) : <span />}
        {cap.n < total ? (
          <button className="btn btn-primary" onClick={() => irPara(cap.n + 1)}>Capítulo {cap.n + 1} <ArrowRight size={14} /></button>
        ) : (
          <Link className="btn btn-primary" to="/revisoes"><Brain size={14} /> Revisar flashcards</Link>
        )}
      </div>
    </div>
  );
}
