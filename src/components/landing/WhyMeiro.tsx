import { ArrowDown } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { MeiroLogo } from "../common/MeiroLogo";
import { useLandingI18n } from "./i18n";

export function WhyMeiro() {
  const { t } = useLandingI18n();

  return (
    <section className="px-4 sm:px-6 py-20 sm:py-28 border-t border-border bg-surface-2">
      <div className="max-w-[760px] mx-auto text-center">
        <FadeIn>
          <p className="label-mono mb-3">{t.why.label}</p>
          <h2 className="text-2xl sm:text-[2rem] font-semibold tracking-[-0.02em] mb-12">{t.why.title}</h2>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {t.why.tools.map((tool) => (
              <span key={tool} className="card px-4 py-2 text-sm text-text-muted">
                {tool}
              </span>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex justify-center my-7 text-text-muted">
            <ArrowDown size={20} />
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="card-dark rounded-2xl px-6 py-7 inline-flex items-center gap-3">
            <MeiroLogo size={28} />
            <span className="text-lg font-semibold">{t.why.unified}</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
