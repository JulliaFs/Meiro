import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronDown, GraduationCap } from "lucide-react";
import { useUiStore } from "../store/useUiStore";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { useAnos, useFases, useTodosCapitulos } from "../hooks/useLiveData";
import { anoService, faseService } from "../services";
import { cls, statusColor, statusLabel } from "../lib/utils";

function AnoForm({ onClose }: { onClose: () => void }) {
  const anos = useAnos();
  const [numero, setNumero] = useState((anos?.length ?? 0) + 1);

  async function salvar() {
    await anoService.create({ numero, nome: `${numero}º Ano` });
    onClose();
  }

  return (
    <div className="space-y-3">
      <input type="number" min={1} className="input" value={numero} onChange={(e) => setNumero(+e.target.value)} />
      <button className="btn btn-primary w-full justify-center" onClick={salvar}>Salvar</button>
    </div>
  );
}

function FaseForm({ anoId, onClose }: { anoId: string; onClose: () => void }) {
  const fases = useFases(anoId);
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState((fases?.length ?? 0) + 1);
  const [dataInicio, setDataInicio] = useState("");
  const [dataTermino, setDataTermino] = useState("");
  const [descricao, setDescricao] = useState("");
  const [observacoes, setObservacoes] = useState("");

  async function salvar() {
    if (!nome.trim()) return;
    await faseService.create({
      anoId,
      nome,
      numero,
      dataInicio,
      dataTermino,
      descricao,
      observacoes,
      status: "pendente",
    });
    onClose();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <input className="input col-span-2" placeholder="Nome da fase" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input type="number" className="input" placeholder="Nº" value={numero} onChange={(e) => setNumero(+e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-text-muted">
          Início
          <input type="date" className="input mt-1" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </label>
        <label className="text-xs text-text-muted">
          Término
          <input type="date" className="input mt-1" value={dataTermino} onChange={(e) => setDataTermino(e.target.value)} />
        </label>
      </div>
      <textarea className="input" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      <textarea className="input" placeholder="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
      <button className="btn btn-primary w-full justify-center" onClick={salvar}>Salvar fase</button>
    </div>
  );
}

export default function FaculdadePage() {
  const anos = useAnos();
  const navigate = useNavigate();
  const [anoSelecionado, setAnoSelecionado] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalAno, setModalAno] = useState(false);
  const [modalFase, setModalFase] = useState(false);

  useEffect(() => {
    if (!anoSelecionado && anos && anos.length > 0) setAnoSelecionado(anos[0].id);
  }, [anos, anoSelecionado]);

  const fases = useFases(anoSelecionado ?? undefined);
  const capitulos = useTodosCapitulos();
  const ano = anos?.find((a) => a.id === anoSelecionado);

  const pendingAction = useUiStore((s) => s.pendingAction);
  const setPendingAction = useUiStore((s) => s.setPendingAction);
  useEffect(() => {
    if (pendingAction === "nova-fase" && anoSelecionado) {
      setPendingAction(null);
      setModalFase(true);
    }
  }, [pendingAction, anoSelecionado]);

  function progressoFase(faseId: string) {
    const caps = capitulos?.filter((c) => c.faseId === faseId) ?? [];
    if (caps.length === 0) return 0;
    return Math.round((caps.filter((c) => c.status === "concluido").length / caps.length) * 100);
  }

  if (!anos) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Aulas</h1>
        <p className="text-text-muted text-xs uppercase tracking-wide mt-1">Fases</p>
      </div>

      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold uppercase text-sm tracking-wide">Análise e Desenvolvimento de Sistemas</h2>
            <div className="relative inline-block mt-1">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="text-brand font-medium text-sm flex items-center gap-1">
                {ano ? ano.nome : "Selecione o ano"} <ChevronDown size={14} className={cls("transition-transform", dropdownOpen && "rotate-180")} />
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 card p-1 min-w-[140px]">
                  {anos.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { setAnoSelecionado(a.id); setDropdownOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-surface-2"
                    >
                      {a.nome}
                    </button>
                  ))}
                  <button onClick={() => { setModalAno(true); setDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 rounded-lg text-sm hover:bg-surface-2 text-brand">
                    <Plus size={12} className="inline mr-1" /> Novo ano
                  </button>
                </div>
              )}
            </div>
          </div>
          {anoSelecionado && (
            <button className="btn btn-primary" onClick={() => setModalFase(true)}>
              <Plus size={16} /> Nova fase
            </button>
          )}
        </div>
      </Card>

      {!anoSelecionado && (
        <EmptyState icon={<GraduationCap size={32} />} title="Cadastre um ano para começar" action={<button className="btn btn-primary" onClick={() => setModalAno(true)}><Plus size={16} /> Novo ano</button>} />
      )}

      {anoSelecionado && fases?.length === 0 && (
        <EmptyState icon={<GraduationCap size={32} />} title="Nenhuma fase cadastrada neste ano" action={<button className="btn btn-primary" onClick={() => setModalFase(true)}><Plus size={16} /> Nova fase</button>} />
      )}

      {anoSelecionado && fases && fases.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {fases.map((f) => (
            <button
              key={f.id}
              onClick={() => navigate(`/faculdade/${f.anoId}/${f.id}`)}
              className="card p-4 text-left hover:border-brand transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">FASE {f.numero}</span>
                <span className={cls("badge", statusColor(f.status))}>{statusLabel(f.status)}</span>
              </div>
              <ProgressBar value={progressoFase(f.id)} />
              <p className="text-xs text-text-muted mt-1">{progressoFase(f.id)}%</p>
            </button>
          ))}
        </div>
      )}

      <Modal open={modalAno} onClose={() => setModalAno(false)} title="Novo ano">
        <AnoForm onClose={() => setModalAno(false)} />
      </Modal>
      {anoSelecionado && (
        <Modal open={modalFase} onClose={() => setModalFase(false)} title="Nova fase" wide>
          <FaseForm anoId={anoSelecionado} onClose={() => setModalFase(false)} />
        </Modal>
      )}
    </div>
  );
}
