import { db } from "../db/database";
import { createCrudService, uid, nowIso } from "./crud";
import type { Arquivo } from "../types";

export const anoService = createCrudService(db.anos);
export const faseService = createCrudService(db.fases);
export const capituloService = createCrudService(db.capitulos);
export const areaService = createCrudService(db.areas);
export const cursoService = createCrudService(db.cursos);
export const moduloService = createCrudService(db.modulos);
export const aulaService = createCrudService(db.aulas);
export const certificadoService = createCrudService(db.certificados);
export const materialService = createCrudService(db.materiais);
export const anotacaoService = createCrudService(db.anotacoes);
export const flashcardService = createCrudService(db.flashcards);
export const metaService = createCrudService(db.metas);
export const habilidadeService = createCrudService(db.habilidades);
export const sessaoService = createCrudService(db.sessoes);

export const arquivoService = {
  async upload(file: File): Promise<Arquivo> {
    const arquivo: Arquivo = {
      id: uid(),
      nome: file.name,
      mime: file.type,
      tamanho: file.size,
      blob: file,
      createdAt: nowIso(),
    };
    await db.arquivos.add(arquivo);
    return arquivo;
  },
  async get(id: string): Promise<Arquivo | undefined> {
    return db.arquivos.get(id);
  },
  async remove(id: string): Promise<void> {
    await db.arquivos.delete(id);
  },
  getObjectUrl(arquivo: Arquivo): string {
    return URL.createObjectURL(arquivo.blob);
  },
};

export * from "./crud";
