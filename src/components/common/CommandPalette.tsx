import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, GraduationCap, BookOpen, Library, NotebookPen, Brain, Layers,
  Map, Award, RotateCcw, Target, Settings, Plus, Command,
} from "lucide-react";
import { useUiStore } from "../../store/useUiStore";

interface Cmd {
  id: string;
  label: string;
  group: string;
  icon: typeof LayoutDashboard;
  action: () => void;
}

export function CommandPalette() {
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const setPendingAction = useUiStore((s) => s.setPendingAction);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
    }
  }, [open]);

  const commands = useMemo<Cmd[]>(
    () => [
      { id: "nova-anotacao", label: "Nova Anotação", group: "Ações rápidas", icon: Plus, action: () => { setPendingAction("nova-anotacao"); navigate("/anotacoes"); } },
      { id: "novo-curso", label: "Novo Curso", group: "Ações rápidas", icon: Plus, action: () => { setPendingAction("novo-curso"); navigate("/cursos"); } },
      { id: "nova-fase", label: "Nova Fase", group: "Ações rápidas", icon: Plus, action: () => { setPendingAction("nova-fase"); navigate("/faculdade"); } },
      { id: "dashboard", label: "Dashboard", group: "Navegar", icon: LayoutDashboard, action: () => navigate("/") },
      { id: "faculdade", label: "Faculdade", group: "Navegar", icon: GraduationCap, action: () => navigate("/faculdade") },
      { id: "cursos", label: "Meus Cursos", group: "Navegar", icon: BookOpen, action: () => navigate("/cursos") },
      { id: "biblioteca", label: "Biblioteca", group: "Navegar", icon: Library, action: () => navigate("/biblioteca") },
      { id: "anotacoes", label: "Anotações", group: "Navegar", icon: NotebookPen, action: () => navigate("/anotacoes") },
      { id: "flashcards", label: "Flashcards", group: "Navegar", icon: Brain, action: () => navigate("/flashcards") },
      { id: "areas", label: "Áreas de Conhecimento", group: "Navegar", icon: Layers, action: () => navigate("/areas") },
      { id: "carreira", label: "Mapa de Carreira", group: "Navegar", icon: Map, action: () => navigate("/carreira") },
      { id: "certificados", label: "Certificados", group: "Navegar", icon: Award, action: () => navigate("/certificados") },
      { id: "revisoes", label: "Revisões", group: "Navegar", icon: RotateCcw, action: () => navigate("/revisoes") },
      { id: "metas", label: "Metas", group: "Navegar", icon: Target, action: () => navigate("/metas") },
      { id: "config", label: "Configurações", group: "Navegar", icon: Settings, action: () => navigate("/configuracoes") },
    ],
    [navigate, setPendingAction]
  );

  const filtradas = useMemo(() => {
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  function executar(cmd: Cmd) {
    cmd.action();
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtradas.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && filtradas[activeIdx]) executar(filtradas[activeIdx]);
  }

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/50 flex items-start justify-center pt-24 px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="card w-full max-w-lg p-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Command size={16} className="text-text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
                onKeyDown={onKeyDown}
                placeholder="Digite um comando ou busque uma página..."
                className="flex-1 bg-transparent outline-none text-sm py-1"
              />
              <kbd className="label-mono bg-surface-2 px-1.5 py-0.5 rounded">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto py-2">
              {filtradas.length === 0 && <p className="text-sm text-text-muted px-4 py-6 text-center">Nenhum comando encontrado.</p>}
              {filtradas.map((cmd, idx) => {
                const showGroup = cmd.group !== lastGroup;
                lastGroup = cmd.group;
                return (
                  <div key={cmd.id}>
                    {showGroup && <p className="label-mono px-4 pt-2 pb-1">{cmd.group}</p>}
                    <button
                      onClick={() => executar(cmd)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left ${idx === activeIdx ? "bg-surface-2" : ""}`}
                    >
                      <cmd.icon size={15} className="text-text-muted" />
                      {cmd.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
