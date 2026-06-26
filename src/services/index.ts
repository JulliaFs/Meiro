import { createSupabaseCrudService } from "./supabaseCrud";
import type {
  Ano, Fase, Capitulo, AreaConhecimento, Curso, Modulo, Aula,
  Certificado, Material, Anotacao, Flashcard, Meta, Habilidade, SessaoEstudo,
} from "../types";

export const anoService = createSupabaseCrudService<Ano>("anos");
export const faseService = createSupabaseCrudService<Fase>("fases");
export const capituloService = createSupabaseCrudService<Capitulo>("capitulos");
export const areaService = createSupabaseCrudService<AreaConhecimento>("areas");
export const cursoService = createSupabaseCrudService<Curso>("cursos");
export const moduloService = createSupabaseCrudService<Modulo>("modulos");
export const aulaService = createSupabaseCrudService<Aula>("aulas");
export const certificadoService = createSupabaseCrudService<Certificado>("certificados");
export const materialService = createSupabaseCrudService<Material>("materiais");
export const anotacaoService = createSupabaseCrudService<Anotacao>("anotacoes");
export const flashcardService = createSupabaseCrudService<Flashcard>("flashcards");
export const metaService = createSupabaseCrudService<Meta>("metas");
export const habilidadeService = createSupabaseCrudService<Habilidade>("habilidades");
export const sessaoService = createSupabaseCrudService<SessaoEstudo>("sessoes");

export { arquivoService } from "./arquivoService";
export { uid } from "./supabaseCrud";
