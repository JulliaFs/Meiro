import { useMemo, useState } from "react";
import { Upload, Search, FileText, Image as ImageIcon, File, Sparkles, Download, Trash2, Loader2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { ProfessorIaModal } from "../components/common/ProfessorIaModal";
import { useAreas, useMateriais } from "../hooks/useLiveData";
import { arquivoService, criarMaterialComArquivo, excluirMaterial } from "../services";
import { useEnvio } from "../hooks/useEnvio";
import { confirmar } from "../lib/utils";
import type { Material, TipoMaterial } from "../types";

function iconFor(tipo: TipoMaterial) {
  if (tipo === "imagem") return ImageIcon;
  if (tipo === "pdf" || tipo === "docx") return FileText;
  return File;
}

function UploadForm({ onClose }: { onClose: () => void }) {
  const areas = useAreas();
  const [file, setFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tags, setTags] = useState("");
  const [area, setArea] = useState("");
  const [pasta, setPasta] = useState("");
  const { enviando, executar } = useEnvio();

  function salvar() {
    if (!file || !titulo.trim()) return;
    executar(
      () =>
        criarMaterialComArquivo(file, {
          titulo,
          descricao,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          area,
          pasta,
        }),
      onClose
    );
  }

  return (
    <div className="space-y-3">
      <label className="btn btn-secondary cursor-pointer w-full justify-center">
        <Upload size={16} /> {file ? file.name : "Selecionar arquivo (PDF, DOCX, imagem)"}
        <input
          type="file"
          accept=".pdf,.doc,.docx,image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            // já sugere o nome do arquivo como título
            if (f && !titulo.trim()) setTitulo(f.name.replace(/\.[^.]+$/, ""));
          }}
        />
      </label>
      <input className="input" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      <textarea className="input" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      <input className="input" placeholder="Tags (separadas por vírgula)" value={tags} onChange={(e) => setTags(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <select className="input" value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="">Sem área</option>
          {areas?.map((a) => <option key={a.id} value={a.nome}>{a.nome}</option>)}
        </select>
        <input className="input" placeholder="Pasta" value={pasta} onChange={(e) => setPasta(e.target.value)} />
      </div>
      <button className="btn btn-primary w-full justify-center" onClick={salvar} disabled={enviando || !file || !titulo.trim()}>
        {enviando && <Loader2 size={16} className="animate-spin" />}
        {enviando ? "Enviando..." : "Salvar material"}
      </button>
    </div>
  );
}

export default function BibliotecaPage() {
  const materiais = useMateriais();
  const areas = useAreas();
  const [openUpload, setOpenUpload] = useState(false);
  const [preview, setPreview] = useState<Material | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [iaMaterial, setIaMaterial] = useState<Material | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroArea, setFiltroArea] = useState("todas");

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase();
    return (materiais ?? []).filter(
      (m) =>
        (filtroArea === "todas" || m.area === filtroArea) &&
        (!q || m.titulo.toLowerCase().includes(q) || m.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [materiais, busca, filtroArea]);

  async function abrirPreview(m: Material) {
    if (m.url && !m.arquivoId) {
      window.open(m.url, "_blank", "noreferrer");
      return;
    }
    if (!m.arquivoId) return;
    try {
      const url = await arquivoService.getSignedUrl(m.arquivoId);
      setPreviewUrl(url);
      setPreview(m);
    } catch {
      // erro já exibido
    }
  }

  function fecharPreview() {
    setPreview(null);
    setPreviewUrl(null);
  }

  async function baixar(m: Material) {
    if (!m.arquivoId) return;
    // mantém a extensão original para o arquivo abrir no programa certo
    const ext = m.arquivoId.match(/\.[^./]+$/)?.[0] ?? "";
    const nome = m.titulo.toLowerCase().endsWith(ext.toLowerCase()) ? m.titulo : m.titulo + ext;
    await arquivoService.download(m.arquivoId, nome).catch(() => {});
  }

  function excluir(m: Material) {
    if (confirmar(`Excluir "${m.titulo}" da biblioteca?`)) excluirMaterial(m).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Biblioteca</h1>
          <p className="text-text-muted text-sm mt-1">Central única de conhecimento: PDFs, livros, vídeos, artigos e links.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpenUpload(true)}>
          <Upload size={16} /> Adicionar material
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input className="input pl-9" placeholder="Buscar por título ou tag..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <select className="input w-auto" value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
          <option value="todas">Todas as áreas</option>
          {areas?.map((a) => <option key={a.id} value={a.nome}>{a.nome}</option>)}
        </select>
      </div>

      {filtrados.length === 0 && (
        <EmptyState
          icon={<FileText size={24} />}
          title="Sua biblioteca está vazia"
          description="Envie PDFs, DOCX ou imagens para começar a centralizar seu conhecimento aqui."
          action={<button className="btn btn-primary" onClick={() => setOpenUpload(true)}><Upload size={16} /> Adicionar material</button>}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map((m) => {
          const Icon = iconFor(m.tipo);
          return (
            <Card key={m.id}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{m.titulo}</p>
                  {m.descricao && <p className="text-xs text-text-muted truncate">{m.descricao}</p>}
                </div>
                <button className="text-text-muted hover:text-red-500 p-1 shrink-0" onClick={() => excluir(m)}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex gap-1 flex-wrap mt-3">
                {m.area && <Badge>{m.area}</Badge>}
                {m.tags.map((t) => <Badge key={t}>{t}</Badge>)}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="btn btn-secondary flex-1 justify-center" onClick={() => abrirPreview(m)}>Visualizar</button>
                <button className="btn btn-secondary" onClick={() => baixar(m)}><Download size={14} /></button>
                <button className="btn btn-secondary" onClick={() => setIaMaterial(m)}><Sparkles size={14} /></button>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={openUpload} onClose={() => setOpenUpload(false)} title="Adicionar material">
        <UploadForm onClose={() => setOpenUpload(false)} />
      </Modal>

      <Modal open={!!preview} onClose={fecharPreview} title={preview?.titulo ?? ""} wide>
        {previewUrl && (
          preview?.tipo === "imagem" ? (
            <img src={previewUrl} alt={preview.titulo} className="max-w-full rounded-lg" />
          ) : (
            <iframe src={previewUrl} className="w-full h-[60vh] rounded-lg border border-border" title={preview?.titulo} />
          )
        )}
      </Modal>

      {iaMaterial && <ProfessorIaModal open onClose={() => setIaMaterial(null)} titulo={iaMaterial.titulo} />}
    </div>
  );
}
