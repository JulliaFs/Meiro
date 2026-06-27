import { Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import LandingPage from "../pages/LandingPage";

export function HomeGate() {
  const session = useAuthStore((s) => s.session);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!session) return <LandingPage />;

  return <Outlet />;
}
