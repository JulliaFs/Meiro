import { supabase } from "../lib/supabaseClient";
import { camelToSnake, snakeToCamel } from "../lib/caseConvert";
import { useDataBus } from "../lib/dataBus";
import type { BaseEntity } from "../types";

/**
 * Fábrica de service CRUD genérico em torno de uma tabela Supabase.
 * Mantém a mesma assinatura usada antes com Dexie (list/get/create/update/remove),
 * então as páginas não precisam saber qual backend está por trás.
 */
export function createSupabaseCrudService<T extends BaseEntity>(table: string) {
  return {
    async list(): Promise<T[]> {
      const { data, error } = await supabase.from(table).select("*").order("created_at");
      if (error) throw error;
      return (data ?? []).map((row) => snakeToCamel<T>(row));
    },
    async get(id: string): Promise<T | undefined> {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? snakeToCamel<T>(data) : undefined;
    },
    async create(payload: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError ?? new Error("Usuário não autenticado");
      const row = { ...camelToSnake(payload as Record<string, unknown>), user_id: userData.user.id };
      const { data, error } = await supabase.from(table).insert(row).select().single();
      if (error) throw error;
      useDataBus.getState().bump(table);
      return snakeToCamel<T>(data);
    },
    async update(id: string, payload: Partial<T>): Promise<void> {
      const row = camelToSnake(payload as Record<string, unknown>);
      const { error } = await supabase.from(table).update(row).eq("id", id);
      if (error) throw error;
      useDataBus.getState().bump(table);
    },
    async remove(id: string): Promise<void> {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      useDataBus.getState().bump(table);
    },
  };
}

export function uid(): string {
  return crypto.randomUUID();
}
