import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { MeiroLogo } from "../common/MeiroLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLandingI18n } from "./i18n";
import { useAuthStore } from "../../store/useAuthStore";

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const { t } = useLandingI18n();
  const session = useAuthStore((s) => s.session);

  const LINKS = [
    { href: "#features", label: t.nav.features },
    { href: "#philosophy", label: t.nav.philosophy },
    { href: "#roadmap", label: t.nav.roadmap },
    { href: "#faq", label: t.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2 shrink-0">
          <MeiroLogo size={28} />
          <span className="font-semibold tracking-tight text-[15px]">meiro</span>
        </a>

        <nav className="hidden lg:flex items-center gap-6 min-w-0">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-text-muted hover:text-text transition-colors whitespace-nowrap">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <LanguageSwitcher />
          <Link to={session ? "/" : "/login"} className="text-sm text-text-muted hover:text-text px-2 py-1.5 whitespace-nowrap">
            {session ? t.nav.backToApp : t.nav.login}
          </Link>
          <a href="#beta" className="btn btn-primary text-sm whitespace-nowrap">
            {t.nav.joinBeta}
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 -mr-2 text-text-muted hover:text-text"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-bg px-4 sm:px-6 py-4 flex flex-col gap-3">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm text-text-muted hover:text-text py-1">
              {l.label}
            </a>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
            <LanguageSwitcher />
            <div className="flex items-center gap-3">
              <Link to={session ? "/" : "/login"} onClick={() => setOpen(false)} className="text-sm text-text-muted hover:text-text">
                {session ? t.nav.backToApp : t.nav.login}
              </Link>
              <a href="#beta" onClick={() => setOpen(false)} className="btn btn-primary text-sm">
                {t.nav.joinBeta}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
