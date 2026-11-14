import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { notificarErro } from "../store/useToastStore";
import { useSupabaseTable } from "../hooks/useSupabaseTable";
import type { BaseEntity } from "../types";

// O conteúdo do Estúdio vive na tabela `estudio` (uma linha por bloco, só do dono, via RLS).
// O repositório é público, então nenhum material de aula fica no código.

export interface EstudioLinha extends BaseEntity {
  chave: string;
  tipo: "capitulo" | "gs" | "plano" | "progresso";
  ordem: number;
  dados: unknown;
}

export interface CapituloEstudio {
  n: number;
  title: string;
  fastTest: boolean;
  minutes: number;
  why: string;
  essencial: string[];
  analogia?: string;
  conceitos: { termo: string; explica: string }[];
  codigo?: { titulo: string; lang: string; code: string; comenta?: string };
  maos?: { titulo: string; passos: string[]; pronto_quando?: string; dica?: string };
  quiz: QuestaoEstudio[];
  pegadinhas?: string[];
  gs?: string;
}

export interface QuestaoEstudio {
  q: string;
  opts: string[];
  a: number;
  why?: string;
}

export interface KitGs {
  prazo: string;
  resumo: string;
  criterios: { id: string; titulo: string; texto: string }[];
  checklistFinal: { id: string; texto: string }[];
  slides: { titulo: string; texto: string }[];
  datasets: { nome: string; uso: string }[];
  insightFormula: string;
  insightExemplo: string;
  uml: string[];
  pitch: { tempo: string; texto: string }[];
  pitchDica: string;
}

export interface TarefaPlano {
  id: string;
  titulo: string;
  texto: string;
  /** "cap:3", "gs", "revisoes" ou uma URL externa */
  link: string | null;
}

export interface PlanoEstudio {
  dias: { data: string; horas: string; foco: string; tarefas: TarefaPlano[] }[];
  prazos: { rotulo: string; em: string }[];
}

export interface ProgressoEstudio {
  feitas: Record<string, boolean>;
  gs: Record<string, boolean>;
  capitulos: Record<string, { lido?: boolean; maos?: boolean }>;
  quizzes: Record<string, { melhor: number; total: number }>;
  ideia?: string;
}

const PROGRESSO_VAZIO: ProgressoEstudio = { feitas: {}, gs: {}, capitulos: {}, quizzes: {} };

/**
 * Carrega o Estúdio e mantém o progresso local, salvando no banco com atraso curto.
 * O progresso não passa pelo dataBus: refazer o fetch a cada clique zeraria o quiz em andamento.
 */
export function useEstudio() {
  const linhas = useSupabaseTable<EstudioLinha>("estudio", (q) => q.order("ordem"));
  const [progresso, setProgresso] = useState<ProgressoEstudio | null>(null);
  const linhaProgresso = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendente = useRef<ProgressoEstudio | null>(null);

  const conteudo = useMemo(() => {
    if (!linhas) return undefined;
    const capitulos = linhas
      .filter((l) => l.tipo === "capitulo")
      .map((l) => l.dados as CapituloEstudio)
      .sort((a, b) => a.n - b.n);
    const gs = linhas.find((l) => l.tipo === "gs")?.dados as KitGs | undefined;
    const plano = linhas.find((l) => l.tipo === "plano")?.dados as PlanoEstudio | undefined;
    return { capitulos, gs, plano };
  }, [linhas]);

  useEffect(() => {
    if (!linhas || progresso) return;
    const linha = linhas.find((l) => l.tipo === "progresso");
    linhaProgresso.current = linha?.id ?? null;
    setProgresso({ ...PROGRESSO_VAZIO, ...((linha?.dados as ProgressoEstudio) ?? {}) });
  }, [linhas, progresso]);

  const gravar = useCallback(async () => {
    const dados = pendente.current;
    if (!dados) return;
    pendente.current = null;
    try {
      if (linhaProgresso.current) {
        const { error } = await supabase.from("estudio").update({ dados }).eq("id", linhaProgresso.current);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("estudio")
          .insert({ chave: "progresso", tipo: "progresso", ordem: 0, dados })
          .select("id")
          .single();
        if (error) throw error;
        linhaProgresso.current = data.id;
      }
    } catch (err) {
      notificarErro("Não foi possível salvar seu progresso", err);
    }
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      void gravar();
    },
    [gravar]
  );

  const atualizar = useCallback(
    (mudar: (p: ProgressoEstudio) => ProgressoEstudio) => {
      setProgresso((atual) => {
        const novo = mudar(atual ?? PROGRESSO_VAZIO);
        pendente.current = novo;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void gravar(), 700);
        return novo;
      });
    },
    [gravar]
  );

  return { carregando: linhas === undefined || progresso === null, conteudo, progresso: progresso ?? PROGRESSO_VAZIO, atualizar };
}

/** Prompt pronto para colar no Claude/ChatGPT/Gemini, no mesmo espírito do Professor IA. */
export function promptDuvida(cap: CapituloEstudio, duvida: string, estilo: string): string {
  return [
    "Você é um tutor paciente de uma aluna do 1º ano de Análise e Desenvolvimento de Sistemas (FIAP, Fase 7, projeto Fintech com Java/Spring Boot, Oracle, React e Next.js). Ela trabalha o dia todo e não gosta de textão.",
    `Explique ${estilo}, em português do Brasil, em no máximo 200 palavras, com um exemplo concreto do Fintech.`,
    "",
    `Capítulo ${cap.n}: ${cap.title}`,
    `Por que importa: ${cap.why}`,
    "Pontos essenciais:",
    ...cap.essencial.map((e) => `- ${e}`),
    "",
    `Minha dúvida: ${duvida || "me explique o essencial deste capítulo de outro jeito."}`,
  ].join("\n");
}

export function promptGs(ideia: string, modo: "avaliar" | "revisar"): string {
  if (modo === "revisar") {
    return [
      "Revise a ortografia, a acentuação, a pontuação e a concordância do texto abaixo, que vai em slides acadêmicos em português do Brasil.",
      'Liste só os erros no formato "trecho errado → correção (motivo curto)". Depois, no máximo 3 sugestões de clareza. Não reescreva o texto inteiro.',
      "",
      ideia,
    ].join("\n");
  }
  return [
    "Estou fazendo a Global Solution da FIAP: propor uma solução CitizenTech para um problema real de um território (cidade, campo ou comunidade).",
    "Critérios da banca: (1) problema, público-alvo e ODS; (2) diagrama de classes UML com os 4 pilares de POO e MVC/DAO; (3) 4 insights cruzando dados do sistema com uma API ou dataset público real; (4) apresentação e pitch de até 3 min; (5) inovação e impacto social; (6) ortografia.",
    "O trabalho precisa ser autoral: NÃO escreva a solução por mim. Me dê 3 pontos fortes, 3 perguntas que a banca faria e eu ainda não respondo, 2 datasets públicos brasileiros que combinam com a ideia e 1 sugestão de classe abstrata com 2 classes filhas para o diagrama.",
    "",
    "Minha ideia:",
    ideia,
  ].join("\n");
}
