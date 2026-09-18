import { Menu, Search, Moon, Sun, Plus, NotebookPen, BookOpen, GraduationCap, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useUiStore } from "../store/useUiStore";
import { GlobalSearch } from "../components/common/GlobalSearch";
import { Breadcrumbs } from "../components/common/Breadcrumbs";

export function Header() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const searchOpen = useUiStore((s) => s.searchOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const setEstudoOpen = useUiStore((s) => s.setEstudoOpen);
  const setPendingAction = useUiStore((s) => s.setPendingAction);
  const navigate = useNavigate();
  const [quickOpen, setQuickOpen] = useState(false);
  const quickRef = useRef<HTMLDivElement>(null);

  // fecha o menu "Criar" ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!quickOpen) return;
    function aoClicarFora(e: MouseEvent) {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuickOpen(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setQuickOpen(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [quickOpen]);

  function quickAction(action: "nova-anotacao" | "novo-curso" | "nova-fase", to: string) {
    setPendingAction(action);
    navigate(to);
    setQuickOpen(false);
  }

  return (
    <>
      <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => (window.innerWidth < 640 ? setMobileNavOpen(true) : toggleSidebar())}
            className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-2 shrink-0"
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>
          <div className="hidden sm:block truncate">
            <Breadcrumbs />
          </div>
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center gap-2 text-sm text-text-muted bg-surface-2 rounded-lg px-3 py-1.5 w-64 hover:brightness-95"
          >
            <Search size={14} />
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="label-mono bg-surface px-1.5 py-0.5 rounded border border-border">Ctrl K</kbd>
          </button>
          <button onClick={() => setSearchOpen(true)} className="md:hidden text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-2" aria-label="Buscar">
            <Search size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={quickRef}>
            <button onClick={() => setQuickOpen(!quickOpen)} className="btn btn-primary !px-3" aria-haspopup="menu" aria-expanded={quickOpen}>
              <Plus size={16} /> <span className="hidden sm:inline">Criar</span>
            </button>
            {quickOpen && (
              <div className="absolute right-0 mt-1 card p-1 min-w-[200px] z-40" role="menu">
                <button onClick={() => quickAction("nova-anotacao", "/anotacoes")} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-2">
                  <NotebookPen size={14} /> Nova Anotação
                </button>
                <button onClick={() => quickAction("novo-curso", "/cursos")} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-2">
                  <BookOpen size={14} /> Novo Curso
                </button>
                <button onClick={() => quickAction("nova-fase", "/faculdade")} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-2">
                  <GraduationCap size={14} /> Nova Fase
                </button>
                <button
                  onClick={() => {
                    setEstudoOpen(true);
                    setQuickOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-2"
                >
                  <Clock size={14} /> Registrar estudo
                </button>
              </div>
            )}
          </div>
          <button onClick={toggleTheme} className="text-text-muted hover:text-text p-2 rounded-lg hover:bg-surface-2" aria-label="Alternar tema">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}
