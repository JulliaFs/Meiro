import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

interface AuthState {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  adminLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(() => ({
  session: null,
  loading: true,
  isAdmin: false,
  adminLoading: true,
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },
  signOut: async () => {
    await supabase.auth.signOut();
  },
}));

// O flag de admin serve so para esconder a UI. Quem protege os dados sao as
// policies de RLS e a checagem dentro da edge function invite-user.
async function refreshAdmin(session: Session | null) {
  if (!session) {
    useAuthStore.setState({ isAdmin: false, adminLoading: false });
    return;
  }
  const { data, error } = await supabase.rpc("is_admin");
  if (error) {
    console.warn("Nao foi possivel verificar se a conta e admin:", error.message);
  }
  useAuthStore.setState({ isAdmin: !error && data === true, adminLoading: false });
}

// IMPORTANTE: nao chamar o Supabase de dentro do callback do onAuthStateChange.
// O cliente de auth segura um lock enquanto processa esse callback; qualquer
// chamada feita ali dentro espera o mesmo lock e a promise nunca resolve
// (deadlock), deixando isAdmin falso para sempre. O setTimeout tira a chamada
// de dentro do callback.
function scheduleAdminRefresh(session: Session | null) {
  setTimeout(() => {
    refreshAdmin(session).catch((err) => {
      console.warn("Falha ao verificar admin:", err);
      useAuthStore.setState({ isAdmin: false, adminLoading: false });
    });
  }, 0);
}

supabase.auth.getSession().then(({ data }) => {
  useAuthStore.setState({ session: data.session, loading: false });
  scheduleAdminRefresh(data.session);
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ session, loading: false });
  scheduleAdminRefresh(session);
});
