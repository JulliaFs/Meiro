-- Correcoes de seguranca — rode uma vez no SQL Editor do projeto ja existente.
-- Idempotente: pode rodar de novo sem quebrar nada.

-- 1) update_own sem WITH CHECK permitia trocar o user_id da linha para outro
--    usuario (doar/injetar registros). Recria as policies com a checagem.
do $$
declare t text;
begin
  for t in select unnest(array[
    'anos','fases','capitulos','areas','cursos','modulos','aulas',
    'certificados','materiais','anotacoes','flashcards','metas','habilidades','sessoes'
  ])
  loop
    execute format('drop policy if exists "update_own" on %I;', t);
    execute format('create policy "update_own" on %I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
  end loop;
end $$;

-- 2) Modelo de admin. Sem policy de escrita: so a service role promove alguem.
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

-- 3) A lista de espera estava aberta para QUALQUER usuario logado ler, editar e
--    apagar (using (true)). Agora e restrita a admins.
drop policy if exists "waitlist_select_authenticated" on waitlist_signups;
drop policy if exists "waitlist_update_authenticated" on waitlist_signups;
drop policy if exists "waitlist_delete_authenticated" on waitlist_signups;

drop policy if exists "waitlist_select_admin" on waitlist_signups;
create policy "waitlist_select_admin"
on waitlist_signups for select
to authenticated
using (is_admin());

drop policy if exists "waitlist_update_admin" on waitlist_signups;
create policy "waitlist_update_admin"
on waitlist_signups for update
to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists "waitlist_delete_admin" on waitlist_signups;
create policy "waitlist_delete_admin"
on waitlist_signups for delete
to authenticated
using (is_admin());

-- 4) Oraculo de enumeracao: qualquer anonimo podia testar e-mail por e-mail quem
--    estava aprovado. O cadastro agora e so por convite, entao a funcao sai.
drop function if exists is_waitlist_approved(text);

-- 5) DEPOIS de rodar isto, promova sua conta a admin (troque o UUID):
--      select id, email from auth.users;
--      insert into admins (user_id) values ('SEU-USER-UUID') on conflict do nothing;
