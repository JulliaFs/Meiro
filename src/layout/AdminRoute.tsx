import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

/** Esconde telas de administração de quem não é admin.
 *  É só UX: o bloqueio real está nas policies de RLS do Supabase. */
export function AdminRoute() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const adminLoading = useAuthStore((s) => s.adminLoading);

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
