import { useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export default function LoginPage() {
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const result = mode === "login" ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === "signup") {
      setInfo("Conta criada! Verifique seu e-mail para confirmar (se a confirmação estiver ativada) ou já entre normalmente.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="card w-full max-w-sm p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white mb-3">
            <GraduationCap size={20} />
          </div>
          <h1 className="text-lg font-semibold">JU Academy OS</h1>
          <p className="text-text-muted text-sm mt-1 text-center">
            {mode === "login" ? "Entre para continuar sua jornada de estudos." : "Crie sua conta para começar."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            className="input"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            minLength={6}
            className="input"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {info && <p className="text-sm text-emerald-600">{info}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setInfo(null); }}
          className="text-sm text-text-muted hover:text-text mt-4 w-full text-center"
        >
          {mode === "login" ? "Não tem conta? Criar uma agora" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
