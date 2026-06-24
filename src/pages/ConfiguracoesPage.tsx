import { useEffect, useState } from "react";
import { Download, Upload, Moon, Sun, Database } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { db } from "../db/database";
import { useUiStore } from "../store/useUiStore";

const TABLES = [
  "faculdades", "fases", "capitulos", "areas", "cursos", "certificados",
  "materiais", "arquivos", "anotacoes", "flashcards", "metas", "habilidades", "sessoes", "configuracoes",
] as const;

export default function ConfiguracoesPage() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const [nome, setNome] = useState("Estudante");

  useEffect(() => {
    db.configuracoes.get("default").then((c) => c && setNome(c.nome));
  }, []);

  async function salvarNome() {
    await db.configuracoes.put({ id: "default", tema: theme, nome });
  }

  async function exportar() {
    const dump: Record<string, unknown> = {};
    for (const t of TABLES) {
      dump[t] = await (db as any)[t].toArray();
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ju-academy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  async function importar(file: File) {
    const text = await file.text();
    const dump = JSON.parse(text);
    await db.transaction("rw", TABLES.map((t) => (db as any)[t]), async () => {
      for (const t of TABLES) {
        if (Array.isArray(dump[t])) {
          await (db as any)[t].clear();
          await (db as any)[t].bulkAdd(dump[t]);
        }
      }
    });
    alert("Backup importado com sucesso! Recarregue a página.");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">Configurações</h1>
        <p className="text-text-muted text-sm mt-1">Personalize sua experiência no JU Academy OS.</p>
      </div>

      <Card>
        <CardHeader title="Perfil" />
        <div className="flex gap-2">
          <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} />
          <button className="btn btn-primary" onClick={salvarNome}>Salvar</button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Aparência" />
        <button className="btn btn-secondary" onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          Alternar para tema {theme === "dark" ? "claro" : "escuro"}
        </button>
      </Card>

      <Card>
        <CardHeader title="Backup de dados" subtitle="Seus dados ficam salvos localmente no navegador (IndexedDB). Exporte regularmente para não perder nada." />
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
          Hoje todos os dados são armazenados localmente no seu navegador via IndexedDB, sem custo e sem backend.
          A camada de serviços (<code className="bg-surface-2 px-1 rounded">src/services</code>) foi desenhada para que,
          no futuro, seja possível trocar o IndexedDB por um banco Supabase (gratuito) sem precisar reescrever as
          páginas da aplicação — apenas a implementação interna dos services mudaria.
        </p>
      </Card>
    </div>
  );
}
