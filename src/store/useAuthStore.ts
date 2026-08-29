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
  useAuthStore.setState({ adminLoading: true });
  const { data, error } = await supabase.rpc("is_admin");
  useAuthStore.setState({ isAdmin: !error && data === true, adminLoading: false });
}

supabase.auth.getSession().then(({ data }) => {
  useAuthStore.setState({ session: data.session, loading: false });
  refreshAdmin(data.session);
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ session, loading: false });
  refreshAdmin(session);
});
