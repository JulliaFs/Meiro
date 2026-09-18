export function cls(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * "2026-08-29" vira meia-noite no fuso LOCAL. `new Date("2026-08-29")` seria
 * meia-noite UTC, que no Brasil ainda é dia 28 — as datas apareciam um dia antes.
 */
export function parseDate(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  return new Date(iso);
}

export function formatDate(iso: string): string {
  return parseDate(iso).toLocaleDateString("pt-BR");
}

/** Data no formato YYYY-MM-DD no fuso local (toISOString usa UTC e vira o dia às 21h). */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function confirmar(mensagem: string): boolean {
  return window.confirm(mensagem);
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    nao_iniciado: "Não iniciado",
    em_andamento: "Em andamento",
    concluido: "Concluído",
    planejado: "Planejado",
    pausado: "Pausado",
    pendente: "Pendente",
    concluida: "Concluída",
  };
  return map[status] ?? status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    nao_iniciado: "bg-surface-2 text-text-muted",
    pendente: "bg-surface-2 text-text-muted",
    em_andamento: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    concluido: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    concluida: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    planejado: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    pausado: "bg-red-500/15 text-red-600 dark:text-red-400",
  };
  return map[status] ?? "bg-surface-2 text-text-muted";
}

export function minutesToHoursLabel(minutes: number): string {
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
}
