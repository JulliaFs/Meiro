import { useMemo, useState, type ReactNode } from "react";
import { Play } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { StudyMode } from "../components/flashcards/StudyMode";
import { estaVencido, montarFila, TAMANHOS_SESSAO } from "../lib/flashcards";
import { useFlashcards } from "../hooks/useLiveData";
import { formatDate, todayIso } from "../lib/utils";
import { CalendarClock, AlertTriangle, History } from "lucide-react";
import type { Flashcard } from "../types";

const LIMITE_LISTA = 8;

function ListaCurta({ cards, badge }: { cards: Flashcard[]; badge: (c: Flashcard) => ReactNode }) {
  return (
    <div className="space-y-2">
      {cards.slice(0, LIMITE_LISTA).map((c) => (
        <div key={c.id} className="flex items-center justify-between gap-2 text-sm border border-border rounded-lg p-2">
          <span className="truncate">{c.pergunta.split("\n")[0]}</span>
          <span className="shrink-0">{badge(c)}</span>
        </div>
      ))}
      {cards.length > LIMITE_LISTA && <p className="text-xs text-text-muted">e mais {cards.length - LIMITE_LISTA}</p>}
    </div>
  );
}

export default function RevisoesPage() {
  const flashcards = useFlashcards();
  const hoje = todayIso();
  const [fila, setFila] = useState<Flashcard[] | null>(null);
  const [categoria, setCategoria] = useState("todas");
  const [tamanho, setTamanho] = useState<number>(20);

  const categorias = useMemo(
    () => Array.from(new Set((flashcards ?? []).map((f) => f.categoria).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true })),
    [flashcards]
  );

  const { paraHoje, atrasados, futuras, historico, pendentes } = useMemo(() => {
    const cards = (flashcards ?? []).filter((c) => categoria === "todas" || c.categoria === categoria);
    return {
      // cartão nunca revisado também é "para hoje"
      paraHoje: cards.filter((c) => !c.proximaRevisao || c.proximaRevisao === hoje),
      atrasados: cards.filter((c) => c.proximaRevisao && c.proximaRevisao < hoje),
      futuras: cards.filter((c) => c.proximaRevisao && c.proximaRevisao > hoje).sort((a, b) => (a.proximaRevisao! < b.proximaRevisao! ? -1 : 1)),
      historico: cards.filter((c) => c.ultimaRevisao).sort((a, b) => (b.ultimaRevisao! < a.ultimaRevisao! ? -1 : 1)),
      pendentes: cards.filter((c) => estaVencido(c, hoje)),
    };
  }, [flashcards, hoje, categoria]);

  const qtdSessao = tamanho > 0 ? Math.min(tamanho, pendentes.length) : pendentes.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Revisões</h1>
        <p className="text-text-muted text-sm mt-1">Sistema de repetição espaçada inspirado no Anki.</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <label className="flex-1 min-w-0 text-sm">
            <span className="text-text-muted text-xs">Categoria</span>
            <select className="input mt-1" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="todas">Todas as categorias</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-sm sm:w-40">
            <span className="text-text-muted text-xs">Cartões por sessão</span>
            <select className="input mt-1" value={tamanho} onChange={(e) => setTamanho(Number(e.target.value))}>
              {TAMANHOS_SESSAO.map((t) => <option key={t} value={t}>{t === 0 ? "Todos" : t}</option>)}
            </select>
          </label>
          <button className="btn btn-primary justify-center" onClick={() => setFila(montarFila(pendentes, tamanho))} disabled={pendentes.length === 0}>
            <Play size={16} /> {pendentes.length > 0 ? `Revisar ${qtdSessao} de ${pendentes.length}` : "Nada para revisar"}
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Atrasados" subtitle={`${atrasados.length} flashcard(s)`} action={<AlertTriangle size={18} className="text-red-500" />} />
          {atrasados.length === 0 && <p className="text-sm text-text-muted">Nada atrasado 🎉</p>}
          <ListaCurta cards={atrasados} badge={(c) => <Badge className="bg-red-500/15 text-red-600">{formatDate(c.proximaRevisao!)}</Badge>} />
        </Card>

        <Card>
          <CardHeader title="Para hoje" subtitle={`${paraHoje.length} flashcard(s)`} action={<CalendarClock size={18} className="text-brand" />} />
          {paraHoje.length === 0 && <p className="text-sm text-text-muted">Nada para revisar hoje.</p>}
          <ListaCurta cards={paraHoje} badge={(c) => (c.categoria ? <Badge>{c.categoria}</Badge> : null)} />
        </Card>
      </div>

      <Card>
        <CardHeader title="Calendário de próximas revisões" />
        {futuras.length === 0 ? (
          <EmptyState icon={<CalendarClock size={28} />} title="Sem revisões futuras agendadas" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {futuras.slice(0, 12).map((c) => (
              <div key={c.id} className="border border-border rounded-lg p-2 text-xs">
                <p className="font-medium truncate">{c.pergunta.split("\n")[0]}</p>
                <p className="text-text-muted mt-1">{formatDate(c.proximaRevisao!)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Histórico de revisões" action={<History size={18} className="text-text-muted" />} />
        {historico.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhuma revisão feita ainda.</p>
        ) : (
          <ListaCurta cards={historico} badge={(c) => <Badge>{formatDate(c.ultimaRevisao!)}</Badge>} />
        )}
      </Card>

      {fila && <StudyMode cards={fila} onClose={() => setFila(null)} />}
    </div>
  );
}
