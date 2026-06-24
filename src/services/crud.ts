import type { Table } from "dexie";
import type { BaseEntity } from "../types";

function uid(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Fábrica de service CRUD genérico em torno de uma Dexie Table.
 * Mantém a mesma assinatura que um futuro client Supabase usaria
 * (list/get/create/update/remove), para troca de backend sem alterar
 * as páginas que consomem o service.
 */
export function createCrudService<T extends BaseEntity>(table: Table<T, string>) {
  return {
    async list(): Promise<T[]> {
      return table.toArray();
    },
    async get(id: string): Promise<T | undefined> {
      return table.get(id);
    },
    async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
      const entity = {
        ...data,
        id: uid(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      } as unknown as T;
      await table.add(entity);
      return entity;
    },
    async update(id: string, data: Partial<T>): Promise<void> {
      await table.update(id, { ...data, updatedAt: nowIso() } as never);
    },
    async remove(id: string): Promise<void> {
      await table.delete(id);
    },
    async bulkCreate(items: T[]): Promise<void> {
      await table.bulkAdd(items);
    },
  };
}

export { uid, nowIso };
