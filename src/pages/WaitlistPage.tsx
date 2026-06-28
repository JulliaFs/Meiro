import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Send, RotateCcw, Search, Trash2, X } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { supabase } from "../lib/supabaseClient";
import { formatDate } from "../lib/utils";

type Status = "pending" | "approved" | "rejected";

interface WaitlistEntry {
  id: string;
  email: string;
  status: Status;
  notes: string | null;
  created_at: string;
  invited_at: string | null;
}

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-surface-2 text-text-muted",
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<{ id: string; message: string } | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("waitlist_signups")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setEntries((data as WaitlistEntry[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: Status) {
    setBusyId(id);
    const { error } = await supabase.from("waitlist_signups").update({ status }).eq("id", id);
    if (!error) {
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    }
    setBusyId(null);
  }

  async function removeEntry(id: string) {
    if (!window.confirm("Remover este e-mail da lista de espera?")) return;
    setBusyId(id);
    const { error } = await supabase.from("waitlist_signups").delete().eq("id", id);
    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
    setBusyId(null);
  }

  async function inviteEntry(entry: WaitlistEntry) {
    setBusyId(entry.id);
    setInviteError(null);
    const { data, error } = await supabase.functions.invoke<{ ok: boolean; error?: string }>("invite-user", {
      body: { email: entry.email },
    });
    if (error || !data?.ok) {
      setInviteError({ id: entry.id, message: data?.error ?? error?.message ?? "Não foi possível enviar o convite." });
      setBusyId(null);
      return;
    }
    const invitedAt = new Date().toISOString();
    await supabase.from("waitlist_signups").update({ status: "approved", invited_at: invitedAt }).eq("id", entry.id);
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, status: "approved", invited_at: invitedAt } : e))
    );
    setBusyId(null);
  }

  function copyEmail(entry: WaitlistEntry) {
    navigator.clipboard.writeText(entry.email);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const filtered = entries.filter((e) => {
    if (filter !== "all" && e.status !== filter) return false;
    if (search && !e.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: entries.length,
    pending: entries.filter((e) => e.status === "pending").length,
    approved: entries.filter((e) => e.status === "approved").length,
    rejected: entries.filter((e) => e.status === "rejected").length,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title">Lista de Espera</h1>
        <p className="text-text-muted text-sm mt-1">
          Pessoas que se inscreveram na landing page para entrar no beta do Meiro.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Inscritos"
          subtitle={`${counts.all} no total · ${counts.pending} pendentes · ${counts.approved} aprovados`}
        />

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              className="input pl-8"
              placeholder="Buscar por e-mail"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`btn text-xs px-3 py-1.5 ${filter === s ? "btn-primary" : "btn-secondary"}`}
            >
              {s === "all" ? "Todos" : STATUS_LABEL[s]} ({counts[s]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={20} className="animate-spin text-brand" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhuma inscrição encontrada" description="Ninguém por aqui ainda com esse filtro." />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((entry) => (
              <div key={entry.id} className="py-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{entry.email}</p>
                      <Badge className={STATUS_STYLE[entry.status]}>{STATUS_LABEL[entry.status]}</Badge>
                    </div>
                    <p className="text-2xs text-text-muted mt-0.5">
                      Inscrito em {formatDate(entry.created_at)}
                      {entry.invited_at && ` · Convite enviado em ${formatDate(entry.invited_at)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => copyEmail(entry)} title="Copiar e-mail" className="btn btn-secondary p-2">
                      {copiedId === entry.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>

                    <button
                      onClick={() => inviteEntry(entry)}
                      disabled={busyId === entry.id}
                      title={entry.invited_at ? "Reenviar convite" : "Enviar convite e criar acesso"}
                      className="btn btn-secondary p-2 text-brand"
                    >
                      {busyId === entry.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>

                    {entry.status !== "approved" && (
                      <button
                        onClick={() => updateStatus(entry.id, "approved")}
                        disabled={busyId === entry.id}
                        title="Aprovar (sem enviar convite ainda)"
                        className="btn btn-secondary p-2 text-emerald-600"
                      >
                        <Check size={14} />
                      </button>
                    )}

                    {entry.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(entry.id, "rejected")}
                        disabled={busyId === entry.id}
                        title="Rejeitar"
                        className="btn btn-secondary p-2 text-red-500"
                      >
                        <X size={14} />
                      </button>
                    )}

                    {entry.status !== "pending" && (
                      <button
                        onClick={() => updateStatus(entry.id, "pending")}
                        disabled={busyId === entry.id}
                        title="Voltar para pendente"
                        className="btn btn-secondary p-2"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => removeEntry(entry.id)}
                      disabled={busyId === entry.id}
                      title="Remover"
                      className="btn btn-secondary p-2 text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {inviteError?.id === entry.id && (
                  <p className="text-2xs text-danger mt-1.5">{inviteError.message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Como funciona a aprovação" />
        <p className="text-sm text-text-muted leading-relaxed">
          Clique no ícone de envio (avião de papel) para liberar o acesso de verdade: isso aprova a inscrição e
          dispara automaticamente o e-mail de convite do Supabase para a pessoa criar a senha e entrar. Os botões
          de check/X só marcam o status manualmente, sem enviar nada, caso você queira organizar antes de convidar.
        </p>
      </Card>
    </div>
  );
}
