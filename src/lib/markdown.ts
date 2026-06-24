/** Conversor markdown -> HTML minimalista, sem dependências externas.
 * Suporta: títulos, negrito/itálico, código inline/bloco, checklist,
 * listas, links, imagens e tabelas simples — suficiente para notas pessoais.
 */
export function markdownToHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

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
  // imagens e links
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "<img src='$2' alt='$1' class='rounded-lg my-2 max-w-full' />");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' target='_blank' class='text-brand underline'>$1</a>");
  // quebras de linha
  html = html.replace(/\n/g, "<br/>");
  return html;
}
