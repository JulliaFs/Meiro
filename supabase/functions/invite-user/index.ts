import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"; 

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autenticado.");

    // Confirma que quem está chamando a função é um usuário logado (você, dono do app),
    // não um visitante anônimo — só assim liberamos o uso da service role key.
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: caller, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller.user) throw new Error("Sessão inválida.");

    const { email } = await req.json();
    if (!email || typeof email !== "string") throw new Error("E-mail é obrigatório.");

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, userId: data.user?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
