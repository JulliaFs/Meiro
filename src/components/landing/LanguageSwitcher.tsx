import { cls } from "../../lib/utils";
import { useLandingI18n } from "./i18n";
import type { Lang } from "./i18n";

const OPTIONS: { code: Lang; label: string }[] = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLandingI18n();

  return (
    <div className={cls("flex items-center gap-0.5 rounded-md border border-border bg-surface-2 p-0.5", className)}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.code}
          onClick={() => setLang(opt.code)}
          aria-pressed={lang === opt.code}
          className={cls(
            "px-2 py-1 rounded text-2xs font-semibold tracking-wide transition-colors",
            lang === opt.code ? "bg-brand text-white" : "text-text-muted hover:text-text"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
