import { useState } from "react";
import { FileUp, Link as LinkIcon, Plus, Sparkles, Trash2, FileText, NotebookPen, Loader2, X, CircleDot, CalendarDays, Layers, Gauge, Tag } from "lucide-react";
import { Propriedade, TituloPagina, inputPropriedade } from "../ui/Propriedade";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { SkillTagInput } from "../common/SkillTagInput";
import { ProfessorIaModal } from "../common/ProfessorIaModal";
import { capituloService, criarMaterialComArquivo, excluirMaterial } from "../../services";
import { criarAnotacaoComOrigem } from "../../lib/anotacoes";
import { useMateriais } from "../../hooks/useLiveData";
import { useAutoSave } from "../../hooks/useAutoSave";
import { notificarSucesso } from "../../store/useToastStore";
import { cls, confirmar, statusColor, statusLabel } from "../../lib/utils";
import type { Capitulo, Dificuldade, Status } from "../../types";
import { ModoFacil } from "./ModoFacil";
import { lerLink } from "../../lib/links";

const TABS = ["facil", "materiais", "desempenho", "aprendizado", "skills"] as const;
type Tab = typeof TABS[number];

function numeroOuVazio(valor: string): number | undefined {
  return valor === "" ? undefined : +valor;
}

export function CapituloDetailModal({
  capitulo: capituloInicial,
  faseLabel,
  anoId,
  onClose,
}: {
  capitulo: Capitulo;
  faseLabel: string;
  anoId?: string;
  onClose: () => void;
}) {
  const temModoFacil = !!capituloInicial.resumo || /^[( |x)] /im.test(capituloInicial.principaisConceitos ?? "") || capituloInicial.links.length > 0;
  const [tab, setTab] = useState<Tab>(temModoFacil ? "facil" : "materiais");
  const [openIa, setOpenIa] = useState(false);
  const [novoLink, setNovoLink] = useState("");
  const [enviando, setEnviando] = useState(false);
  const materiaisTodos = useMateriais();
  const [capitulo, update] = useAutoSave(capituloInicial, (patch) => capituloService.update(capituloInicial.id, patch));
  const materiaisCapitulo = materiaisTodos?.filter((m) => m.origemTipo === "capitulo" && m.origemId === capitulo.id) ?? [];

  async function uploadArquivo(file: File) {
    setEnviando(true);
    try {
      await criarMaterialComArquivo(file, { origemTipo: "capitulo", origemId: capitulo.id });
    } catch {
      // erro já exibido
    } finally {
      setEnviando(false);
    }
  }

  function addLink() {
    if (!novoLink.trim()) return;
    update({ links: [...capitulo.links, novoLink.trim()] }, true);
    setNovoLink("");
  }

  function removerLink(idx: number) {
    update({ links: capitulo.links.filter((_, i) => i !== idx) }, true);
  }

  async function novaAnotacao() {
    const label = `${faseLabel} > Capítulo ${capitulo.numero} - ${capitulo.nome}`;
    try {
      await criarAnotacaoComOrigem({
        origemTipo: "capitulo",
        origemId: capitulo.id,
        origemLabel: label,
        anoId,
        faseId: capitulo.faseId,
        skills: capitulo.skills,
      });
      notificarSucesso("Anotação criada em Anotações.");
    } catch {
      // erro já exibido
    }
  }

  return (
    <Modal open onClose={onClose} title={`${faseLabel} / Cap. ${capitulo.numero}`} wide pagina>
      {/* cabeçalho de página no estilo do Notion: ícone, título grande e propriedades */}
      <div className="text-5xl mb-2 select-none" aria-hidden>{capitulo.status === "concluido" ? "✅" : capitulo.status === "em_andamento" ? "📖" : "📄"}</div>
      <TituloPagina value={capitulo.nome} onChange={(nome) => update({ nome })} />

      <div className="mb-4">
        <Propriedade icon={CircleDot} label="Status">
          <select
            value={capitulo.status}
            onChange={(e) => update({ status: e.target.value as Status }, true)}
            className={cls("badge border-0 outline-none cursor-pointer mt-1", statusColor(capitulo.status))}
          >
            <option value="nao_iniciado">{statusLabel("nao_iniciado")}</option>
            <option value="em_andamento">{statusLabel("em_andamento")}</option>
            <option value="concluido">{statusLabel("concluido")}</option>
          </select>
        </Propriedade>
        <Propriedade icon={Layers} label="Fase">
          <p className="px-2 py-1.5">{faseLabel} · Capítulo {capitulo.numero}</p>
        </Propriedade>
        <Propriedade icon={CalendarDays} label="Data de estudo">
          <input
            type="date"
            className={cls(inputPropriedade, "max-w-48")}
            value={capitulo.dataEstudo ?? ""}
            onChange={(e) => update({ dataEstudo: e.target.value || undefined }, true)}
          />
        </Propriedade>
        <Propriedade icon={Gauge} label="Fast Test">
          <input
            type="number"
            className={cls(inputPropriedade, "w-28")}
            placeholder="Vazio"
            value={capitulo.notaFastTest ?? ""}
            onChange={(e) => update({ notaFastTest: numeroOuVazio(e.target.value) })}
          />
        </Propriedade>
        <Propriedade icon={Tag} label="Skills">
          {capitulo.skills.length > 0 ? (
            <div className="flex gap-1 flex-wrap px-2 py-1.5">{capitulo.skills.map((sk) => <Badge key={sk}>{sk}</Badge>)}</div>
          ) : (
            <button className="px-2 py-1.5 text-text-muted/60 hover:text-text" onClick={() => setTab("skills")}>Vazio</button>
          )}
        </Propriedade>
      </div>

      <textarea
        className="w-full bg-transparent border-0 outline-none resize-none text-sm sm:text-base text-text placeholder:text-text-muted/60 mb-4"
        rows={2}
        placeholder="Adicionar uma descrição…"
        value={capitulo.descricao ?? ""}
        onChange={(e) => update({ descricao: e.target.value })}
      />

      <div className="flex items-center gap-1 flex-wrap border-b border-border mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cls("px-3 py-2 text-sm -mb-px border-b-2 transition-colors", tab === t ? "border-brand text-text font-medium" : "border-transparent text-text-muted hover:text-text")}
          >
            {t === "facil" ? "Modo fácil" : t === "materiais" ? "Materiais" : t === "desempenho" ? "Desempenho" : t === "aprendizado" ? "Aprendizado" : "Skills"}
          </button>
        ))}
        <div className="ml-auto flex gap-1 py-1">
          <button className="text-xs text-text-muted hover:text-text hover:bg-surface-2 rounded-md px-2 py-1.5 flex items-center gap-1" onClick={() => setOpenIa(true)}><Sparkles size={13} /> Aula completa</button>
          <button className="text-xs text-text-muted hover:text-text hover:bg-surface-2 rounded-md px-2 py-1.5 flex items-center gap-1" onClick={novaAnotacao}><NotebookPen size={13} /> Anotação</button>
        </div>
      </div>

      {tab === "facil" && <ModoFacil capitulo={capitulo} update={update} />}

      {tab === "materiais" && (
        <div className="space-y-3">
          <label className={cls("btn btn-secondary cursor-pointer w-full justify-center", enviando && "opacity-60 pointer-events-none")}>
            {enviando ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
            {enviando ? "Enviando..." : "Upload de PDF, DOCX ou imagem"}
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="hidden"
              disabled={enviando}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) uploadArquivo(file);
              }}
            />
          </label>
          <div className="space-y-2">
            {materiaisCapitulo.map((m) => (
              <div key={m.id} className="flex items-center justify-between border border-border rounded-lg p-2 text-sm">
                <span className="flex items-center gap-2 truncate"><FileText size={14} /> {m.titulo}</span>
                <button
                  className="text-text-muted hover:text-red-500"
                  onClick={() => confirmar(`Excluir "${m.titulo}"?`) && excluirMaterial(m).catch(() => {})}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="input" placeholder="Adicionar link externo" value={novoLink} onChange={(e) => setNovoLink(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLink()} />
            <button className="btn btn-secondary" onClick={addLink}><Plus size={14} /></button>
          </div>
          <div className="flex flex-col gap-1">
            {capitulo.links.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <a href={lerLink(l).url} target="_blank" rel="noreferrer" className="text-xs text-brand flex items-center gap-1 truncate">
                  <LinkIcon size={12} className="shrink-0" /> {lerLink(l).nome}
                </a>
                <button className="text-text-muted hover:text-red-500 shrink-0" onClick={() => removerLink(i)} aria-label="Remover link">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "desempenho" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-text-muted">
              Nota de exercícios
              <input
                type="number"
                className="input mt-1"
                value={capitulo.notaExercicios ?? ""}
                onChange={(e) => update({ notaExercicios: numeroOuVazio(e.target.value) })}
              />
            </label>
          </div>
          <textarea className="input" placeholder="Observações" value={capitulo.observacoesDesempenho ?? ""} onChange={(e) => update({ observacoesDesempenho: e.target.value })} />
        </div>
      )}

      {tab === "aprendizado" && (
        <div className="space-y-3">
          <textarea className="input h-24" placeholder="Resumo do capítulo" value={capitulo.resumo ?? ""} onChange={(e) => update({ resumo: e.target.value })} />
          <textarea className="input h-24" placeholder="Principais conceitos" value={capitulo.principaisConceitos ?? ""} onChange={(e) => update({ principaisConceitos: e.target.value })} />
          <div>
            <p className="text-xs text-text-muted mb-1">Dificuldade percebida</p>
            <div className="flex gap-2">
              {(["facil", "medio", "dificil"] as Dificuldade[]).map((d) => (
                <button
                  key={d}
                  onClick={() => update({ dificuldade: d }, true)}
                  className={cls("btn flex-1 justify-center", capitulo.dificuldade === d ? "btn-primary" : "btn-secondary")}
                >
                  {d === "facil" ? "Fácil" : d === "medio" ? "Médio" : "Difícil"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "skills" && (
        <div>
          <p className="text-xs text-text-muted mb-2">
            Skills vinculadas a este capítulo. Ao concluir o capítulo, elas são automaticamente contabilizadas no Mapa de Carreira.
          </p>
          <SkillTagInput value={capitulo.skills} onChange={(skills) => update({ skills }, true)} />
        </div>
      )}

      {capitulo.skills.length > 0 && tab !== "skills" && (
        <div className="flex gap-1 flex-wrap mt-3">{capitulo.skills.map((s) => <Badge key={s}>{s}</Badge>)}</div>
      )}

      {openIa && <ProfessorIaModal open onClose={() => setOpenIa(false)} titulo={capitulo.nome} />}
    </Modal>
  );
}
