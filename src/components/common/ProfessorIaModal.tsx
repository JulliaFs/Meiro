import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import { Modal } from "../ui/Modal";
import {
  gerarPromptAulaCompleta,
  gerarPromptExercicios,
  gerarPromptFlashcards,
  gerarPromptMapaMental,
  gerarPromptResumo,
} from "../../lib/promptGenerator";

const TABS = [
  { key: "completa", label: "Aula completa", gerar: gerarPromptAulaCompleta },
  { key: "resumo", label: "Resumo", gerar: (t: string) => gerarPromptResumo(t) },
  { key: "exercicios", label: "Exercícios", gerar: (t: string) => gerarPromptExercicios(t) },
  { key: "flashcards", label: "Flashcards", gerar: (t: string) => gerarPromptFlashcards(t) },
  { key: "mapa", label: "Mapa mental", gerar: (t: string) => gerarPromptMapaMental(t) },
] as const;

export function ProfessorIaModal({ open, onClose, titulo }: { open: boolean; onClose: () => void; titulo: string }) {
  const [tab, setTab] = useState<typeof TABS[number]["key"]>("completa");
  const [copied, setCopied] = useState(false);

  const ativa = TABS.find((t) => t.key === tab)!;
  const prompt = ativa.gerar(titulo);

  function copiar() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Modal open={open} onClose={onClose} title="Professor Particular IA" wide>
      <p className="text-sm text-text-muted mb-3 flex items-center gap-2">
        <Sparkles size={14} className="text-brand" /> Copie o prompt e cole no ChatGPT, Claude ou Gemini.
      </p>
      <div className="flex gap-1 flex-wrap mb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`btn ${tab === t.key ? "btn-primary" : "btn-secondary"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <textarea readOnly value={prompt} className="input h-64 resize-none font-mono text-xs" />
      <button onClick={copiar} className="btn btn-primary mt-3 w-full justify-center">
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Copiado!" : "Copiar Prompt"}
      </button>
    </Modal>
  );
}
