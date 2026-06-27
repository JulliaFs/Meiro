import { FadeIn } from "./FadeIn";
import { useLandingI18n } from "./i18n";

export function Philosophy() {
  const { t } = useLandingI18n();

  return (
    <section id="philosophy" className="px-4 sm:px-6 py-20 sm:py-28 border-t border-border">
      <div className="max-w-[600px] mx-auto text-center">
        <FadeIn>
          <p className="label-mono mb-3">{t.philosophy.label}</p>
          <h2 className="text-2xl sm:text-[2rem] font-semibold tracking-[-0.02em] mb-5">{t.philosophy.title}</h2>
          <p className="text-text-muted leading-relaxed">{t.philosophy.text}</p>
        </FadeIn>
      </div>

      <FadeIn delay={0.1} className="max-w-[640px] mx-auto mt-16">
        <div id="roadmap" className="card p-6 sm:p-8">
          <p className="label-mono mb-7 text-center">{t.philosophy.roadmapLabel}</p>
          <div className="relative flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-0">
            <div className="hidden sm:block absolute left-0 right-0 top-[5px] h-px bg-border" />
            {t.philosophy.milestones.map((m, i) => (
              <div key={m.label} className="relative flex-1 flex items-center sm:flex-col sm:items-center gap-3 sm:gap-2.5 sm:text-center">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: i === 0 ? "var(--color-brand)" : "var(--color-border)" }}
                />
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-2xs text-text-muted">{m.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
