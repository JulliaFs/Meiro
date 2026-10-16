import { useState, type ReactNode } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";

const CHAVE_EXPANDIDO = "meiro.modalExpandido";

function lerExpandido(): boolean {
  try {
    return localStorage.getItem(CHAVE_EXPANDIDO) === "1";
  } catch {
    return false;
  }
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  // como no Notion: qualquer janela pode ocupar a tela inteira; a preferência é lembrada
  const [expandido, setExpandido] = useState(lerExpandido);

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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${expandido ? "p-0" : "p-4"}`}
      onClick={onClose}
    >
      <div
        className={
          expandido
            ? "card w-full h-full max-w-none rounded-none overflow-y-auto p-6 sm:px-[max(1.5rem,calc((100vw-60rem)/2))]"
            : `card w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[85vh] overflow-y-auto p-6`
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={alternarExpandido}
              className="text-text-muted hover:text-text p-1.5 rounded-md hover:bg-surface-2"
              aria-label={expandido ? "Reduzir janela" : "Expandir janela"}
              title={expandido ? "Reduzir" : "Expandir para tela inteira"}
            >
              {expandido ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={onClose} className="text-text-muted hover:text-text p-1.5 rounded-md hover:bg-surface-2" aria-label="Fechar">
              <X size={18} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
