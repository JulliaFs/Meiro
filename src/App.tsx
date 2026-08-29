import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { ProtectedRoute } from "./layout/ProtectedRoute";
import { AdminRoute } from "./layout/AdminRoute";
import { HomeGate } from "./layout/HomeGate";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import FaculdadePage from "./pages/FaculdadePage";
import FasePage from "./pages/FasePage";
import AreasPage from "./pages/AreasPage";
import CursosPage from "./pages/CursosPage";
import CursoDetailPage from "./pages/CursoDetailPage";
import BibliotecaPage from "./pages/BibliotecaPage";
import AnotacoesPage from "./pages/AnotacoesPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import CertificadosPage from "./pages/CertificadosPage";
import RevisoesPage from "./pages/RevisoesPage";
import CarreiraPage from "./pages/CarreiraPage";
import MetasPage from "./pages/MetasPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import WaitlistPage from "./pages/WaitlistPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomeGate />}>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
            </Route>
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/faculdade" element={<FaculdadePage />} />
            <Route path="/faculdade/:anoId/:faseId" element={<FasePage />} />
            <Route path="/areas" element={<AreasPage />} />
            <Route path="/cursos" element={<CursosPage />} />
            <Route path="/cursos/:cursoId" element={<CursoDetailPage />} />
            <Route path="/biblioteca" element={<BibliotecaPage />} />
            <Route path="/anotacoes" element={<AnotacoesPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/certificados" element={<CertificadosPage />} />
            <Route path="/revisoes" element={<RevisoesPage />} />
            <Route path="/carreira" element={<CarreiraPage />} />
            <Route path="/metas" element={<MetasPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            <Route element={<AdminRoute />}>
              <Route path="/waitlist" element={<WaitlistPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
