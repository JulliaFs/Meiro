import { useSupabaseRow, useSupabaseTable } from "./useSupabaseTable";
import type {
  Ano, Fase, Capitulo, AreaConhecimento, Curso, Modulo, Aula,
  Certificado, Material, Anotacao, Flashcard, Meta, Habilidade, SessaoEstudo,
} from "../types";

export const useAnos = () => useSupabaseTable<Ano>("anos", (q) => q.order("numero"));

export const useFases = (anoId?: string) =>
  useSupabaseTable<Fase>(
    "fases",
    (q) => (anoId ? q.eq("ano_id", anoId).order("numero") : q.order("numero")),
    [anoId]
  );

export const useFase = (faseId?: string) => useSupabaseRow<Fase>("fases", faseId);

export const useCapitulos = (faseId?: string) =>
  useSupabaseTable<Capitulo>(
    "capitulos",
    (q) => (faseId ? q.eq("fase_id", faseId).order("numero") : q.order("numero")),
    [faseId]
  );

export const useAreas = () => useSupabaseTable<AreaConhecimento>("areas");

export const useCursos = () => useSupabaseTable<Curso>("cursos");

export const useCurso = (cursoId?: string) => useSupabaseRow<Curso>("cursos", cursoId);

export const useModulos = (cursoId?: string) =>
  useSupabaseTable<Modulo>(
    "modulos",
    (q) => (cursoId ? q.eq("curso_id", cursoId).order("numero") : q.order("numero")),
    [cursoId]
  );

export const useAulas = (moduloId?: string) =>
  useSupabaseTable<Aula>(
    "aulas",
    (q) => (moduloId ? q.eq("modulo_id", moduloId).order("numero") : q.order("numero")),
    [moduloId]
  );

export const useCertificados = () => useSupabaseTable<Certificado>("certificados");

export const useMateriais = () => useSupabaseTable<Material>("materiais");

export const useAnotacoes = () => useSupabaseTable<Anotacao>("anotacoes");

export const useFlashcards = () => useSupabaseTable<Flashcard>("flashcards");

export const useMetas = () => useSupabaseTable<Meta>("metas");

export const useHabilidades = () => useSupabaseTable<Habilidade>("habilidades");

export const useSessoes = () => useSupabaseTable<SessaoEstudo>("sessoes");

// agregados para o dashboard de skills
export const useTodosCapitulos = () => useSupabaseTable<Capitulo>("capitulos");
export const useTodasAulas = () => useSupabaseTable<Aula>("aulas");
export const useTodosModulos = () => useSupabaseTable<Modulo>("modulos");
