/** Conversor markdown -> HTML minimalista, sem dependências externas.
 * Suporta: títulos, negrito/itálico, código inline/bloco, checklist,
 * listas, links, imagens e tabelas simples — suficiente para notas pessoais.
 */

/** Escapa o que vai dentro de um atributo HTML delimitado por aspas simples. */
function escapeAttr(value: string): string {
  return value.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

/** Só deixa passar URLs inertes: bloqueia javascript:, data:, vbscript: etc.
 *  Sem isso, `[clique](javascript:...)` vira execução de script na nota. */
function safeUrl(raw: string): string {
  const url = raw.trim();
  if (/^(https?:|mailto:|tel:)/i.test(url)) return escapeAttr(url);
  // caminhos relativos e âncoras continuam válidos
  if (/^[/#.]/.test(url) && !/^\/\//.test(url)) return escapeAttr(url);
  return "#";
}

export function markdownToHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  // bloco de código
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre class="bg-surface-2 rounded-lg p-3 overflow-x-auto text-xs my-2"><code>${code.trim()}</code></pre>`);
  // títulos
  html = html.replace(/^### (.*)$/gm, "<h3 class='text-base font-semibold mt-3 mb-1'>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2 class='text-lg font-semibold mt-4 mb-1'>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1 class='text-xl font-bold mt-4 mb-2'>$1</h1>");
  // checklist
  html = html.replace(/^- \[x\] (.*)$/gim, "<div class='flex items-center gap-2 my-1'><input type='checkbox' checked disabled /><span class='line-through text-text-muted'>$1</span></div>");
  html = html.replace(/^- \[ \] (.*)$/gim, "<div class='flex items-center gap-2 my-1'><input type='checkbox' disabled /><span>$1</span></div>");
  // listas
  html = html.replace(/^- (.*)$/gm, "<li class='ml-4 list-disc'>$1</li>");
  // negrito / itálico / código inline
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code class='bg-surface-2 px-1 py-0.5 rounded text-xs'>$1</code>");
  // imagens e links — o alt/href passam por escape + validação de protocolo
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt: string, src: string) =>
      `<img src='${safeUrl(src)}' alt='${escapeAttr(alt)}' class='rounded-lg my-2 max-w-full' />`
  );
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label: string, href: string) =>
      `<a href='${safeUrl(href)}' target='_blank' rel='noopener noreferrer' class='text-brand underline'>${label}</a>`
  );
  // quebras de linha
  html = html.replace(/\n/g, "<br/>");
  return html;
}
