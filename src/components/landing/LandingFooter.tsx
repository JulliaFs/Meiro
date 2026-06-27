import { Mail } from "lucide-react";
import { MeiroLogo } from "../common/MeiroLogo";
import { useLandingI18n } from "./i18n";

export function LandingFooter() {
  const { t } = useLandingI18n();

  return (
    <footer className="px-4 sm:px-6 py-10 border-t border-border">
      <div className="max-w-[1000px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <MeiroLogo size={22} />
          <span className="text-sm font-medium">meiro</span>
        </div>

        <div className="flex items-center gap-5 text-sm text-text-muted">
          <a href="#" className="hover:text-text transition-colors">{t.footer.privacy}</a>
          <a href="#" className="hover:text-text transition-colors">{t.footer.terms}</a>
          <a href="mailto:hello@meiro.app" className="hover:text-text transition-colors flex items-center gap-1.5">
            <Mail size={14} />
            {t.footer.contact}
          </a>
        </div>
      </div>
      <p className="text-2xs text-text-muted text-center mt-7">
        © {new Date().getFullYear()} Meiro. {t.footer.rights}
      </p>
    </footer>
  );
}
