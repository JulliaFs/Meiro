import { useMemo } from "react";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { useFlashcards } from "../hooks/useLiveData";
import { todayIso } from "../lib/utils";
import { CalendarClock, AlertTriangle, History } from "lucide-react";

export default function RevisoesPage() {
  const flashcards = useFlashcards();
  const hoje = todayIso();

  const { paraHoje, atrasados, futuras, historico } = useMemo(() => {
    const cards = flashcards ?? [];
    return {
      paraHoje: cards.filter((c) => c.proximaRevisao === hoje),
      atrasados: cards.filter((c) => c.proximaRevisao && c.proximaRevisao < hoje),
      futuras: cards.filter((c) => c.proximaRevisao && c.proximaRevisao > hoje).sort((a, b) => (a.proximaRevisao! < b.proximaRevisao! ? -1 : 1)),
      historico: cards.filter((c) => c.ultimaRevisao).sort((a, b) => (b.ultimaRevisao! < a.ultimaRevisao! ? -1 : 1)),
    };
  }, [flashcards, hoje]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Revisões</h1>
        <p className="text-text-muted text-sm mt-1">Sistema de repetição espaçada inspirado no Anki.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Atrasados" subtitle={`${atrasados.length} flashcard(s)`} action={<AlertTriangle size={18} className="text-red-500" />} />
          {atrasados.length === 0 && <p className="text-sm text-text-muted">Nada atrasado 🎉</p>}
          <div className="space-y-2">
            {atrasados.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm border border-border rounded-lg p-2">
                <span className="truncate">{c.pergunta}</span>
                <Badge className="bg-red-500/15 text-red-600">{c.proximaRevisao}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Para hoje" subtitle={`${paraHoje.length} flashcard(s)`} action={<CalendarClock size={18} className="text-brand" />} />
          {paraHoje.length === 0 && <p className="text-sm text-text-muted">Nada para revisar hoje.</p>}
          <div className="space-y-2">
            {paraHoje.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm border border-border rounded-lg p-2">
                <span className="truncate">{c.pergunta}</span>
                <Badge>{c.categoria}</Badge>
              </div>
            ))}
          </div>
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
                <p className="font-medium truncate">{c.pergunta}</p>
                <p className="text-text-muted mt-1">{c.proximaRevisao}</p>
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
          <div className="space-y-2">
            {historico.slice(0, 10).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm border border-border rounded-lg p-2">
                <span className="truncate">{c.pergunta}</span>
                <Badge>{c.ultimaRevisao}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
