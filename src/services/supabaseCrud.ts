import { supabase } from "../lib/supabaseClient";
import { camelToSnake, snakeToCamel } from "../lib/caseConvert";
import { useDataBus } from "../lib/dataBus";
import { notificarErro } from "../store/useToastStore";
import type { BaseEntity } from "../types";

// Colunas date/uuid/numeric não aceitam string vazia: um campo de data deixado
// em branco chegava como "" e o Postgres recusava o registro inteiro.
const COLUNA_NAO_TEXTO = /^(data|prazo)(_|$)|_id$|_revisao$|^nota_|_minutos$/;

function toRow(payload: Record<string, unknown>, limparIndefinidos: boolean): Record<string, unknown> {
  const row = camelToSnake(payload);
  for (const [key, value] of Object.entries(row)) {
    if (value === "" && COLUNA_NAO_TEXTO.test(key)) row[key] = null;
    // No update, um campo explicitamente indefinido significa "apagar o valor".
    // No create, deixa o banco aplicar o default.
    else if (value === undefined) {
      if (limparIndefinidos) row[key] = null;
      else delete row[key];
    }
  }
  return row;
}

/**
 * Fábrica de service CRUD genérico em torno de uma tabela Supabase.
 * Mantém a mesma assinatura usada antes com Dexie (list/get/create/update/remove),
 * então as páginas não precisam saber qual backend está por trás.
 * Toda falha é mostrada na tela e relançada, para o chamador não fechar o formulário.
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
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) throw userError ?? new Error("Usuário não autenticado");
        const row = { ...toRow(payload as Record<string, unknown>, false), user_id: userData.user.id };
        const { data, error } = await supabase.from(table).insert(row).select().single();
        if (error) throw error;
        useDataBus.getState().bump(table);
        return snakeToCamel<T>(data);
      } catch (err) {
        notificarErro("Não foi possível salvar", err);
        throw err;
      }
    },
    async update(id: string, payload: Partial<T>): Promise<void> {
      try {
        const row = toRow(payload as Record<string, unknown>, true);
        const { error } = await supabase.from(table).update(row).eq("id", id);
        if (error) throw error;
        useDataBus.getState().bump(table);
      } catch (err) {
        notificarErro("Não foi possível salvar", err);
        throw err;
      }
    },
    async remove(id: string): Promise<void> {
      try {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) throw error;
        useDataBus.getState().bump(table);
      } catch (err) {
        notificarErro("Não foi possível excluir", err);
        throw err;
      }
    },
  };
}

export function uid(): string {
  return crypto.randomUUID();
}
