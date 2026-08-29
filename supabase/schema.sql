-- JU Academy OS — schema Supabase
-- Rode este script no SQL Editor do seu projeto Supabase.
-- Todas as tabelas usam user_id + RLS para que cada usuário veja só os seus dados.

create extension if not exists "pgcrypto";

-- ---------- helper: coluna user_id padrão + trigger updated_at ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------- Faculdade ----------
create table anos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  numero int not null,
  nome text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table fases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ano_id uuid not null references anos(id) on delete cascade,
  nome text not null,
  numero int not null,
  data_inicio date,
  data_termino date,
  descricao text default '',
  observacoes text,
  status text not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table capitulos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fase_id uuid not null references fases(id) on delete cascade,
  nome text not null,
  numero int not null,
  descricao text,
  data_estudo date,
  status text not null default 'nao_iniciado',
  links text[] not null default '{}',
  nota_fast_test numeric,
  nota_exercicios numeric,
  observacoes_desempenho text,
  resumo text,
  principais_conceitos text,
  dificuldade text,
  skills text[] not null default '{}',
  pdf_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Áreas de conhecimento ----------
create table areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  descricao text,
  nivel int not null default 0,
  progresso int not null default 0,
  horas_estudadas numeric not null default 0,
  cor text not null default '#6d5bf8',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Cursos / Módulos / Aulas ----------
create table cursos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  plataforma text,
  link text,
  categoria text not null default 'Outros',
  instrutor text,
  carga_horaria numeric not null default 0,
  data_inicio date,
  data_conclusao date,
  status text not null default 'planejado',
  certificado_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table modulos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  curso_id uuid not null references cursos(id) on delete cascade,
  nome text not null,
  numero int not null,
  descricao text,
  status text not null default 'nao_iniciado',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table aulas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  modulo_id uuid not null references modulos(id) on delete cascade,
  nome text not null,
  numero int not null,
  data date,
  duracao_minutos numeric,
  status text not null default 'nao_iniciado',
  pdf_id uuid,
  material_complementar_id uuid,
  certificado_parcial_id uuid,
  resumo text,
  aprendizados text,
  observacoes text,
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Certificados ----------
create table certificados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  instituicao text,
  data date,
  carga_horaria numeric not null default 0,
  area text,
  arquivo_id uuid,
  link_validacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Biblioteca / Materiais ----------
create table materiais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  descricao text,
  tipo text not null default 'pdf',
  tags text[] not null default '{}',
  area text,
  pasta text,
  arquivo_id uuid,
  url text,
  data_upload date not null default current_date,
  origem_tipo text,
  origem_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Anotações ----------
create table anotacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  conteudo text not null default '',
  pasta text,
  area text,
  materia text,
  tags text[] not null default '{}',
  origem_tipo text,
  origem_id uuid,
  origem_label text,
  ano_id uuid,
  fase_id uuid,
  curso_id uuid,
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Flashcards ----------
create table flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pergunta text not null,
  resposta text not null,
  categoria text,
  area text,
  dificuldade text not null default 'medio',
  ultima_revisao date,
  proxima_revisao date,
  intervalo_dias int not null default 1,
  acertos_seguidos int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Metas ----------
create table metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  descricao text not null,
  prazo date,
  categoria text not null default 'mensal',
  progresso int not null default 0,
  checklist jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Habilidades (metas de carreira) ----------
create table habilidades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  nivel_atual int not null default 0,
  meta int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Sessões de estudo ----------
create table sessoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null default current_date,
  minutos numeric not null default 0,
  area_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- triggers updated_at ----------
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'anos','fases','capitulos','areas','cursos','modulos','aulas',
    'certificados','materiais','anotacoes','flashcards','metas','habilidades','sessoes'
  ])
  loop
    execute format('create trigger trg_%I_updated_at before update on %I for each row execute function set_updated_at();', t, t);
  end loop;
end $$;

-- ---------- RLS: cada usuário só acessa o que é seu ----------
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'anos','fases','capitulos','areas','cursos','modulos','aulas',
    'certificados','materiais','anotacoes','flashcards','metas','habilidades','sessoes'
  ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('create policy "select_own" on %I for select using (auth.uid() = user_id);', t);
    execute format('create policy "insert_own" on %I for insert with check (auth.uid() = user_id);', t);
    execute format('create policy "update_own" on %I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
    execute format('create policy "delete_own" on %I for delete using (auth.uid() = user_id);', t);
  end loop;
end $$;

-- ---------- Storage: bucket privado para arquivos (PDF/DOCX/imagens) ----------
insert into storage.buckets (id, name, public)
values ('arquivos', 'arquivos', false)
on conflict (id) do nothing;

create policy "arquivos_select_own"
on storage.objects for select
using (bucket_id = 'arquivos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "arquivos_insert_own"
on storage.objects for insert
with check (bucket_id = 'arquivos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "arquivos_delete_own"
on storage.objects for delete
using (bucket_id = 'arquivos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------- admins: quem pode gerenciar a lista de espera e enviar convites ----------
-- A tabela nao tem policy de insert/update/delete: so a service role (SQL Editor do
-- painel do Supabase) promove alguem a admin. Assim ninguem se auto-promove pelo app.
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

drop policy if exists "admins_select_self" on admins;
create policy "admins_select_self"
on admins for select
to authenticated
using (user_id = auth.uid());

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

revoke execute on function is_admin() from anon;
grant execute on function is_admin() to authenticated;

-- Depois de criar sua conta, rode uma vez no SQL Editor para virar admin:
--   insert into admins (user_id) values ('SEU-USER-UUID') on conflict do nothing;

-- ---------- waitlist: captura de leads da landing page (sem autenticação) ----------
create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table waitlist_signups enable row level security;

-- Qualquer visitante pode se inscrever, mas ninguem le a lista alem dos admins.
drop policy if exists "waitlist_insert_anyone" on waitlist_signups;
create policy "waitlist_insert_anyone"
on waitlist_signups for insert
to anon, authenticated
with check (true);

-- ---------- waitlist: status de aprovação + acesso restrito aos admins ----------
alter table waitlist_signups add column if not exists status text not null default 'pending';
alter table waitlist_signups add column if not exists notes text;
alter table waitlist_signups add column if not exists invited_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'waitlist_signups_status_check') then
    alter table waitlist_signups add constraint waitlist_signups_status_check
      check (status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

drop policy if exists "waitlist_select_authenticated" on waitlist_signups;
drop policy if exists "waitlist_update_authenticated" on waitlist_signups;
drop policy if exists "waitlist_delete_authenticated" on waitlist_signups;

create policy "waitlist_select_admin"
on waitlist_signups for select
to authenticated
using (is_admin());

create policy "waitlist_update_admin"
on waitlist_signups for update
to authenticated
using (is_admin())
with check (is_admin());

create policy "waitlist_delete_admin"
on waitlist_signups for delete
to authenticated
using (is_admin());

-- ---------- cadastro: somente por convite ----------
-- O acesso e liberado apenas pelo convite enviado na tela de Lista de Espera
-- (edge function invite-user). Desative "Allow new users to sign up" em
-- Authentication > Sign In / Providers no painel do Supabase.
-- A funcao abaixo existia para uma checagem feita no navegador, que nao protegia
-- nada (a anon key e publica) e ainda permitia enumerar quem estava aprovado.
drop function if exists is_waitlist_approved(text);
