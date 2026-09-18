import { create } from "zustand";

export interface Toast {
  id: number;
  tipo: "erro" | "sucesso";
  mensagem: string;
}

interface ToastState {
  toasts: Toast[];
  mostrar: (tipo: Toast["tipo"], mensagem: string) => void;
  fechar: (id: number) => void;
}

let proximoId = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  mostrar: (tipo, mensagem) => {
    const id = proximoId++;
    set({ toasts: [...get().toasts, { id, tipo, mensagem }] });
    setTimeout(() => get().fechar(id), tipo === "erro" ? 6000 : 3000);
  },
  fechar: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/** Traduz os erros mais comuns do Supabase/Postgres para algo que a pessoa entenda. */
export function mensagemDeErro(err: unknown): string {
  const e = err as { code?: string; message?: string } | null;
  switch (e?.code) {
    case "22007":
    case "22008":
    case "22P02":
      return "Algum campo está em um formato inválido.";
    case "23502":
      return "Preencha os campos obrigatórios.";
    case "23505":
      return "Esse registro já existe.";
    case "42501":
      return "Você não tem permissão para fazer isso.";
  }
  if (e?.message?.includes("Failed to fetch")) return "Sem conexão com o servidor. Verifique sua internet.";
  return e?.message || "Algo deu errado. Tente novamente.";
}

export function notificarErro(acao: string, err: unknown) {
  console.error(`${acao}:`, err);
  useToastStore.getState().mostrar("erro", `${acao}: ${mensagemDeErro(err)}`);
}

export function notificarSucesso(mensagem: string) {
  useToastStore.getState().mostrar("sucesso", mensagem);
}
