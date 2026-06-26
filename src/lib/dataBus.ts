import { create } from "zustand";

interface DataBusState {
  versions: Record<string, number>;
  bump: (table: string) => void;
}

/**
 * Substitui a reatividade que o Dexie (IndexedDB) dava de graça.
 * Cada create/update/remove "bate palma" para a tabela afetada;
 * os hooks de leitura escutam essa versão e refazem o fetch.
 * Evita depender de Realtime/replication do Supabase para o caso de uso local.
 */
export const useDataBus = create<DataBusState>((set, get) => ({
  versions: {},
  bump: (table) => set({ versions: { ...get().versions, [table]: (get().versions[table] ?? 0) + 1 } }),
}));
