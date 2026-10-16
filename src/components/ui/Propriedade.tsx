import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** Linha de propriedade no estilo do Notion: ícone + nome à esquerda, valor à direita. */
export function Propriedade({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 min-h-9 py-1">
      <div className="flex items-center gap-2 w-36 sm:w-44 shrink-0 text-sm text-text-muted pt-1.5">
        <Icon size={16} className="shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <div className="flex-1 min-w-0 text-sm">{children}</div>
    </div>
  );
}

/** Classe para inputs "invisíveis" dentro das propriedades (aparecem ao passar o mouse). */
export const inputPropriedade =
  "w-full bg-transparent rounded-md px-2 py-1.5 outline-none hover:bg-surface-2 focus:bg-surface-2 text-text placeholder:text-text-muted/60";

/** Título grande que quebra linha e cresce com o texto, como o título de página do Notion. */
export function TituloPagina({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      rows={1}
      className="w-full bg-transparent border-0 outline-none resize-none overflow-hidden text-3xl sm:text-4xl font-bold leading-tight text-text placeholder:text-text-muted/50 mb-4"
      placeholder="Sem título"
      value={value}
      ref={(el) => {
        if (el) {
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }
      }}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, " "))}
    />
  );
}
