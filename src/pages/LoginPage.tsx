import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { MeiroLogo } from "../components/common/MeiroLogo";

export default function LoginPage() {
  const session = useAuthStore((s) => s.session);
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  if (session) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="card w-full max-w-sm p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="mb-3">
            <MeiroLogo size={40} />
          </div>
          <h1 className="text-lg font-semibold">meiro</h1>
          <p className="text-text-muted text-sm mt-1 text-center">
            Do labirinto à clareza. Entre para continuar.
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
          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Entrar
          </button>
        </form>

        <p className="text-sm text-text-muted mt-4 text-center leading-relaxed">
          O beta é por convite. Entre na lista de espera na{" "}
          <a href="/" className="text-brand underline">página inicial</a>{" "}
          e você receberá um e-mail para criar sua senha.
        </p>
      </div>
    </div>
  );
}
