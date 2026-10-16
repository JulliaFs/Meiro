import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Play, RotateCw, Brain, Search } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { StudyMode } from "../components/flashcards/StudyMode";
import { estaVencido, montarFila } from "../lib/flashcards";
import { useAreas, useFlashcards } from "../hooks/useLiveData";
import { useEnvio } from "../hooks/useEnvio";
import { flashcardService } from "../services";
import { confirmar, todayIso } from "../lib/utils";
import type { Dificuldade, Flashcard } from "../types";

function FlashcardForm({ card, onClose }: { card?: Flashcard; onClose: () => void }) {
  const areas = useAreas();
  const [pergunta, setPergunta] = useState(card?.pergunta ?? "");
  const [resposta, setResposta] = useState(card?.resposta ?? "");
  const [categoria, setCategoria] = useState(card?.categoria ?? "");
  const [area, setArea] = useState(card?.area ?? "");
  const [dificuldade, setDificuldade] = useState<Dificuldade>(card?.dificuldade ?? "medio");
  const { enviando, executar } = useEnvio();

  function salvar() {
    if (!pergunta.trim() || !resposta.trim()) return;
    const payload = {
      pergunta,
      resposta,
      categoria,
      area,
      dificuldade,
      intervaloDias: card?.intervaloDias ?? 1,
      acertosSeguidos: card?.acertosSeguidos ?? 0,
      proximaRevisao: card?.proximaRevisao ?? todayIso(),
    };
    executar(() => (card ? flashcardService.update(card.id, payload) : flashcardService.create(payload)), onClose);
  }

  return (
    <div className="space-y-3">
      <textarea className="input" placeholder="Pergunta" value={pergunta} onChange={(e) => setPergunta(e.target.value)} />
      <textarea className="input" placeholder="Resposta" value={resposta} onChange={(e) => setResposta(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <input className="input" placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        <select className="input" value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="">Sem área</option>
          {areas?.map((a) => <option key={a.id} value={a.nome}>{a.nome}</option>)}
        </select>
      </div>
      <select className="input" value={dificuldade} onChange={(e) => setDificuldade(e.target.value as Dificuldade)}>
        <option value="facil">Fácil</option>
        <option value="medio">Médio</option>
        <option value="dificil">Difícil</option>
      </select>
      <button className="btn btn-primary w-full justify-center" onClick={salvar} disabled={enviando || !pergunta.trim() || !resposta.trim()}>
        Salvar
      </button>
    </div>
  );
}

const POR_PAGINA = 30;

export default function FlashcardsPage() {
  const flashcards = useFlashcards();
  const [modal, setModal] = useState<"new" | Flashcard | null>(null);
  const [fila, setFila] = useState<Flashcard[] | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [busca, setBusca] = useState("");
  const [visiveis, setVisiveis] = useState(POR_PAGINA);
  const [abertos, setAbertos] = useState<Set<string>>(new Set());

  const categorias = useMemo(
    () => Array.from(new Set((flashcards ?? []).map((f) => f.categoria).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true })),
    [flashcards]
  );
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (flashcards ?? []).filter(
      (f) =>
        (filtroCategoria === "todas" || f.categoria === filtroCategoria) &&
        (!termo || f.pergunta.toLowerCase().includes(termo) || f.resposta.toLowerCase().includes(termo))
    );
  }, [flashcards, filtroCategoria, busca]);

  function alternar(id: string) {
    setAbertos((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  const vencidos = useMemo(() => filtrados.filter((f) => estaVencido(f)), [filtrados]);
  // sem nada vencido, a revisão vira um treino com todos os cartões do filtro
  const filaRevisao = vencidos.length > 0 ? vencidos : filtrados;

  function excluir(f: Flashcard) {
    if (confirmar("Excluir este flashcard?")) flashcardService.remove(f.id).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Flashcards</h1>
          <p className="text-text-muted text-sm mt-1">Crie e revise flashcards para fixar o conteúdo.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setFila(montarFila(filaRevisao, 20))} disabled={filaRevisao.length === 0}>
            <Play size={16} /> {vencidos.length > 0 ? `Revisar ${Math.min(20, vencidos.length)} de ${vencidos.length}` : "Treinar 20"}
          </button>
          <button className="btn btn-primary" onClick={() => setModal("new")}>
            <Plus size={16} /> Novo flashcard
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input className="input pl-9" placeholder="Buscar na pergunta ou resposta" value={busca} onChange={(e) => { setBusca(e.target.value); setVisiveis(POR_PAGINA); }} />
        </div>
        <select className="input sm:w-auto" value={filtroCategoria} onChange={(e) => { setFiltroCategoria(e.target.value); setVisiveis(POR_PAGINA); }}>
          <option value="todas">Todas as categorias</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {filtrados.length > 0 && <p className="text-xs text-text-muted">{filtrados.length} flashcard(s) · toque num cartão para ver a resposta</p>}

      {flashcards === undefined && <Card><p className="text-sm text-text-muted animate-pulse">Carregando seus flashcards…</p></Card>}

      {flashcards !== undefined && filtrados.length === 0 && (
        <EmptyState
          icon={<Brain size={24} />}
          title="Nenhum flashcard por aqui"
          description="Crie seus primeiros flashcards para começar a fixar o conteúdo com revisão espaçada."
          action={<button className="btn btn-primary" onClick={() => setModal("new")}><Plus size={16} /> Criar flashcard</button>}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.slice(0, visiveis).map((f) => (
          <Card key={f.id}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <button className="text-left min-w-0 flex-1" onClick={() => alternar(f.id)} aria-expanded={abertos.has(f.id)}>
                <p className="text-sm font-semibold text-text whitespace-pre-wrap line-clamp-6">{f.pergunta}</p>
                {abertos.has(f.id) ? (
                  <p className="text-sm text-emerald-600 mt-2 whitespace-pre-wrap">{f.resposta}</p>
                ) : (
                  <p className="text-xs text-text-muted mt-2">Ver resposta</p>
                )}
              </button>
              <div className="flex gap-1 shrink-0">
                <button className="text-text-muted hover:text-text p-2" aria-label="Editar" onClick={() => setModal(f)}><Pencil size={14} /></button>
                <button className="text-text-muted hover:text-red-500 p-2" aria-label="Excluir" onClick={() => excluir(f)}><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {f.categoria && <Badge>{f.categoria}</Badge>}
              {f.area && <Badge>{f.area}</Badge>}
              <Badge><RotateCw size={10} /> {f.intervaloDias}d</Badge>
            </div>
          </Card>
        ))}
      </div>
      {filtrados.length > visiveis && (
        <button className="btn btn-secondary w-full justify-center" onClick={() => setVisiveis((v) => v + POR_PAGINA)}>
          Mostrar mais ({filtrados.length - visiveis} restantes)
        </button>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "new" ? "Novo flashcard" : "Editar flashcard"}>
        <FlashcardForm card={modal !== "new" ? (modal as Flashcard) ?? undefined : undefined} onClose={() => setModal(null)} />
      </Modal>

      {fila && <StudyMode cards={fila} onClose={() => setFila(null)} />}
    </div>
  );
}
