import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Award, Clock, ExternalLink, Upload } from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { useCertificados } from "../hooks/useLiveData";
import { arquivoService, certificadoService } from "../services";
import type { Certificado } from "../types";

function CertificadoForm({ cert, onClose }: { cert?: Certificado; onClose: () => void }) {
  const [nome, setNome] = useState(cert?.nome ?? "");
  const [instituicao, setInstituicao] = useState(cert?.instituicao ?? "");
  const [data, setData] = useState(cert?.data ?? "");
  const [cargaHoraria, setCargaHoraria] = useState(cert?.cargaHoraria ?? 0);
  const [area, setArea] = useState(cert?.area ?? "");
  const [linkValidacao, setLinkValidacao] = useState(cert?.linkValidacao ?? "");
  const [arquivoId, setArquivoId] = useState(cert?.arquivoId);

  async function uploadArquivo(file: File) {
    const a = await arquivoService.upload(file);
    setArquivoId(a.path);
  }

  async function salvar() {
    if (!nome.trim()) return;
    const payload = { nome, instituicao, data, cargaHoraria, area, linkValidacao, arquivoId };
    if (cert) await certificadoService.update(cert.id, payload);
    else await certificadoService.create(payload);
    onClose();
  }

  return (
    <div className="space-y-3">
      <input className="input" placeholder="Nome do certificado" value={nome} onChange={(e) => setNome(e.target.value)} />
      <input className="input" placeholder="Instituição" value={instituicao} onChange={(e) => setInstituicao(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <input type="date" className="input" value={data} onChange={(e) => setData(e.target.value)} />
        <input type="number" className="input" placeholder="Carga horária (h)" value={cargaHoraria} onChange={(e) => setCargaHoraria(+e.target.value)} />
      </div>
      <input className="input" placeholder="Área" value={area} onChange={(e) => setArea(e.target.value)} />
      <input className="input" placeholder="Link de validação" value={linkValidacao} onChange={(e) => setLinkValidacao(e.target.value)} />
      <label className="btn btn-secondary cursor-pointer w-full justify-center">
        <Upload size={14} /> {arquivoId ? "Arquivo anexado" : "Anexar PDF do certificado"}
        <input type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadArquivo(e.target.files[0])} />
      </label>
      <button className="btn btn-primary w-full justify-center" onClick={salvar}>Salvar</button>
    </div>
  );
}

export default function CertificadosPage() {
  const certificados = useCertificados();
  const [modal, setModal] = useState<"new" | Certificado | null>(null);

  const porCategoria = useMemo(() => {
    const map: Record<string, number> = {};
    (certificados ?? []).forEach((c) => { map[c.area || "Outros"] = (map[c.area || "Outros"] ?? 0) + 1; });
    return map;
  }, [certificados]);

  const totalHoras = certificados?.reduce((acc, c) => acc + c.cargaHoraria, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Certificados</h1>
          <p className="text-text-muted text-sm mt-1">Todos os certificados conquistados na sua jornada.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("new")}><Plus size={16} /> Novo certificado</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="p-4"><Award size={18} className="text-brand mb-2" /><p className="text-xl font-semibold">{certificados?.length ?? 0}</p><p className="text-xs text-text-muted">Total de certificados</p></Card>
        <Card className="p-4"><Clock size={18} className="text-brand mb-2" /><p className="text-xl font-semibold">{totalHoras}h</p><p className="text-xs text-text-muted">Horas certificadas</p></Card>
        <Card className="p-4">
          <p className="text-xs text-text-muted mb-2">Por categoria</p>
          <div className="flex gap-1 flex-wrap">
            {Object.entries(porCategoria).map(([k, v]) => <Badge key={k}>{k}: {v}</Badge>)}
          </div>
        </Card>
      </div>

      {certificados?.length === 0 && (
        <EmptyState
          icon={<Award size={24} />}
          title="Nenhum certificado por aqui ainda"
          description="Cadastre seus certificados para acompanhar horas certificadas e evolução por categoria."
          action={<button className="btn btn-primary" onClick={() => setModal("new")}><Plus size={16} /> Adicionar certificado</button>}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificados?.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between">
              <CardHeader title={c.nome} subtitle={c.instituicao} />
              <div className="flex gap-1 shrink-0">
                <button className="text-text-muted hover:text-text p-1" onClick={() => setModal(c)}><Pencil size={14} /></button>
                <button className="text-text-muted hover:text-red-500 p-1" onClick={() => certificadoService.remove(c.id)}><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {c.area && <Badge>{c.area}</Badge>}
              <Badge>{c.cargaHoraria}h</Badge>
              {c.data && <Badge>{new Date(c.data).toLocaleDateString("pt-BR")}</Badge>}
            </div>
            {c.linkValidacao && (
              <a href={c.linkValidacao} target="_blank" rel="noreferrer" className="text-xs text-brand flex items-center gap-1 mt-2">
                Validar certificado <ExternalLink size={12} />
              </a>
            )}
          </Card>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "new" ? "Novo certificado" : "Editar certificado"}>
        <CertificadoForm cert={modal !== "new" ? (modal as Certificado) ?? undefined : undefined} onClose={() => setModal(null)} />
      </Modal>
    </div>
  );
}
