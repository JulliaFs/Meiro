// Gera supabase/seeds/corrige-fases.sql: cria as Fases 1 a 4 (concluídas) que não existem,
// marca a Fase 6 e seus capítulos como concluídos e liga as anotações de revisão/reforço à fase.
// Uso: node scripts/seed-corrige-fases.mjs <email-da-conta-no-meiro>
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const email = process.argv[2];
if (!email || !email.includes("@")) {
  console.error("Uso: node scripts/seed-corrige-fases.mjs <email>");
  process.exit(1);
}
const q = (v) => `'${String(v).replace(/'/g, "''")}'`;

const FASES = [
  [1, "Fase 1 · Domínio financeiro e engenharia de software"],
  [2, "Fase 2 · Casos de uso e protótipo das telas"],
  [3, "Fase 3 · Modelagem e documentação do banco"],
  [4, "Fase 4 · Telas (view)"],
];

const sql = `-- Gerado por scripts/seed-corrige-fases.mjs. Rode inteiro no SQL Editor (projeto Meiro). Pode rodar de novo.
create schema if not exists backup_corrige_fases;
create table if not exists backup_corrige_fases.fases as table public.fases;
create table if not exists backup_corrige_fases.capitulos as table public.capitulos;
create table if not exists backup_corrige_fases.anotacoes as table public.anotacoes;
alter table backup_corrige_fases.fases enable row level security;
alter table backup_corrige_fases.capitulos enable row level security;
alter table backup_corrige_fases.anotacoes enable row level security;

do $$
declare
  uid uuid;
  ano uuid;
  f6 uuid;
begin
  select id into uid from auth.users where lower(email) = lower(${q(email)});
  if uid is null then raise exception 'Usuário não encontrado'; end if;

  -- o mesmo ano em que estão as Fases 5 a 7
  select ano_id into ano from public.fases where user_id = uid and numero in (7, 6, 5) order by numero desc limit 1;
  if ano is null then raise exception 'Nenhuma fase 5 a 7 encontrada'; end if;

  -- 1) Fases 1 a 4: cria só as que não existem (em nenhum ano) e marca todas como concluídas
${FASES.map(
  ([n, nome]) => `  insert into public.fases (user_id, ano_id, numero, nome, status)
  select uid, ano, ${n}, ${q(nome)}, 'concluida'
  where not exists (select 1 from public.fases where user_id = uid and numero = ${n});`
).join("\n")}
  update public.fases set status = 'concluida' where user_id = uid and numero between 1 and 5 and status <> 'concluida';

  -- 2) Fase 6 concluída, com todos os capítulos concluídos
  update public.fases set status = 'concluida' where user_id = uid and numero = 6 and status <> 'concluida';
  update public.capitulos c set status = 'concluido'
  from public.fases f where c.fase_id = f.id and f.user_id = uid and f.numero = 6 and c.status <> 'concluido';

  -- 3) Anotações de revisão/reforço sem fase passam a apontar para a fase certa
  update public.anotacoes a set fase_id = f.id, ano_id = f.ano_id
  from public.fases f
  where a.user_id = uid and a.fase_id is null and f.user_id = uid
    and (a.titulo like '📚 Revisão Fase %' or a.titulo like '🌱 Reforço Fase %')
    and f.numero = substring(a.titulo from 'Fase ([0-9]+)')::int;
end $$;
`;
const out = resolve(root, "supabase/seeds/corrige-fases.sql");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, sql);
console.log(`OK: ${out}`);
