import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"; 

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Defina ALLOWED_ORIGIN como a URL do app (ex.: https://meiro.app) nos secrets
// da function. Sem isso, qualquer site poderia chamar a function pelo navegador
// com a sessao do visitante.
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "";

function corsHeaders(origin: string | null) {
  const allowed = ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req.headers.get("Origin"));

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  const fail = (message: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: message }), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return fail("Nao autenticado.", 401);

    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: caller, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller.user) return fail("Sessao invalida.", 401);

    // Estar logado nao basta: a service role key so e usada para admins de fato.
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: adminRow, error: adminError } = await adminClient
      .from("admins")
      .select("user_id")
      .eq("user_id", caller.user.id)
      .maybeSingle();
    if (adminError) return fail("Nao foi possivel validar as permissoes.", 500);
    if (!adminRow) return fail("Voce nao tem permissao para enviar convites.", 403);

    const { email } = await req.json();
    if (!email || typeof email !== "string") return fail("E-mail e obrigatorio.", 400);

    // So convida quem realmente esta na lista de espera — evita usar o convite
    // como canal aberto de criacao de contas.
    const { data: signup, error: signupError } = await adminClient
      .from("waitlist_signups")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (signupError) return fail("Nao foi possivel consultar a lista de espera.", 500);
    if (!signup) return fail("Este e-mail nao esta na lista de espera.", 400);

    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email);
    if (error) return fail(error.message, 400);

    return new Response(JSON.stringify({ ok: true, userId: data.user?.id }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    return fail(message, 400);
  }
});
