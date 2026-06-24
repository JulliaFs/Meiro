import Dexie, { type Table } from "dexie";
import type {
  Ano,
  Fase,
  Capitulo,
  AreaConhecimento,
  Curso,
  Modulo,
  Aula,
  Certificado,
  Material,
  Arquivo,
  Anotacao,
  Flashcard,
  Meta,
  Habilidade,
  SessaoEstudo,
  Configuracoes,
} from "../types";

/**
 * Camada única de persistência local (IndexedDB via Dexie).
 * Toda a aplicação acessa dados através de src/services/*, nunca diretamente
 * por aqui — isso é o que permite trocar esta classe por um cliente Supabase
 * no futuro sem reescrever telas.
 */
class JuAcademyDB extends Dexie {
  anos!: Table<Ano, string>;
  fases!: Table<Fase, string>;
  capitulos!: Table<Capitulo, string>;
  areas!: Table<AreaConhecimento, string>;
  cursos!: Table<Curso, string>;
  modulos!: Table<Modulo, string>;
  aulas!: Table<Aula, string>;
  certificados!: Table<Certificado, string>;
  materiais!: Table<Material, string>;
  arquivos!: Table<Arquivo, string>;
  anotacoes!: Table<Anotacao, string>;
  flashcards!: Table<Flashcard, string>;
  metas!: Table<Meta, string>;
  habilidades!: Table<Habilidade, string>;
  sessoes!: Table<SessaoEstudo, string>;
  configuracoes!: Table<Configuracoes, string>;

  constructor() {
    super("ju-academy-os");
    // v1 (descontinuada): faculdades/fases/capitulos antigos.
    this.version(1).stores({
      faculdades: "id, nome",
      fases: "id, faculdadeId, ordem",
      capitulos: "id, faseId, status, ordem",
      areas: "id, nome",
      cursos: "id, status, categoria, areaId",
      certificados: "id, area, data",
      materiais: "id, tipo, area, pasta, dataUpload, *tags",
      arquivos: "id, mime",
      anotacoes: "id, pasta, area, materia, *tags",
      flashcards: "id, categoria, area, dificuldade, proximaRevisao",
      metas: "id, categoria, prazo",
      habilidades: "id, nome",
      sessoes: "id, data, areaId",
      configuracoes: "id",
    });

    // v2: faculdade por Ano > Fase > Capítulo, cursos como trilha (Curso > Módulo > Aula), skills livres.
    this.version(2)
      .stores({
        faculdades: null,
        anos: "id, numero",
        fases: "id, anoId, numero, status",
        capitulos: "id, faseId, numero, status, *skills",
        areas: "id, nome",
        cursos: "id, status, categoria",
        modulos: "id, cursoId, numero, status",
        aulas: "id, moduloId, numero, status, *skills",
        certificados: "id, area, data",
        materiais: "id, tipo, area, pasta, dataUpload, origemId, *tags",
        arquivos: "id, mime",
        anotacoes: "id, pasta, area, materia, origemId, anoId, faseId, cursoId, *tags, *skills",
        flashcards: "id, categoria, area, dificuldade, proximaRevisao",
        metas: "id, categoria, prazo",
        habilidades: "id, nome",
        sessoes: "id, data, areaId",
        configuracoes: "id",
      })
      .upgrade(async (tx) => {
        // reset completo dos dados de domínio que mudaram de formato
        await tx.table("fases").clear();
        await tx.table("capitulos").clear();
        await tx.table("cursos").clear();
      });
  }
}

export const db = new JuAcademyDB();
