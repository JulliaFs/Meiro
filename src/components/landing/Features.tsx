import { BookOpen, Calendar, Layers, ListChecks, NotebookPen, Sparkles, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { useLandingI18n } from "./i18n";

const ICONS: LucideIcon[] = [BookOpen, ListChecks, Calendar, Layers, Sparkles, NotebookPen, TrendingUp];

export function Features() {
  const { t } = useLandingI18n();

  return (
    <section id="features" className="px-4 sm:px-6 py-20 sm:py-28 border-t border-border">
      <div className="max-w-[1000px] mx-auto">
        <FadeIn className="text-center max-w-[480px] mx-auto mb-14">
          <p className="label-mono mb-3">{t.features.label}</p>
          <h2 className="text-2xl sm:text-[2rem] font-semibold tracking-[-0.02em]">{t.features.title}</h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.features.items.map((f, i) => {
            const Icon = ICONS[i];
            return (
              <FadeIn key={f.title} delay={(i % 3) * 0.05}>
                <div className="card p-5 h-full transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center text-brand mb-4">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-medium text-[15px] mb-1.5">{f.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
