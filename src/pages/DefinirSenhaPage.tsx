import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../store/useAuthStore";
import { notificarSucesso } from "../store/useToastStore";
import { MeiroLogo } from "../components/common/MeiroLogo";
import { EsqueciSenhaForm } from "./LoginPage";

/**
 * Destino dos links de convite e de "esqueci minha senha". O Supabase já loga a
 * pessoa pelo link; aqui ela escolhe a senha que vai usar nas próximas vezes.
 */
export default function DefinirSenhaPage() {
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const erroLinkAuth = useAuthStore((s) => s.erroLinkAuth);
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha !== confirmacao) {
      setErro("As senhas não são iguais.");
      return;
    }
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) {
      setErro(error.message);
      return;
    }
    useAuthStore.setState({ definirSenhaPendente: false, erroLinkAuth: null });
    notificarSucesso("Senha definida. Use seu e-mail e essa senha para entrar.");
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="card w-full max-w-sm p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="mb-3">
            <MeiroLogo size={40} />
          </div>
          <h1 className="text-lg font-semibold">Definir senha</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 size={24} className="animate-spin text-brand" />
          </div>
        ) : !session ? (
          <div className="space-y-4">
            <p className="text-sm text-text-muted text-center leading-relaxed">
              {erroLinkAuth
                ? "Este link é inválido ou já expirou."
                : "Abra esta página pelo link enviado para o seu e-mail."}{" "}
              Peça um novo link abaixo.
            </p>
            <EsqueciSenhaForm />
            <p className="text-sm text-center">
              <Link to="/login" className="text-brand underline">Voltar para o login</Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-text-muted text-center mb-2">
              Escolha a senha para <strong className="text-text">{session.user.email}</strong>.
            </p>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="input"
              placeholder="Nova senha (mín. 6 caracteres)"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="input"
              placeholder="Repita a senha"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
            />
            {erro && <p className="text-sm text-red-500">{erro}</p>}
            <button type="submit" disabled={salvando} className="btn btn-primary w-full justify-center">
              {salvando && <Loader2 size={16} className="animate-spin" />}
              Salvar senha
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
