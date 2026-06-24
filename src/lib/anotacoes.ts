import { anotacaoService } from "../services";

interface CriarAnotacaoOrigemParams {
  origemTipo: "capitulo" | "aula";
  origemId: string;
  origemLabel: string;
  anoId?: string;
  faseId?: string;
  cursoId?: string;
  skills?: string[];
}

export async function criarAnotacaoComOrigem(params: CriarAnotacaoOrigemParams) {
  return anotacaoService.create({
    titulo: params.origemLabel,
    conteudo: `# ${params.origemLabel}\n\nOrigem: ${params.origemLabel}\n\n`,
    tags: [],
    ...params,
  });
}
