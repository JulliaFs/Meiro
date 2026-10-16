// Gera supabase/seeds/recursos.sql: biblioteca de recursos (status "quero ver") por tema.
// Uso: node scripts/seed-recursos.mjs <email-da-conta-no-meiro>
// Idempotente: inclui a migração 0003 e não repete um recurso com a mesma URL.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { capitulos as caps7 } from "./conteudo/fase7-facil.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const email = process.argv[2];
if (!email || !email.includes("@")) {
  console.error("Uso: node scripts/seed-recursos.mjs <email>");
  process.exit(1);
}
const q = (v) => `'${String(v).replace(/'/g, "''")}'`;

const TEMAS_F7 = {
  1: "Visão geral", 2: "Spring Boot + Oracle", 3: "Node e TypeScript", 4: "React e Vite", 5: "Props e Router",
  6: "State, Effect e Context", 7: "Next.js", 8: "Consumo de API", 9: "Projeto front-end", 10: "Grand Finale",
};

function tipoDe(url) {
  if (url.includes("youtube.com")) return "video";
  if (url.includes("alura.com.br")) return "curso";
  if (/github\.com|postman\.com|start\.spring\.io|\/play$/.test(url)) return "ferramenta";
  if (url.includes("nextjs.org/learn")) return "curso";
  return "artigo";
}

// fontes: Fase 7 + trilhas de reforço (quando existirem)
const fontes = [{ fase: 7, caps: caps7, temas: TEMAS_F7 }];
try {
  const { trilhas } = await import("./conteudo/reforco-fases-4-6.mjs");
  for (const t of trilhas) fontes.push({ fase: t.fase, caps: [{ numero: 0, recursos: t.recursos }], temas: { 0: t.tema } });
} catch {
  // ainda sem trilhas de reforço
}

const linhas = [];
const vistos = new Set();
for (const { fase, caps, temas } of fontes) {
  for (const c of caps) {
    for (const r of c.recursos) {
      const i = r.lastIndexOf(" | ");
      const titulo = r.slice(0, i), url = r.slice(i + 3);
      if (vistos.has(url)) continue;
      vistos.add(url);
      linhas.push(`(${q(titulo)}, ${q(url)}, ${q(tipoDe(url))}, ${q(`Fase ${fase} · ${temas[c.numero]}`)})`);
    }
  }
}

const sql = `-- Gerado por scripts/seed-recursos.mjs. Rode inteiro no SQL Editor (projeto Meiro). Pode rodar de novo.
${readFileSync(resolve(root, "supabase/migrations/0003_recursos_status.sql"), "utf8")}
do $$
declare uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(${q(email)});
  if uid is null then raise exception 'Usuário não encontrado'; end if;

  insert into public.materiais (user_id, titulo, url, tipo, pasta, tags, status_estudo)
  select uid, v.titulo, v.url, v.tipo, v.pasta, '{}', 'quero_ver'
  from (values
${linhas.map((l) => "    " + l).join(",\n")}
  ) as v(titulo, url, tipo, pasta)
  where not exists (select 1 from public.materiais m where m.user_id = uid and m.url = v.url);
end $$;
`;
const out = resolve(root, "supabase/seeds/recursos.sql");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, sql);
console.log(`OK: ${out} (${linhas.length} recursos)`);
