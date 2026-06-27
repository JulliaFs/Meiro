import { ArrowDown } from "lucide-react";
import { MeiroLogo } from "../common/MeiroLogo";
import { FadeIn } from "./FadeIn";
import { useLandingI18n } from "./i18n";

export function Hero() {
  const { t } = useLandingI18n();

  return (
    <section id="top" className="pt-20 sm:pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-[760px] mx-auto text-center">
        <FadeIn>
          <div className="flex justify-center mb-7">
            <MeiroLogo size={56} />
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h1 className="text-[2.25rem] sm:text-[3.25rem] font-semibold tracking-[-0.035em] leading-[1.08]">
            {t.hero.title}
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-text-muted text-base sm:text-lg mt-5 max-w-[540px] mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
            <a href="#beta" className="btn btn-primary text-sm px-5 py-2.5">
              {t.hero.ctaPrimary}
            </a>
            <a href="#features" className="btn btn-secondary text-sm px-5 py-2.5">
              {t.hero.ctaSecondary}
              <ArrowDown size={15} />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
