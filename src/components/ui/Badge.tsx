import type { CSSProperties, ReactNode } from "react";
import { cls } from "../../lib/utils";

export function Badge({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span className={cls("badge", !style && "bg-surface-2 text-text-muted", className)} style={style}>
      {children}
    </span>
  );
}
