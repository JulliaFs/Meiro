import { useEffect, useState, type ReactNode } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";

const CHAVE_EXPANDIDO = "meiro.modalExpandido";

function lerExpandido(): boolean {
  try {
    return localStorage.getItem(CHAVE_EXPANDIDO) === "1";
  } catch {
    return false;
  }
}

/**
 * Janela no estilo do Notion: abre centralizada ("peek") e pode virar página inteira.
 * A página de trás fica travada (uma barra de rolagem só) e Esc fecha.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  pagina,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
  /** o conteúdo já traz o próprio título grande (layout de página do Notion) */
  pagina?: boolean;
}) {
  const [expandido, setExpandido] = useState(lerExpandido);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const antes = html.style.overflow;
    html.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = antes;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function alternarExpandido() {
    const novo = !expandido;
    setExpandido(novo);
    try {
      localStorage.setItem(CHAVE_EXPANDIDO, novo ? "1" : "0");
    } catch {
      // sem armazenamento: só não lembra a escolha
    }
  }

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center ${expandido ? "bg-bg" : "items-center bg-black/50 p-3 sm:p-6"}`}
      onClick={expandido ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={
          expandido
            ? "w-full h-full overflow-y-auto overscroll-contain bg-bg"
            : `w-full ${wide ? "max-w-3xl" : "max-w-md"} max-h-[88vh] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface shadow-2xl`
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* barra fixa no topo, como a do Notion: sempre visível ao rolar */}
        <div className={`sticky top-0 z-10 flex items-center gap-1 px-3 py-2 border-b border-border/60 backdrop-blur ${expandido ? "bg-bg/90" : "bg-surface/90"}`}>
          <button
            onClick={alternarExpandido}
            className="text-text-muted hover:text-text p-1.5 rounded-md hover:bg-surface-2"
            aria-label={expandido ? "Voltar para janela" : "Abrir como página inteira"}
            title={expandido ? "Voltar para janela" : "Abrir como página inteira"}
          >
            {expandido ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <span className="flex-1 truncate text-xs text-text-muted px-1">{expandido || pagina ? title : ""}</span>
          <button onClick={onClose} className="text-text-muted hover:text-text p-1.5 rounded-md hover:bg-surface-2" aria-label="Fechar (Esc)" title="Fechar (Esc)">
            <X size={18} />
          </button>
        </div>

        <div className={expandido ? "mx-auto w-full max-w-4xl px-5 sm:px-12 py-8" : "p-5 sm:p-6"}>
          {!pagina && <h3 className={`font-semibold mb-4 ${expandido ? "text-2xl sm:text-3xl font-bold" : "text-lg"}`}>{title}</h3>}
          {children}
        </div>
      </div>
    </div>
  );
}
