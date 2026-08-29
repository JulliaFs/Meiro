import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Library,
  NotebookPen,
  Brain,
  Layers,
  Map,
  Award,
  RotateCcw,
  Target,
  Settings,
  LayoutDashboard,
  UserPlus,
  LogOut,
  Sparkles,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { cls } from "../lib/utils";
import { useUiStore, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH } from "../store/useUiStore";
import { useAuthStore } from "../store/useAuthStore";
import { MeiroLogo } from "../components/common/MeiroLogo";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  adminOnly?: boolean;
}

const SECOES: { titulo: string; items: NavItem[] }[] = [
  {
    titulo: "Aprendizado",
    items: [
      { to: "/faculdade", label: "Faculdade", icon: GraduationCap },
      { to: "/cursos", label: "Meus Cursos", icon: BookOpen },
      { to: "/biblioteca", label: "Biblioteca", icon: Library },
      { to: "/anotacoes", label: "Anotações", icon: NotebookPen },
      { to: "/flashcards", label: "Flashcards", icon: Brain },
    ],
  },
  {
    titulo: "Evolução",
    items: [
      { to: "/areas", label: "Áreas de Conhecimento", icon: Layers },
      { to: "/carreira", label: "Mapa de Carreira", icon: Map },
      { to: "/certificados", label: "Certificados", icon: Award },
    ],
  },
  {
    titulo: "Planejamento",
    items: [
      { to: "/revisoes", label: "Revisões", icon: RotateCcw },
      { to: "/metas", label: "Metas", icon: Target },
    ],
  },
  {
    titulo: "Sistema",
    items: [
      { to: "/waitlist", label: "Lista de Espera", icon: UserPlus, adminOnly: true },
      { to: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

function NavRow({ to, label, icon: Icon, collapsed, end, onNavigate }: NavItem & { collapsed: boolean; end?: boolean; onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cls(
          "flex items-center gap-3 h-8 pl-3.5 pr-3 text-[13.5px] transition-colors relative",
          isActive ? "text-text font-medium" : "text-text-muted hover:text-text"
        )
      }
      title={label}
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="active-indicator"
              className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full bg-brand"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <Icon size={16} className="shrink-0" strokeWidth={1.75} />
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  );
}

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <nav className="flex-1 overflow-y-auto py-3 scrollbar-none">
      <div className="mb-2 pb-2 border-b border-border">
        <NavRow to="/" label="Dashboard" icon={LayoutDashboard} collapsed={collapsed} end onNavigate={onNavigate} />
      </div>

      {SECOES.map((secao) => ({ ...secao, items: secao.items.filter((i) => !i.adminOnly || isAdmin) }))
        .filter((secao) => secao.items.length > 0)
        .map((secao, idx) => (
        <div key={secao.titulo} className={cls(idx > 0 && "border-t border-border mt-2 pt-2")}>
          {!collapsed && (
            <p className="text-2xs text-text-muted/70 px-3.5 mb-1 mt-1 font-medium select-none">{secao.titulo}</p>
          )}
          <div>
            {secao.items.map((item) => (
              <NavRow key={item.to} {...item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2 px-4 h-14 border-b border-border shrink-0">
      <MeiroLogo size={28} />
      {!collapsed && <span className="font-semibold text-base text-text whitespace-nowrap">meiro</span>}
    </div>
  );
}

function ProfileFooter({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const [aberto, setAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  if (!session) return null;
  const nome = (session.user.user_metadata?.nome as string) || session.user.email || "Conta";
  const inicial = nome.charAt(0).toUpperCase();

  async function sair() {
    setAberto(false);
    onNavigate?.();
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <div ref={menuRef} className="relative border-t border-border shrink-0">
      {aberto && (
        <div className="absolute bottom-full left-2 right-2 mb-2 rounded-lg border border-border bg-surface shadow-lg overflow-hidden z-20">
          <Link
            to="/apresentacao"
            onClick={() => {
              setAberto(false);
              onNavigate?.();
            }}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <Sparkles size={15} className="shrink-0" />
            <span className="whitespace-nowrap">Ver apresentação</span>
          </Link>
          <button
            onClick={sair}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-surface-2 transition-colors border-t border-border"
          >
            <LogOut size={15} className="shrink-0" />
            <span className="whitespace-nowrap">Sair da conta</span>
          </button>
        </div>
      )}

      <button
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        title={collapsed ? nome : "Conta"}
        className="w-full px-3 py-3 flex items-center gap-2.5 hover:bg-surface-2 transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold shrink-0">
          {inicial}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text truncate">{nome}</p>
              {session.user.email && session.user.email !== nome && (
                <p className="label-mono truncate">{session.user.email}</p>
              )}
            </div>
            <ChevronsUpDown size={14} className="text-text-muted shrink-0" />
          </>
        )}
      </button>
    </div>
  );
}

function ResizeHandle() {
  const setSidebarWidth = useUiStore((s) => s.setSidebarWidth);
  const draggingRef = useRef(false);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current) return;
      setSidebarWidth(e.clientX);
    },
    [setSidebarWidth]
  );

  const stopDrag = useCallback(() => {
    draggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [onMouseMove, stopDrag]);

  function startDrag() {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  return (
    <div
      onMouseDown={startDrag}
      onDoubleClick={() => setSidebarWidth(240)}
      className="absolute right-0 top-0 h-full w-1.5 -mr-0.5 cursor-col-resize z-10 group"
      title="Arraste para redimensionar · duplo clique para resetar"
    >
      <div className="h-full w-px mx-auto bg-transparent group-hover:bg-brand/40 transition-colors" />
    </div>
  );
}

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const sidebarWidth = useUiStore((s) => s.sidebarWidth);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <>
      {/* Desktop / tablet: rail fixa, colapsável e redimensionável */}
      <aside
        className={cls(
          "hidden sm:flex h-screen sticky top-0 border-r border-border bg-surface flex-col shrink-0 relative",
          collapsed ? "w-[60px]" : ""
        )}
        style={collapsed ? undefined : { width: sidebarWidth, minWidth: SIDEBAR_MIN_WIDTH, maxWidth: SIDEBAR_MAX_WIDTH }}
      >
        <Logo collapsed={collapsed} />
        <SidebarNav collapsed={collapsed} />
        <ProfileFooter collapsed={collapsed} />
        {!collapsed && <ResizeHandle />}
      </aside>

      {/* Mobile: drawer overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 sm:hidden"
            onClick={() => setMobileNavOpen(false)}
          >
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="w-64 h-full bg-surface flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Logo collapsed={false} />
                <button onClick={() => setMobileNavOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text">
                  <X size={18} />
                </button>
              </div>
              <SidebarNav collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
              <ProfileFooter collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
