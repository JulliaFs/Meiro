function camel(s: string): string {
  return s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function snake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/** Converte chaves de nível superior de snake_case (Postgres) para camelCase (TS). Arrays/JSON internos não são tocados. */
export function snakeToCamel<T = unknown>(obj: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    out[camel(key)] = obj[key];
  }
  return out as T;
}

/** Converte chaves de nível superior de camelCase (TS) para snake_case (Postgres). */
export function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    out[snake(key)] = obj[key];
  }
  return out;
}
