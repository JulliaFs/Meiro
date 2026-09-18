import { createSupabaseCrudService } from "./supabaseCrud";
import { arquivoService } from "./arquivoService";
import { todayIso } from "../lib/utils";
import type {
  Ano, Fase, Capitulo, AreaConhecimento, Curso, Modulo, Aula,
  Certificado, Material, Anotacao, Flashcard, Meta, Habilidade, SessaoEstudo, TipoMaterial,
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

export function tipoDoArquivo(file: File): TipoMaterial {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return "imagem";
  return "docx";
}

/** Envia o arquivo e cria o material. Se o registro falhar, apaga o arquivo para não deixar lixo no Storage. */
export async function criarMaterialComArquivo(
  file: File,
  dados: Partial<Omit<Material, "id" | "createdAt" | "updatedAt" | "arquivoId">> = {}
): Promise<Material> {
  const arquivo = await arquivoService.upload(file);
  try {
    return await materialService.create({
      titulo: file.name,
      tipo: tipoDoArquivo(file),
      tags: [],
      dataUpload: todayIso(),
      ...dados,
      arquivoId: arquivo.path,
    });
  } catch (err) {
    await arquivoService.remove(arquivo.path);
    throw err;
  }
}

export async function excluirMaterial(material: Material): Promise<void> {
  await materialService.remove(material.id);
  if (material.arquivoId) await arquivoService.remove(material.arquivoId);
}

export { arquivoService };
export { uid } from "./supabaseCrud";
