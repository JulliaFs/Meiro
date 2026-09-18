import { useState } from "react";

/**
 * Envio de formulário: bloqueia clique duplo e só roda `depois` (ex.: fechar o
 * modal) se deu certo. O erro em si já é mostrado na tela pelos services.
 */
export function useEnvio() {
  const [enviando, setEnviando] = useState(false);

  async function executar(acao: () => Promise<unknown>, depois?: () => void) {
    if (enviando) return;
    setEnviando(true);
    try {
      await acao();
      depois?.();
    } catch {
      // erro já exibido
    } finally {
      setEnviando(false);
    }
  }

  return { enviando, executar };
}
