/** Link salvo como "Nome | https://..." (ou só a URL). */
export function lerLink(valor: string): { nome: string; url: string } {
  const i = valor.lastIndexOf(" | ");
  return i > 0 ? { nome: valor.slice(0, i).trim(), url: valor.slice(i + 3).trim() } : { nome: valor, url: valor };
}

/** Micro-passos salvos como linhas "[ ] texto" / "[x] texto". */
export interface Passo {
  texto: string;
  feito: boolean;
}

export function lerPassos(texto?: string): Passo[] {
  return (texto ?? "")
    .split("\n")
    .map((l) => /^\[( |x)\] (.+)$/i.exec(l.trim()))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({ feito: m[1].toLowerCase() === "x", texto: m[2] }));
}

export function escreverPassos(passos: Passo[]): string {
  return passos.map((p) => `[${p.feito ? "x" : " "}] ${p.texto}`).join("\n");
}
