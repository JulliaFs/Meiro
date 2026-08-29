# Meiro

**Clareza para evoluir.** O sistema operacional dos seus estudos: faculdade, cursos,
biblioteca, anotações, flashcards, revisões, metas e mapa de carreira em um só lugar.

Aplicação React + TypeScript + Vite, com Supabase (autenticação, Postgres e storage)
como back-end. O acesso ao beta é **somente por convite**.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Supabase
npm run dev
```

Variáveis necessárias (veja `.env.example`):

| Variável | Onde encontrar |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (chave pública) |

> Nunca coloque a `service_role key` em variáveis `VITE_*` — tudo que começa com
> `VITE_` vai para o bundle e fica visível no navegador.

## Configurando o Supabase

1. **Banco:** rode `supabase/schema.sql` no SQL Editor de um projeto novo.
   Em um projeto que já existe, rode `supabase/migrations/0001_hardening_admin_rls.sql`.
2. **Cadastro por convite:** em *Authentication → Sign In / Providers*, desative
   **"Allow new users to sign up"**. O acesso é liberado apenas pelo convite
   enviado na tela de Lista de Espera.
3. **Vire admin** (só a service role promove alguém — não dá para se auto-promover
   pelo app):

   ```sql
   select id, email from auth.users;
   insert into admins (user_id) values ('SEU-USER-UUID') on conflict do nothing;
   ```

4. **Edge function de convite:**

   ```bash
   supabase secrets set ALLOWED_ORIGIN=https://seu-dominio.com
   supabase functions deploy invite-user
   ```

   `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` já são
   injetadas automaticamente pelo Supabase.

## Modelo de segurança

- Toda tabela de conteúdo tem `user_id` + RLS: cada pessoa só lê e escreve o que é seu.
- O bucket `arquivos` é privado e particionado por `user_id`; o download usa URL assinada.
- A lista de espera só é visível para quem está na tabela `admins`.
- A `invite-user` valida que quem chama é admin antes de usar a service role key, e
  só convida e-mails que já estão na lista de espera.
- O flag `isAdmin` no front serve apenas para esconder a UI — quem protege os dados é o RLS.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Type-check + build de produção |
| `npm run lint` | Oxlint |
| `npm run preview` | Serve o build local |
