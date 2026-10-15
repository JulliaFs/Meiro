// Gera supabase/seeds/fiap-fases-6-7.sql com as Fases 6 e 7 da FIAP.
// Uso: node scripts/seed-fiap.mjs <email-da-conta-no-meiro> [--sem-questoes]
// O SQL é idempotente: rodar de novo no SQL Editor do Supabase não duplica nada.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fiap = resolve(root, "..", "Fiap");
const email = process.argv[2];
const comQuestoes = !process.argv.includes("--sem-questoes");
if (!email || !email.includes("@")) {
  console.error("Uso: node scripts/seed-fiap.mjs <email> [--sem-questoes]");
  process.exit(1);
}

const banco = JSON.parse(readFileSync(resolve(fiap, "Fase 6/estudo/banco-fase6.json"), "utf8"));
const fase7md = readFileSync(resolve(fiap, "Fase 7/FASE7.md"), "utf8");

const q = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const LETRAS = "ABCDE";

// ---------- Fase 7: capítulos da tabela do FASE7.md ----------
const caps7 = [...fase7md.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*(sim|não)\s*\|/gm)].map((m) => ({
  numero: Number(m[1]),
  nome: m[2],
  descricao: `Fast Test: ${m[3]}`,
}));
if (caps7.length !== 10) throw new Error(`Esperava 10 capítulos na Fase 7, achei ${caps7.length}`);

// ---------- Fase 6 ----------
const caps6 = banco.capitulos.map((c) => ({
  numero: c.id,
  nome: c.titulo,
  descricao: c.curto,
  resumo: c.resumo.map((l) => `• ${l}`).join("\n"),
}));

const flashcards = banco.cartoes.map((c) => ({
  pergunta: c.frente,
  resposta: c.verso,
  categoria: `FIAP Fase 6 · Cap ${c.cap}`,
}));
if (comQuestoes) {
  for (const x of banco.questoes) {
    flashcards.push({
      pergunta: `${x.enunciado}\n\n${x.alternativas.map((a, i) => `${LETRAS[i]}) ${a}`).join("\n")}`,
      resposta: `${LETRAS[x.correta]}) ${x.alternativas[x.correta]}\n\n${x.explicacao ?? ""}`.trim(),
      categoria: `FIAP Fase 6 · Questões · Cap ${x.cap}`,
    });
  }
}

const metas = [
  ["FIAP · Prova Polo (presencial, 17h–19h, Unidade Paulista)", "2026-10-30"],
  ["FIAP Fase 7 · Atividade Grand Finale (Grupo 37)", "2026-11-05"],
  ["FIAP Fase 7 · Quiz Integration", "2026-11-27"],
];

const TABELAS = ["anos", "fases", "capitulos", "flashcards", "metas"];

const capInsert = (faseVar, c, status) => `
  insert into capitulos (user_id, fase_id, numero, nome, descricao, resumo, status)
  select uid, ${faseVar}, ${c.numero}, ${q(c.nome)}, ${q(c.descricao)}, ${q(c.resumo ?? null)}, '${status}'
  where not exists (select 1 from capitulos where fase_id = ${faseVar} and numero = ${c.numero});`;

const sql = `-- Gerado por scripts/seed-fiap.mjs em ${new Date().toISOString().slice(0, 10)}. Não edite à mão.
-- Rode inteiro no SQL Editor do Supabase (projeto Meiro). Pode rodar de novo: não duplica.

-- 0) Backup das tabelas afetadas (só cria na primeira vez; não sobrescreve)
create schema if not exists backup_20261014;
${TABELAS.map((t) => `create table if not exists backup_20261014.${t} as table public.${t};`).join("\n")}

do $$
declare
  uid uuid;
  ano uuid;
  f6 uuid;
  f7 uuid;
begin
  select id into uid from auth.users where lower(email) = lower(${q(email)});
  if uid is null then raise exception 'Usuário % não encontrado', ${q(email)}; end if;

  -- 1) Ano 1
  select id into ano from anos where user_id = uid and numero = 1 order by created_at limit 1;
  if ano is null then
    insert into anos (user_id, numero, nome) values (uid, 1, '1º ano · ADS FIAP 2026') returning id into ano;
  end if;

  -- 2) Fases
  select id into f6 from fases where ano_id = ano and numero = 6 limit 1;
  if f6 is null then
    insert into fases (user_id, ano_id, numero, nome, descricao, status)
    values (uid, ano, 6, 'Fase 6 · Model', 'Java + JDBC + Oracle. Atividades entregues e quiz avaliado.', 'concluida')
    returning id into f6;
  end if;

  select id into f7 from fases where ano_id = ano and numero = 7 limit 1;
  if f7 is null then
    insert into fases (user_id, ano_id, numero, nome, data_inicio, data_termino, descricao, status)
    values (uid, ano, 7, 'Fase 7 · Integration', '2026-10-14', '2026-11-27',
      'Conectar front-end, back-end e banco e concluir o projeto Fintech (Spring Boot + Oracle; React, Vite, Next.js).',
      'em_andamento')
    returning id into f7;
  end if;

  -- 3) Capítulos
${caps6.map((c) => capInsert("f6", c, "concluido")).join("")}
${caps7.map((c) => capInsert("f7", c, "nao_iniciado")).join("")}

  -- 4) Prazos como metas
${metas
  .map(
    ([d, p]) => `
  insert into metas (user_id, descricao, prazo, categoria)
  select uid, ${q(d)}, '${p}', 'mensal'
  where not exists (select 1 from metas where user_id = uid and descricao = ${q(d)});`
  )
  .join("")}

  -- 5) Flashcards (${flashcards.length}), já vencidos hoje para entrar nas revisões
  insert into flashcards (user_id, pergunta, resposta, categoria, area, proxima_revisao)
  select uid, v.pergunta, v.resposta, v.categoria, 'Faculdade', current_date
  from (values
${flashcards.map((f) => `    (${q(f.pergunta)}, ${q(f.resposta)}, ${q(f.categoria)})`).join(",\n")}
  ) as v(pergunta, resposta, categoria)
  where not exists (select 1 from flashcards x where x.user_id = uid and x.pergunta = v.pergunta);
end $$;
`;

const out = resolve(root, "supabase/seeds/fiap-fases-6-7.sql");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, sql);
console.log(`OK: ${out}\n  caps F6=${caps6.length} F7=${caps7.length} flashcards=${flashcards.length} metas=${metas.length}`);
