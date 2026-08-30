import { useState } from "react";
import { Download, Upload, Moon, Sun, Database, LogOut } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../store/useAuthStore";
import { useUiStore } from "../store/useUiStore";

const TABLES = [
  "anos", "fases", "capitulos", "areas", "cursos", "modulos", "aulas", "certificados",
  "materiais", "anotacoes", "flashcards", "metas", "habilidades", "sessoes",
] as const;

export default function ConfiguracoesPage() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const [nome, setNome] = useState((session?.user.user_metadata?.nome as string) ?? "");
  const [salvando, setSalvando] = useState(false);

  async function salvarNome() {
    setSalvando(true);
    await supabase.auth.updateUser({ data: { nome } });
    setSalvando(false);
  }

  async function exportar() {
    const dump: Record<string, unknown> = {};
    for (const t of TABLES) {
      const { data } = await supabase.from(t).select("*");
      dump[t] = data ?? [];
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meiro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  async function importar(file: File) {
    const text = await file.text();
    const dump = JSON.parse(text);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    for (const t of TABLES) {
      const rows = dump[t];
      if (!Array.isArray(rows) || rows.length === 0) continue;
      const prepared = rows.map((r: Record<string, unknown>) => ({ ...r, user_id: userData.user!.id }));
      await supabase.from(t).insert(prepared);
    }
    alert("Backup importado com sucesso! Recarregue a página.");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">Configurações</h1>
        <p className="text-text-muted text-sm mt-1">Personalize sua experiência no Meiro.</p>
      </div>

      <Card>
        <CardHeader title="Perfil" subtitle={session?.user.email} />
        <div className="flex gap-2">
          <input className="input" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <button className="btn btn-primary" onClick={salvarNome} disabled={salvando}>Salvar</button>
        </div>
        <button onClick={signOut} className="btn btn-secondary mt-3 text-red-500">
          <LogOut size={14} /> Sair da conta
        </button>
      </Card>

      <Card>
        <CardHeader title="Aparência" />
        <button className="btn btn-secondary" onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          Alternar para tema {theme === "dark" ? "claro" : "escuro"}
        </button>
      </Card>

      <Card>
        <CardHeader title="Backup de dados" subtitle="Seus dados ficam salvos no Supabase, vinculados à sua conta. Exporte regularmente como segurança extra." />
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-secondary" onClick={exportar}><Download size={16} /> Exportar backup (.json)</button>
          <label className="btn btn-secondary cursor-pointer">
            <Upload size={16} /> Importar backup
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importar(e.target.files[0])} />
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader title="Armazenamento" action={<Database size={18} className="text-text-muted" />} />
        <p className="text-sm text-text-muted">
          Seus dados ficam em um banco PostgreSQL no Supabase, protegidos por autenticação e por políticas de
          segurança (RLS) que garantem que só você acessa o seu conteúdo. Arquivos (PDF, DOCX, imagens) ficam no
          Supabase Storage, também privados por usuário.
        </p>
      </Card>
    </div>
  );
}
