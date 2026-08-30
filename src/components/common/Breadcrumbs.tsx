import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  "": "Dashboard",
  faculdade: "Faculdade",
  areas: "Áreas de Conhecimento",
  cursos: "Meus Cursos",
  biblioteca: "Biblioteca",
  anotacoes: "Anotações",
  flashcards: "Flashcards",
  certificados: "Certificados",
  revisoes: "Revisões",
  carreira: "Mapa de Carreira",
  metas: "Metas",
  configuracoes: "Configurações",
};

export function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  if (parts.length === 0) {
    return <span className="text-sm font-medium text-text">Dashboard</span>;
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Link to="/" className="text-text-muted hover:text-text">Meiro</Link>
      {parts.map((part, idx) => {
        const isLast = idx === parts.length - 1;
        const to = "/" + parts.slice(0, idx + 1).join("/");
        const label = LABELS[part] ?? (part.length > 14 ? "Detalhe" : part);
        return (
          <span key={to} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-text-muted" />
            {isLast ? (
              <span className="font-medium text-text">{label}</span>
            ) : (
              <Link to={to} className="text-text-muted hover:text-text">{label}</Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
