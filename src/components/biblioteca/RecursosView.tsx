import { useMemo, useState } from "react";
import { ExternalLink, Plus, Trash2, PlayCircle, GraduationCap, FileText, Wrench, Link as LinkIcon } from "lucide-react";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { EmptyState } from "../ui/EmptyState";
import { materialService } from "../../services";
import { useEnvio } from "../../hooks/useEnvio";
import { confirmar, todayIso } from "../../lib/utils";
import type { Material, StatusEstudo, TipoMaterial } from "../../types";

const TIPOS_RECURSO: TipoMaterial[] = ["curso", "video", "artigo", "ferramenta", "link"];

const TIPO_INFO: Record<string, { label: string; icon: typeof FileText }> = {
  curso: { label: "Curso", icon: GraduationCap },
  video: { label: "Vídeo", icon: PlayCircle },
  artigo: { label: "Artigo/Doc", icon: FileText },
  ferramenta: { label: "Ferramenta", icon: Wrench },
  link: { label: "Link", icon: LinkIcon },
};

const STATUS: { valor: StatusEstudo; label: string; classe: string }[] = [
  { valor: "quero_ver", label: "Quero ver", classe: "bg-surface-2 text-text-muted" },
  { valor: "vendo", label: "Vendo", classe: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { valor: "visto", label: "Visto ✓", classe: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
];

function proximoStatus(s?: StatusEstudo): StatusEstudo {
  const i = STATUS.findIndex((x) => x.valor === (s ?? "quero_ver"));
  return STATUS[(i + 1) % STATUS.length].valor;
}

function RecursoForm({ temas, onClose }: { temas: string[]; onClose: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [url, setUrl] = useState("");
  const [tipo, setTipo] = useState<TipoMaterial>("curso");
  const [pasta, setPasta] = useState("");
  const { enviando, executar } = useEnvio();
  const valido = titulo.trim() && /^https?:\/\//.test(url.trim());

  function salvar() {
    if (!valido) return;
    executar(
      () => materialService.create({ titulo: titulo.trim(), url: url.trim(), tipo, pasta: pasta.trim() || undefined, tags: [], statusEstudo: "quero_ver", dataUpload: todayIso() }),
      onClose
    );
  }

  return (
    <div className="space-y-3">
      <input className="input" placeholder="Nome (ex.: Curso de React na Alura)" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      <input className="input" placeholder="Link (https://...)" value={url} onChange={(e) => setUrl(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value as TipoMaterial)}>
          {TIPOS_RECURSO.map((t) => <option key={t} value={t}>{TIPO_INFO[t].label}</option>)}
        </select>
        <input className="input" placeholder="Tema (ex.: Fase 7 · React)" list="temas-recurso" value={pasta} onChange={(e) => setPasta(e.target.value)} />
        <datalist id="temas-recurso">{temas.map((t) => <option key={t} value={t} />)}</datalist>
      </div>
      <button className="btn btn-primary w-full justify-center" onClick={salvar} disabled={enviando || !valido}>Salvar recurso</button>
    </div>
  );
}

/** Biblioteca de recursos (cursos, vídeos, artigos, ferramentas) agrupados por tema, com status. */
export function RecursosView({ materiais, busca }: { materiais: Material[]; busca: string }) {
  const [filtroStatus, setFiltroStatus] = useState<"todos" | StatusEstudo>("todos");
  const [aberto, setAberto] = useState(false);

  const recursos = useMemo(() => materiais.filter((m) => !m.arquivoId && m.url), [materiais]);
  const temas = useMemo(() => [...new Set(recursos.map((r) => r.pasta || "Sem tema"))].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true })), [recursos]);

  const grupos = useMemo(() => {
    const q = busca.toLowerCase();
    const filtrados = recursos.filter(
      (r) =>
        (filtroStatus === "todos" || (r.statusEstudo ?? "quero_ver") === filtroStatus) &&
        (!q || r.titulo.toLowerCase().includes(q) || (r.pasta ?? "").toLowerCase().includes(q))
    );
    const mapa = new Map<string, Material[]>();
    filtrados.forEach((r) => {
      const t = r.pasta || "Sem tema";
      mapa.set(t, [...(mapa.get(t) ?? []), r]);
    });
    return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR", { numeric: true }));
  }, [recursos, filtroStatus, busca]);

  function mudarStatus(r: Material) {
    materialService.update(r.id, { statusEstudo: proximoStatus(r.statusEstudo) }).catch(() => {});
  }

  function excluir(r: Material) {
    if (confirmar(`Tirar "${r.titulo}" da biblioteca?`)) materialService.remove(r.id).catch(() => {});
  }

  const chip = (ativo: boolean) =>
    `px-3 py-1.5 rounded-full text-sm border transition-colors ${ativo ? "bg-brand text-white border-brand" : "border-border text-text-muted hover:text-text"}`;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap items-center">
        <button className={chip(filtroStatus === "todos")} onClick={() => setFiltroStatus("todos")}>Todos</button>
        {STATUS.map((s) => (
          <button key={s.valor} className={chip(filtroStatus === s.valor)} onClick={() => setFiltroStatus(s.valor)}>{s.label}</button>
        ))}
        <button className="btn btn-primary ml-auto" onClick={() => setAberto(true)}><Plus size={16} /> Recurso</button>
      </div>

      {grupos.length === 0 && (
        <EmptyState
          icon={<GraduationCap size={24} />}
          title={recursos.length === 0 ? "Nenhum recurso ainda" : "Nada com esse filtro"}
          description="Guarde aqui cursos, vídeos, artigos e ferramentas para estudar quando der."
        />
      )}

      {grupos.map(([tema, itens]) => (
        <Card key={tema}>
          <p className="font-semibold text-sm mb-3">{tema} <span className="text-text-muted font-normal">· {itens.length}</span></p>
          <div className="space-y-2">
            {itens.map((r) => {
              const info = TIPO_INFO[r.tipo] ?? TIPO_INFO.link;
              const st = STATUS.find((s) => s.valor === (r.statusEstudo ?? "quero_ver"))!;
              return (
                <div key={r.id} className="flex items-center gap-3 border border-border rounded-lg p-2.5">
                  <info.icon size={18} className="text-brand shrink-0" />
                  <a href={r.url} target="_blank" rel="noreferrer" className="flex-1 min-w-0 text-sm hover:underline">
                    <span className="block line-clamp-2">{r.titulo}</span>
                    <span className="text-2xs text-text-muted">{info.label}</span>
                  </a>
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-text-muted hover:text-text p-1.5 hidden sm:block" aria-label="Abrir"><ExternalLink size={14} /></a>
                  <button className={`text-xs rounded-full px-2.5 py-1 shrink-0 ${st.classe}`} onClick={() => mudarStatus(r)} title="Tocar para mudar o status">
                    {st.label}
                  </button>
                  <button className="text-text-muted hover:text-red-500 p-1.5 shrink-0" onClick={() => excluir(r)} aria-label="Excluir"><Trash2 size={14} /></button>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <Modal open={aberto} onClose={() => setAberto(false)} title="Novo recurso">
        <RecursoForm temas={temas} onClose={() => setAberto(false)} />
      </Modal>
    </div>
  );
}
