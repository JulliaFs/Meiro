-- Biblioteca de recursos: status de estudo de cada recurso (quero ver / vendo / visto).
-- Rode uma vez no SQL Editor do projeto. Idempotente; não mexe em dados existentes.
alter table public.materiais add column if not exists status_estudo text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'materiais_status_estudo_check') then
    alter table public.materiais add constraint materiais_status_estudo_check
      check (status_estudo is null or status_estudo in ('quero_ver', 'vendo', 'visto'));
  end if;
end $$;
