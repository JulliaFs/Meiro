import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";

export const useAnos = () => useLiveQuery(() => db.anos.orderBy("numero").toArray(), [], []);
export const useFases = (anoId?: string) =>
  useLiveQuery(
    () => (anoId ? db.fases.where("anoId").equals(anoId).sortBy("numero") : db.fases.orderBy("numero").toArray()),
    [anoId],
    []
  );
export const useFase = (faseId?: string) => useLiveQuery(() => (faseId ? db.fases.get(faseId) : undefined), [faseId]);
export const useCapitulos = (faseId?: string) =>
  useLiveQuery(
    () => (faseId ? db.capitulos.where("faseId").equals(faseId).sortBy("numero") : db.capitulos.orderBy("numero").toArray()),
    [faseId],
    []
  );
export const useAreas = () => useLiveQuery(() => db.areas.toArray(), [], []);
export const useCursos = () => useLiveQuery(() => db.cursos.toArray(), [], []);
export const useCurso = (cursoId?: string) => useLiveQuery(() => (cursoId ? db.cursos.get(cursoId) : undefined), [cursoId]);
export const useModulos = (cursoId?: string) =>
  useLiveQuery(
    () => (cursoId ? db.modulos.where("cursoId").equals(cursoId).sortBy("numero") : db.modulos.orderBy("numero").toArray()),
    [cursoId],
    []
  );
export const useAulas = (moduloId?: string) =>
  useLiveQuery(
    () => (moduloId ? db.aulas.where("moduloId").equals(moduloId).sortBy("numero") : db.aulas.orderBy("numero").toArray()),
    [moduloId],
    []
  );
export const useCertificados = () => useLiveQuery(() => db.certificados.toArray(), [], []);
export const useMateriais = () => useLiveQuery(() => db.materiais.toArray(), [], []);
export const useAnotacoes = () => useLiveQuery(() => db.anotacoes.toArray(), [], []);
export const useFlashcards = () => useLiveQuery(() => db.flashcards.toArray(), [], []);
export const useMetas = () => useLiveQuery(() => db.metas.toArray(), [], []);
export const useHabilidades = () => useLiveQuery(() => db.habilidades.toArray(), [], []);
export const useSessoes = () => useLiveQuery(() => db.sessoes.toArray(), [], []);

// agregados para o dashboard de skills
export const useTodosCapitulos = () => useLiveQuery(() => db.capitulos.toArray(), [], []);
export const useTodasAulas = () => useLiveQuery(() => db.aulas.toArray(), [], []);
export const useTodosModulos = () => useLiveQuery(() => db.modulos.toArray(), [], []);
