-- Estúdio: material de estudo guiado (capítulos, kit de entrega, plano do dia) e o
-- progresso de quem estuda. Cada linha é de um usuário e só ele lê ou escreve (RLS).
-- O conteúdo vive no banco, não no repositório, porque o repositório é público.
-- Rode uma vez no SQL Editor do projeto. Idempotente; não mexe em dados existentes.
create table if not exists public.estudio (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chave text not null,          -- 'cap-1' … 'cap-10', 'gs', 'plano', 'progresso'
  tipo text not null,           -- 'capitulo' | 'gs' | 'plano' | 'progresso'
  ordem int not null default 0,
  dados jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, chave)
);

alter table public.estudio enable row level security;

drop policy if exists "select_own" on public.estudio;
drop policy if exists "insert_own" on public.estudio;
drop policy if exists "update_own" on public.estudio;
drop policy if exists "delete_own" on public.estudio;
create policy "select_own" on public.estudio for select using (auth.uid() = user_id);
create policy "insert_own" on public.estudio for insert with check (auth.uid() = user_id);
create policy "update_own" on public.estudio for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own" on public.estudio for delete using (auth.uid() = user_id);

drop trigger if exists trg_estudio_updated_at on public.estudio;
create trigger trg_estudio_updated_at before update on public.estudio
for each row execute function set_updated_at();
