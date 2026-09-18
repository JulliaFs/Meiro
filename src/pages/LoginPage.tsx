import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../store/useAuthStore";
import { MeiroLogo } from "../components/common/MeiroLogo";

/** Envia o link para (re)definir a senha. Também serve para quem foi convidado e nunca criou uma. */
export function EsqueciSenhaForm({ emailInicial = "" }: { emailInicial?: string }) {
  const [email, setEmail] = useState(emailInicial);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/definir-senha`,
    });
    setEnviando(false);
    if (error) setErro(error.message);
    else setEnviado(true);
  }

  if (enviado) {
    return (
      <p className="text-sm text-text-muted text-center leading-relaxed">
        Se existir uma conta para <strong className="text-text">{email}</strong>, você vai receber um e-mail com o link para
        definir a senha.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="email" required className="input" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      {erro && <p className="text-sm text-red-500">{erro}</p>}
      <button type="submit" disabled={enviando} className="btn btn-primary w-full justify-center">
        {enviando && <Loader2 size={16} className="animate-spin" />}
        Enviar link
      </button>
    </form>
  );
}

export default function LoginPage() {
  const session = useAuthStore((s) => s.session);
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [esqueci, setEsqueci] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error === "Invalid login credentials" ? "E-mail ou senha incorretos." : result.error);
    }
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
            {esqueci ? "Enviaremos um link para você definir uma nova senha." : "Do labirinto à clareza. Entre para continuar."}
          </p>
        </div>

        {esqueci ? (
          <>
            <EsqueciSenhaForm emailInicial={email} />
            <button onClick={() => setEsqueci(false)} className="text-sm text-brand underline mt-4 w-full text-center">
              Voltar para o login
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
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
            <button onClick={() => setEsqueci(true)} className="text-sm text-text-muted hover:text-text mt-3 w-full text-center">
              Esqueci minha senha / ainda não criei uma
            </button>

            <p className="text-sm text-text-muted mt-4 text-center leading-relaxed">
              O beta é por convite. Entre na lista de espera na{" "}
              <a href="/" className="text-brand underline">página inicial</a>{" "}
              e você receberá um e-mail para criar sua senha.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
