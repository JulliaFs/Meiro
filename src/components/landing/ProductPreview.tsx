import { BookOpen, Calendar, Layers, ListChecks } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { useLandingI18n } from "./i18n";

const ROW_ICONS: LucideIcon[] = [ListChecks, BookOpen, Layers];

export function ProductPreview() {
  const { t } = useLandingI18n();

  return (
    <section className="px-4 sm:px-6 pb-20 sm:pb-28">
      <FadeIn className="max-w-[920px] mx-auto">
        <div
          className="rounded-[28px] border border-border bg-surface-2 p-3 sm:p-5"
          style={{ boxShadow: "var(--shadow-token-lg)" }}
        >
          <div className="rounded-[20px] border border-border bg-surface overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
              <span className="w-2.5 h-2.5 rounded-full bg-danger/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
              <span className="label-mono ml-3">meiro · dashboard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 sm:p-7">
              <div className="sm:col-span-2 space-y-3">
                <p className="label-mono">{t.preview.today}</p>
                {t.preview.rows.map((row, i) => {
                  const Icon = ROW_ICONS[i];
                  return (
                    <div key={row.label} className="card p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-brand-light flex items-center justify-center text-brand shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{row.label}</p>
                        <p className="text-2xs text-text-muted">{row.meta}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                <p className="label-mono">{t.preview.thisWeek}</p>
                <div className="card p-4">
                  <Calendar size={16} className="text-brand mb-2" />
                  <p className="metric-number text-[1.5rem]">12</p>
                  <p className="text-2xs text-text-muted">{t.preview.sessionsPlanned}</p>
                </div>
                <div className="card-dark rounded-lg p-4">
                  <p className="text-2xs opacity-80 mb-1">{t.preview.overallProgress}</p>
                  <p className="text-[1.5rem] font-semibold">74%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
