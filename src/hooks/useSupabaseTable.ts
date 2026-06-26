import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { snakeToCamel } from "../lib/caseConvert";
import { useDataBus } from "../lib/dataBus";
import { useAuthStore } from "../store/useAuthStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;

/**
 * Busca uma tabela inteira (ou filtrada) e refaz o fetch sempre que:
 * - o componente monta
 * - alguém chama bump(table) após create/update/remove (ver lib/dataBus.ts)
 */
export function useSupabaseTable<T>(
  table: string,
  configure?: (query: AnyQuery) => AnyQuery,
  deps: unknown[] = []
): T[] | undefined {
  const [data, setData] = useState<T[] | undefined>(undefined);
  const version = useDataBus((s) => s.versions[table] ?? 0);
  const userId = useAuthStore((s) => s.session?.user.id);

  useEffect(() => {
    if (!userId) {
      setData(undefined);
      return;
    }
    let active = true;
    async function load() {
      let query: AnyQuery = supabase.from(table).select("*");
      if (configure) query = configure(query);
      const { data, error } = await query;
      if (!active) return;
      if (error) {
        console.error(`Erro ao buscar ${table}:`, error);
        setData([]);
        return;
      }
      setData((data ?? []).map((row: Record<string, unknown>) => snakeToCamel<T>(row)));
    }
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, version, userId, ...deps]);

  return data;
}

export function useSupabaseRow<T>(table: string, id: string | undefined): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);
  const version = useDataBus((s) => s.versions[table] ?? 0);

  useEffect(() => {
    if (!id) {
      setData(undefined);
      return;
    }
    let active = true;
    async function load() {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (!active) return;
      if (error || !data) {
        setData(undefined);
        return;
      }
      setData(snakeToCamel<T>(data));
    }
    load();
    return () => {
      active = false;
    };
  }, [table, id, version]);

  return data;
}
