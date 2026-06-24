import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import {
  useAnotacoes,
  useCapitulos,
  useCertificados,
  useCursos,
  useFlashcards,
  useMateriais,
} from "../../hooks/useLiveData";

interface Result {
  id: string;
  tipo: string;
  titulo: string;
  to: string;
}

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const cursos = useCursos();
  const materiais = useMateriais();
  const anotacoes = useAnotacoes();
  const flashcards = useFlashcards();
  const certificados = useCertificados();
  const capitulos = useCapitulos();

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: Result[] = [];
    cursos?.forEach((c) => c.nome.toLowerCase().includes(q) && out.push({ id: c.id, tipo: "Curso", titulo: c.nome, to: "/cursos" }));
    materiais?.forEach((m) => m.titulo.toLowerCase().includes(q) && out.push({ id: m.id, tipo: "Material", titulo: m.titulo, to: "/biblioteca" }));
    anotacoes?.forEach((a) => a.titulo.toLowerCase().includes(q) && out.push({ id: a.id, tipo: "Anotação", titulo: a.titulo, to: "/anotacoes" }));
    flashcards?.forEach((f) => f.pergunta.toLowerCase().includes(q) && out.push({ id: f.id, tipo: "Flashcard", titulo: f.pergunta, to: "/flashcards" }));
    certificados?.forEach((c) => c.nome.toLowerCase().includes(q) && out.push({ id: c.id, tipo: "Certificado", titulo: c.nome, to: "/certificados" }));
    capitulos?.forEach((c) => c.nome.toLowerCase().includes(q) && out.push({ id: c.id, tipo: "Capítulo", titulo: c.nome, to: "/faculdade" }));
    return out.slice(0, 30);
  }, [query, cursos, materiais, anotacoes, flashcards, certificados, capitulos]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div className="card w-full max-w-xl p-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-2">
          <Search size={18} className="text-text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar em cursos, PDFs, anotações, flashcards, certificados, capítulos..."
            className="flex-1 bg-transparent outline-none py-2 text-sm"
          />
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>
        {results.length > 0 && (
          <div className="mt-2 max-h-80 overflow-y-auto border-t border-border pt-2">
            {results.map((r) => (
              <button
                key={`${r.tipo}-${r.id}`}
                onClick={() => {
                  navigate(r.to);
                  onClose();
                }}
                className="w-full text-left px-2 py-2 rounded-lg hover:bg-surface-2 flex items-center justify-between gap-2"
              >
                <span className="truncate text-sm">{r.titulo}</span>
                <span className="badge bg-surface-2 text-text-muted shrink-0">{r.tipo}</span>
              </button>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <p className="text-sm text-text-muted px-2 py-3">Nenhum resultado para "{query}".</p>
        )}
      </div>
    </div>
  );
}
