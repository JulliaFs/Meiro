import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  bg?: string;
  deltaPct?: number; // ex: 23 = +23%, -12 = -12%
  deltaLabel?: string; // ex: "vs semana passada"
}

export function MetricCard({ label, value, icon: Icon, color = "var(--color-brand)", bg = "var(--color-brand-light)", deltaPct, deltaLabel }: MetricCardProps) {
  const positivo = (deltaPct ?? 0) >= 0;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="card p-4 relative overflow-hidden"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: bg, color }}>
        <Icon size={18} />
      </div>
      <p className="metric-number text-text">{value}</p>
      <p className="text-xs text-text-muted mt-1">{label}</p>
      {deltaPct !== undefined && (
        <p className={`text-2xs font-semibold mt-1.5 flex items-center gap-1 ${positivo ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
          {positivo ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {positivo ? "+" : ""}{deltaPct}% {deltaLabel}
        </p>
      )}
    </motion.div>
  );
}
