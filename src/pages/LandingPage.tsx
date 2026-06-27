import { LandingI18nProvider } from "../components/landing/i18n";
import { LandingNav } from "../components/landing/LandingNav";
import { Hero } from "../components/landing/Hero";
import { ProductPreview } from "../components/landing/ProductPreview";
import { Features } from "../components/landing/Features";
import { WhyMeiro } from "../components/landing/WhyMeiro";
import { Philosophy } from "../components/landing/Philosophy";
import { BetaAccess } from "../components/landing/BetaAccess";
import { FAQ } from "../components/landing/FAQ";
import { LandingFooter } from "../components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <LandingI18nProvider>
      <div className="min-h-screen bg-bg">
        <LandingNav />
        <Hero />
        <ProductPreview />
        <Features />
        <WhyMeiro />
        <Philosophy />
        <BetaAccess />
        <FAQ />
        <LandingFooter />
      </div>
    </LandingI18nProvider>
  );
}
