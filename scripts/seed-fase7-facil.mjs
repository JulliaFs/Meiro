// Gera supabase/seeds/fase7-modo-facil.sql: "modo fácil" da Fase 7, passos do Grand Finale
// e da Prova Polo, e marca as Fases 1 a 5 como concluídas.
// Uso: node scripts/seed-fase7-facil.mjs <email-da-conta-no-meiro>
// Idempotente e sem sobrescrever o que ela já escreveu: só preenche campos vazios.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { capitulos, grandFinale, provaPolo } from "./conteudo/fase7-facil.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const email = process.argv[2];
if (!email || !email.includes("@")) {
  console.error("Uso: node scripts/seed-fase7-facil.mjs <email>");
  process.exit(1);
}

const q = (v) => `'${String(v).replace(/'/g, "''")}'`;
const arr = (xs) => `array[${xs.map(q).join(", ")}]::text[]`;
const checklist = (prefixo, itens) =>
  q(JSON.stringify(itens.map(([data, texto], i) => ({ id: `${prefixo}-${i + 1}`, texto: `${data} · ${texto}`, feito: false })))) + "::jsonb";

const sql = `-- Gerado por scripts/seed-fase7-facil.mjs. Rode inteiro no SQL Editor (projeto Meiro).
-- Pode rodar de novo: só preenche o que estiver vazio e não duplica.

-- 0) Backup (só na primeira vez)
create schema if not exists backup_20261015;
create table if not exists backup_20261015.fases as table public.fases;
create table if not exists backup_20261015.capitulos as table public.capitulos;
create table if not exists backup_20261015.metas as table public.metas;
alter table backup_20261015.fases enable row level security;
alter table backup_20261015.capitulos enable row level security;
alter table backup_20261015.metas enable row level security;

do $$
declare
  uid uuid;
  f7 uuid;
begin
  select id into uid from auth.users where lower(email) = lower(${q(email)});
  if uid is null then raise exception 'Usuário não encontrado'; end if;

  -- 1) Fases 1 a 5 concluídas
  update public.fases set status = 'concluida'
  where user_id = uid and numero between 1 and 5 and status <> 'concluida';

  select f.id into f7 from public.fases f join public.anos a on a.id = f.ano_id
  where f.user_id = uid and a.numero = 1 and f.numero = 7 limit 1;
  if f7 is null then raise exception 'Fase 7 não encontrada (rode antes o fiap-fases-6-7.sql)'; end if;

  -- 2) Capítulos da Fase 7: resumo, micro-passos ([ ] = a fazer) e recursos
${capitulos
  .map(
    (c) => `
  update public.capitulos set
    resumo = case when coalesce(resumo, '') = '' then ${q(c.resumo)} else resumo end,
    principais_conceitos = case when coalesce(principais_conceitos, '') = '' then ${q(c.passos.map((p) => `[ ] ${p}`).join("\n"))} else principais_conceitos end,
    links = case when links = '{}' then ${c.recursos.length ? arr(c.recursos) : "'{}'::text[]"} else links end
  where fase_id = f7 and numero = ${c.numero};`
  )
  .join("")}

  -- 3) Passos com data nas metas (só se o checklist estiver vazio)
  update public.metas set checklist = ${checklist("gf", grandFinale)}
  where user_id = uid and descricao = 'FIAP Fase 7 · Atividade Grand Finale (Grupo 37)' and checklist = '[]'::jsonb;

  update public.metas set checklist = ${checklist("pp", provaPolo)}
  where user_id = uid and descricao like 'FIAP · Prova Polo%' and checklist = '[]'::jsonb;
end $$;
`;

const out = resolve(root, "supabase/seeds/fase7-modo-facil.sql");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, sql);
console.log(`OK: ${out}`);
