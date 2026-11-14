import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Botão que copia um prompt para colar no Claude, ChatGPT ou Gemini. */
export function CopiarPrompt({ gerar, rotulo, desativado }: { gerar: () => string; rotulo: string; desativado?: boolean }) {
  const [copiado, setCopiado] = useState(false);
  const [texto, setTexto] = useState<string | null>(null);

  async function copiar() {
    const prompt = gerar();
    try {
      await navigator.clipboard.writeText(prompt);
      setTexto(null);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch {
      // Sem permissão de área de transferência: mostra o texto para copiar à mão.
      setTexto(prompt);
    }
  }

  return (
    <div className="space-y-2">
      <button className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed" onClick={copiar} disabled={desativado} title={desativado ? "Escreva algo no campo acima primeiro" : undefined}>
        {copiado ? <Check size={16} /> : <Copy size={16} />}
        {copiado ? "Copiado! Cole no seu chat de IA" : rotulo}
      </button>
      {texto && <textarea readOnly value={texto} className="input h-40 font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />}
    </div>
  );
}
