import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cls } from "../../lib/utils";
import { FadeIn } from "./FadeIn";
import { useLandingI18n } from "./i18n";

export function FAQ() {
  const { t } = useLandingI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="px-4 sm:px-6 py-20 sm:py-28 border-t border-border">
      <div className="max-w-[640px] mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="label-mono mb-3">{t.faq.label}</p>
          <h2 className="text-2xl sm:text-[2rem] font-semibold tracking-[-0.02em]">{t.faq.title}</h2>
        </FadeIn>

        <FadeIn delay={0.05} className="space-y-2.5">
          {t.faq.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q} className="card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left"
                >
                  <span className="text-sm font-medium">{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={cls("text-text-muted shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && (
                  <p className="text-sm text-text-muted leading-relaxed px-4 sm:px-5 pb-4 sm:pb-5 -mt-1">{item.a}</p>
                )}
              </div>
            );
          })}
        </FadeIn>
      </div>
    </section>
  );
}
