// Gera supabase/seeds/reforco-fases-4-6.sql: trilhas de reforço das Fases 4, 5 e 6
// (anotação "o essencial" ligada à fase, meta com micro-passos sem prazo e flashcards).
// Os recursos dessas trilhas entram pelo scripts/seed-recursos.mjs.
// Uso: node scripts/seed-reforco.mjs <email-da-conta-no-meiro>
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { trilhas } from "./conteudo/reforco-fases-4-6.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const email = process.argv[2];
if (!email || !email.includes("@")) {
  console.error("Uso: node scripts/seed-reforco.mjs <email>");
  process.exit(1);
}
const q = (v) => `'${String(v).replace(/'/g, "''")}'`;

const blocos = trilhas
  .map((t) => {
    const titulo = `🌱 Reforço Fase ${t.fase}: o essencial`;
    const meta = `Reforço Fase ${t.fase} · ${t.tema.replace(/^Reforço: /, "")}`;
    const categoria = `Reforço Fase ${t.fase} · ${t.tema.replace(/^Reforço: /, "")}`;
    const checklist = JSON.stringify(t.passos.map((texto, i) => ({ id: `rf${t.fase}-${i + 1}`, texto, feito: false })));
    return `
  -- Fase ${t.fase}
  select id, ano_id into f, a from public.fases where user_id = uid and numero = ${t.fase} order by created_at limit 1;
  insert into public.anotacoes (user_id, titulo, conteudo, tags, fase_id, ano_id, origem_label)
  select uid, ${q(titulo)}, ${q(t.essencial)}, array['reforço'], f, a, ${q(`Fase ${t.fase}`)}
  where not exists (select 1 from public.anotacoes where user_id = uid and titulo = ${q(titulo)});

  insert into public.metas (user_id, descricao, categoria, checklist)
  select uid, ${q(meta)}, 'mensal', ${q(checklist)}::jsonb
  where not exists (select 1 from public.metas where user_id = uid and descricao = ${q(meta)});
${
  t.flashcards.length
    ? `
  insert into public.flashcards (user_id, pergunta, resposta, categoria, area, proxima_revisao)
  select uid, v.p, v.r, ${q(categoria)}, 'Faculdade', current_date
  from (values
${t.flashcards.map(([p, r]) => `    (${q(p)}, ${q(r)})`).join(",\n")}
  ) as v(p, r)
  where not exists (select 1 from public.flashcards x where x.user_id = uid and x.pergunta = v.p);`
    : ""
}`;
  })
  .join("\n");

const sql = `-- Gerado por scripts/seed-reforco.mjs. Rode inteiro no SQL Editor (projeto Meiro). Pode rodar de novo.
create schema if not exists backup_20261015;
create table if not exists backup_20261015.anotacoes as table public.anotacoes;
create table if not exists backup_20261015.flashcards as table public.flashcards;
create table if not exists backup_20261015.metas as table public.metas;
alter table backup_20261015.anotacoes enable row level security;
alter table backup_20261015.flashcards enable row level security;
alter table backup_20261015.metas enable row level security;

do $$
declare
  uid uuid;
  f uuid;
  a uuid;
begin
  select id into uid from auth.users where lower(email) = lower(${q(email)});
  if uid is null then raise exception 'Usuário não encontrado'; end if;
${blocos}
end $$;
`;
const out = resolve(root, "supabase/seeds/reforco-fases-4-6.sql");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, sql);
console.log(`OK: ${out}`);
