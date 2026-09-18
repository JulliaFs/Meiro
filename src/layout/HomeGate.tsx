import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import LandingPage from "../pages/LandingPage";

export function HomeGate() {
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);
  const definirSenhaPendente = useAuthStore((s) => s.definirSenhaPendente);
  const erroLinkAuth = useAuthStore((s) => s.erroLinkAuth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand" />
      </div>
    );
  }

  // Convites antigos (sem redirectTo) caem na raiz: manda escolher a senha antes de tudo.
  if ((session && definirSenhaPendente) || (!session && erroLinkAuth)) {
    return <Navigate to="/definir-senha" replace />;
  }

  if (!session) return <LandingPage />;

  return <Outlet />;
}
