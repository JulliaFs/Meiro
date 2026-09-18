import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Play, RotateCw, Brain } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { StudyMode } from "../components/flashcards/StudyMode";
import { estaVencido } from "../lib/flashcards";
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

export default function FlashcardsPage() {
  const flashcards = useFlashcards();
  const [modal, setModal] = useState<"new" | Flashcard | null>(null);
  const [studying, setStudying] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("todas");

  const categorias = useMemo(() => Array.from(new Set((flashcards ?? []).map((f) => f.categoria).filter(Boolean))), [flashcards]);
  const filtrados = useMemo(
    () => (flashcards ?? []).filter((f) => filtroCategoria === "todas" || f.categoria === filtroCategoria),
    [flashcards, filtroCategoria]
  );
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
          <button className="btn btn-secondary" onClick={() => setStudying(true)} disabled={filaRevisao.length === 0}>
            <Play size={16} /> {vencidos.length > 0 ? `Revisar ${vencidos.length} pendente(s)` : "Treinar todos"}
          </button>
          <button className="btn btn-primary" onClick={() => setModal("new")}>
            <Plus size={16} /> Novo flashcard
          </button>
        </div>
      </div>

      <select className="input w-auto" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
        <option value="todas">Todas as categorias</option>
        {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      {filtrados.length === 0 && (
        <EmptyState
          icon={<Brain size={24} />}
          title="Nenhum flashcard por aqui"
          description="Crie seus primeiros flashcards para começar a fixar o conteúdo com revisão espaçada."
          action={<button className="btn btn-primary" onClick={() => setModal("new")}><Plus size={16} /> Criar flashcard</button>}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map((f) => (
          <Card key={f.id}>
            <div className="flex items-start justify-between">
              <CardHeader title={f.pergunta} subtitle={f.resposta} />
              <div className="flex gap-1 shrink-0">
                <button className="text-text-muted hover:text-text p-1" onClick={() => setModal(f)}><Pencil size={14} /></button>
                <button className="text-text-muted hover:text-red-500 p-1" onClick={() => excluir(f)}><Trash2 size={14} /></button>
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

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "new" ? "Novo flashcard" : "Editar flashcard"}>
        <FlashcardForm card={modal !== "new" ? (modal as Flashcard) ?? undefined : undefined} onClose={() => setModal(null)} />
      </Modal>

      {studying && <StudyMode cards={filaRevisao} onClose={() => setStudying(false)} />}
    </div>
  );
}
