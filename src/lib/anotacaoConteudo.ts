// anotacoes.conteudo guarda o JSON dos blocos do editor. Notas antigas em markdown
// continuam como texto e são convertidas para blocos ao abrir (e só salvas se editadas).

export const PREFIXO_ARQUIVO = "meiro-arquivo://";

export function ehBlocos(conteudo: string): boolean {
  const t = conteudo.trimStart();
  if (!t.startsWith("[")) return false;
  try {
    return Array.isArray(JSON.parse(t));
  } catch {
    return false;
  }
}

interface NoBloco {
  content?: unknown;
  children?: NoBloco[];
  text?: string;
}

function textoDe(no: unknown): string {
  if (!no) return "";
  if (typeof no === "string") return no;
  if (Array.isArray(no)) return no.map(textoDe).join(" ");
  const b = no as NoBloco;
  return [b.text ?? "", textoDe(b.content), textoDe(b.children)].filter(Boolean).join(" ");
}

/** Texto puro da anotação, para busca e trecho na lista. */
export function textoPlano(conteudo: string): string {
  if (!ehBlocos(conteudo)) return conteudo.replace(/[#*_`>[\]-]/g, " ").replace(/\s+/g, " ").trim();
  try {
    return textoDe(JSON.parse(conteudo)).replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}
