import { Rocket } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { WaitlistForm } from "./WaitlistForm";
import { useLandingI18n } from "./i18n";

export function BetaAccess() {
  const { t } = useLandingI18n();

  return (
    <section id="beta" className="px-4 sm:px-6 py-20 sm:py-28 border-t border-border bg-surface-2">
      <FadeIn className="max-w-[520px] mx-auto">
        <div className="card p-7 sm:p-9 text-center">
          <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center text-brand mx-auto mb-5">
            <Rocket size={20} />
          </div>
          <h2 className="text-xl font-semibold tracking-[-0.01em] mb-2">{t.beta.title}</h2>
          <p className="text-sm text-text-muted leading-relaxed mb-7">{t.beta.description}</p>
          <WaitlistForm />
        </div>
      </FadeIn>
    </section>
  );
}
