export function cls(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
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
