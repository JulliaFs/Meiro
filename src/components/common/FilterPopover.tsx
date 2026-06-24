import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import type { ReactNode } from "react";

export function FilterPopover({ activeCount, children, onClear }: { activeCount: number; children: ReactNode; onClear?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={`btn btn-secondary relative ${activeCount > 0 ? "border-brand text-brand" : ""}`}>
        <Filter size={15} /> Filtros
        {activeCount > 0 && (
          <span className="ml-0.5 w-5 h-5 rounded-full bg-brand text-white text-2xs font-semibold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="card absolute right-0 mt-2 p-4 w-72 z-40 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Filtrar por</span>
              {activeCount > 0 && onClear && (
                <button onClick={onClear} className="text-xs text-text-muted hover:text-red-500 flex items-center gap-1">
                  <X size={12} /> Limpar
                </button>
              )}
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
