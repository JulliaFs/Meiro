import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useToastStore } from "../../store/useToastStore";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const fechar = useToastStore((s) => s.fechar);

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[70] flex flex-col gap-2 sm:w-96 pointer-events-none" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            role={t.tipo === "erro" ? "alert" : "status"}
            className="card p-3 flex items-start gap-2 text-sm shadow-lg pointer-events-auto"
          >
            {t.tipo === "erro" ? (
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            )}
            <p className="flex-1">{t.mensagem}</p>
            <button onClick={() => fechar(t.id)} className="text-text-muted hover:text-text shrink-0" aria-label="Fechar">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
