import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Upload, Moon, Sun, Database, LogOut } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { supabase } from "../lib/supabaseClient";
import { useDataBus } from "../lib/dataBus";
import { todayIso } from "../lib/utils";
import { mensagemDeErro, notificarErro, notificarSucesso } from "../store/useToastStore";
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
  const [importando, setImportando] = useState(false);
  const bump = useDataBus((s) => s.bump);
  const navigate = useNavigate();

  async function salvarNome() {
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ data: { nome: nome.trim() } });
    setSalvando(false);
    if (error) notificarErro("Não foi possível salvar o nome", error);
    else notificarSucesso("Nome atualizado.");
  }

  async function sair() {
    await signOut();
    navigate("/", { replace: true });
  }

  async function exportar() {
    const dump: Record<string, unknown> = {};
    for (const t of TABLES) {
      const { data, error } = await supabase.from(t).select("*");
      if (error) {
        notificarErro(`Não foi possível exportar "${t}"`, error);
        return;
      }
      dump[t] = data ?? [];
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meiro-backup-${todayIso()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importar(file: File) {
    let dump: Record<string, unknown>;
    try {
      dump = JSON.parse(await file.text());
    } catch {
      notificarErro("Não foi possível importar", new Error("o arquivo não é um backup .json válido"));
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    setImportando(true);
    const falhas: string[] = [];
    let total = 0;
    // TABLES está na ordem das dependências (anos antes de fases, etc.)
    for (const t of TABLES) {
      const rows = dump[t];
      if (!Array.isArray(rows) || rows.length === 0) continue;
      const prepared = rows.map((r: Record<string, unknown>) => ({ ...r, user_id: userData.user!.id }));
      // upsert: reimportar o mesmo backup atualiza em vez de falhar por id repetido
      const { error } = await supabase.from(t).upsert(prepared, { onConflict: "id" });
      if (error) falhas.push(`${t}: ${mensagemDeErro(error)}`);
      else total += prepared.length;
    }
    setImportando(false);
    TABLES.forEach((t) => bump(t));
    if (falhas.length > 0) {
      notificarErro("Parte do backup não foi importada", new Error(falhas.join(" · ")));
    } else {
      notificarSucesso(`Backup importado: ${total} registro(s).`);
    }
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
        <button onClick={sair} className="btn btn-secondary mt-3 text-red-500">
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
          <label className={`btn btn-secondary cursor-pointer ${importando ? "opacity-60 pointer-events-none" : ""}`}>
            <Upload size={16} /> {importando ? "Importando..." : "Importar backup"}
            <input
              type="file"
              accept="application/json"
              className="hidden"
              disabled={importando}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) importar(file);
              }}
            />
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
