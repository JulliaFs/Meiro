import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Play, RotateCw } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { useAreas, useFlashcards } from "../hooks/useLiveData";
import { flashcardService } from "../services";
import { todayIso } from "../lib/utils";
import type { Dificuldade, Flashcard } from "../types";
import { Brain } from "lucide-react";

function FlashcardForm({ card, onClose }: { card?: Flashcard; onClose: () => void }) {
  const areas = useAreas();
  const [pergunta, setPergunta] = useState(card?.pergunta ?? "");
  const [resposta, setResposta] = useState(card?.resposta ?? "");
  const [categoria, setCategoria] = useState(card?.categoria ?? "");
  const [area, setArea] = useState(card?.area ?? "");
  const [dificuldade, setDificuldade] = useState<Dificuldade>(card?.dificuldade ?? "medio");

  async function salvar() {
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
    if (card) await flashcardService.update(card.id, payload);
    else await flashcardService.create(payload);
    onClose();
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
      <button className="btn btn-primary w-full justify-center" onClick={salvar}>Salvar</button>
    </div>
  );
}

function StudyMode({ cards, onClose }: { cards: Flashcard[]; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const card = cards[idx];

  async function marcar(dif: Dificuldade) {
    const ajuste = dif === "facil" ? 2.5 : dif === "medio" ? 1.5 : 0.5;
    const novoIntervalo = Math.max(1, Math.round(card.intervaloDias * ajuste));
    const proxima = new Date();
    proxima.setDate(proxima.getDate() + novoIntervalo);
    await flashcardService.update(card.id, {
      dificuldade: dif,
      intervaloDias: novoIntervalo,
      proximaRevisao: proxima.toISOString().slice(0, 10),
      ultimaRevisao: todayIso(),
      acertosSeguidos: dif === "dificil" ? 0 : card.acertosSeguidos + 1,
    });
    if (idx + 1 < cards.length) {
      setIdx(idx + 1);
      setRevelado(false);
    } else {
      onClose();
    }
  }

  if (!card) return null;

  return (
    <Modal open onClose={onClose} title={`Revisão (${idx + 1}/${cards.length})`} wide>
      <div className="border border-border rounded-xl p-8 text-center min-h-[160px] flex items-center justify-center">
        <p className="text-lg font-medium">{revelado ? card.resposta : card.pergunta}</p>
      </div>
      {!revelado ? (
        <button className="btn btn-primary w-full justify-center mt-4" onClick={() => setRevelado(true)}>
          Revelar resposta
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button className="btn bg-red-500/15 text-red-600 justify-center" onClick={() => marcar("dificil")}>Difícil</button>
          <button className="btn bg-amber-500/15 text-amber-600 justify-center" onClick={() => marcar("medio")}>Médio</button>
          <button className="btn bg-emerald-500/15 text-emerald-600 justify-center" onClick={() => marcar("facil")}>Fácil</button>
        </div>
      )}
    </Modal>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Flashcards</h1>
          <p className="text-text-muted text-sm mt-1">Crie e revise flashcards para fixar o conteúdo.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setStudying(true)} disabled={filtrados.length === 0}>
            <Play size={16} /> Modo revisão
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
                <button className="text-text-muted hover:text-red-500 p-1" onClick={() => flashcardService.remove(f.id)}><Trash2 size={14} /></button>
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

      {studying && <StudyMode cards={filtrados} onClose={() => setStudying(false)} />}
    </div>
  );
}
