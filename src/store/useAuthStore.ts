import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

interface AuthState {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(() => ({
  session: null,
  loading: true,
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },
  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  },
  signOut: async () => {
    await supabase.auth.signOut();
  },
}));

supabase.auth.getSession().then(({ data }) => {
  useAuthStore.setState({ session: data.session, loading: false });
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ session, loading: false });
});
