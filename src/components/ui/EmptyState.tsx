import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center text-center h-full py-8 px-6 gap-2"
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-light text-brand flex items-center justify-center mb-2">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-text text-base">{title}</h3>
      {description && <p className="text-sm text-text-muted max-w-sm">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </motion.div>
  );
}
