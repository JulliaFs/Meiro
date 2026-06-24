export type Status = "nao_iniciado" | "em_andamento" | "concluido";
export type StatusFase = "pendente" | "em_andamento" | "concluida";

export type Dificuldade = "facil" | "medio" | "dificil";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- Faculdade ----------
export interface Ano extends BaseEntity {
  numero: number; // 1, 2, 3...
  nome: string; // "1º Ano"
}

export interface Fase extends BaseEntity {
  anoId: string;
  nome: string;
  numero: number;
  dataInicio?: string;
  dataTermino?: string;
  descricao: string;
  observacoes?: string;
  status: StatusFase;
}

export interface Capitulo extends BaseEntity {
  faseId: string;
  nome: string;
  numero: number;
  descricao?: string;
  dataEstudo?: string;
  status: Status;
  links: string[];
  // desempenho
  notaFastTest?: number;
  notaExercicios?: number;
  observacoesDesempenho?: string;
  // aprendizado
  resumo?: string;
  principaisConceitos?: string;
  dificuldade?: Dificuldade;
  // skills
  skills: string[];
}

// ---------- Áreas de conhecimento ----------
export interface AreaConhecimento extends BaseEntity {
  nome: string;
  descricao: string;
  nivel: number; // 0-100
  progresso: number; // 0-100
  horasEstudadas: number;
  cor: string;
}

// ---------- Cursos (trilha: Curso -> Módulo -> Aula) ----------
export type StatusCurso = "planejado" | "em_andamento" | "concluido" | "pausado";
export type CategoriaCurso =
  | "Programação"
  | "Design"
  | "Inglês"
  | "Faculdade"
  | "Produtividade"
  | "Negócios"
  | "Outros";

export interface Curso extends BaseEntity {
  nome: string;
  plataforma: string;
  link?: string;
  categoria: CategoriaCurso;
  instrutor?: string;
  cargaHoraria: number;
  dataInicio?: string;
  dataConclusao?: string;
  status: StatusCurso;
  certificadoId?: string;
}

export interface Modulo extends BaseEntity {
  cursoId: string;
  nome: string;
  numero: number;
  descricao?: string;
  status: Status;
}

export interface Aula extends BaseEntity {
  moduloId: string;
  nome: string;
  numero: number;
  data?: string;
  duracaoMinutos?: number;
  status: Status;
  pdfId?: string;
  materialComplementarId?: string;
  certificadoParcialId?: string;
  resumo?: string;
  aprendizados?: string;
  observacoes?: string;
  skills: string[];
}

// ---------- Certificados ----------
export interface Certificado extends BaseEntity {
  nome: string;
  instituicao: string;
  data: string;
  cargaHoraria: number;
  area: string;
  arquivoId?: string;
  linkValidacao?: string;
}

// ---------- Biblioteca / Materiais ----------
export type TipoMaterial =
  | "pdf"
  | "livro"
  | "video"
  | "curso"
  | "artigo"
  | "link"
  | "certificado"
  | "docx"
  | "imagem";

export interface Material extends BaseEntity {
  titulo: string;
  descricao?: string;
  tipo: TipoMaterial;
  tags: string[];
  area?: string;
  pasta?: string;
  arquivoId?: string;
  url?: string;
  dataUpload: string;
  // vínculo opcional com capítulo/aula de origem
  origemTipo?: "capitulo" | "aula";
  origemId?: string;
}

export interface Arquivo {
  id: string;
  nome: string;
  mime: string;
  tamanho: number;
  blob: Blob;
  createdAt: string;
}

// ---------- Anotações ----------
export interface Anotacao extends BaseEntity {
  titulo: string;
  conteudo: string; // markdown
  pasta?: string;
  area?: string;
  materia?: string;
  tags: string[];
  // integração com a origem (capítulo da faculdade ou aula de curso)
  origemTipo?: "capitulo" | "aula";
  origemId?: string;
  origemLabel?: string; // ex: "Faculdade > Fase 2 > Capítulo 1"
  anoId?: string;
  faseId?: string;
  cursoId?: string;
  skills?: string[];
}

// ---------- Flashcards ----------
export interface Flashcard extends BaseEntity {
  pergunta: string;
  resposta: string;
  categoria: string;
  area?: string;
  dificuldade: Dificuldade;
  ultimaRevisao?: string;
  proximaRevisao?: string;
  intervaloDias: number;
  acertosSeguidos: number;
}

// ---------- Metas ----------
export type CategoriaMeta = "anual" | "trimestral" | "mensal" | "semanal" | "diaria";

export interface ChecklistItem {
  id: string;
  texto: string;
  feito: boolean;
}

export interface Meta extends BaseEntity {
  descricao: string;
  prazo: string;
  categoria: CategoriaMeta;
  progresso: number;
  checklist: ChecklistItem[];
}

// ---------- Carreira / Skills ----------
export interface Habilidade extends BaseEntity {
  nome: string;
  nivelAtual: number;
  meta: number;
}

// ---------- Sessões de estudo (para horas/streak/gráficos) ----------
export interface SessaoEstudo extends BaseEntity {
  data: string; // ISO date
  minutos: number;
  areaId?: string;
}

export interface Configuracoes {
  id: string;
  tema: "light" | "dark" | "system";
  nome: string;
}
