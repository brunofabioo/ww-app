import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Atividades from "./pages/Atividades";
import Atividades2 from "./pages/Atividades2";
import Turmas from "./pages/Turmas";
import CriarProva from "./pages/CriarProva";
import CriarProva2 from "./pages/CriarProva2";
import CriarProva3 from "./pages/CriarProva3";
import CriarProva4 from "./pages/CriarProva4";
import CriarProva5 from "./pages/CriarProva5";
import Materiais from "./pages/Materiais";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected area */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Index />} />
          <Route path="/atividades" element={<Atividades />} />
          <Route path="/atividades-2" element={<Atividades2 />} />
          <Route path="/turmas" element={<Turmas />} />
          <Route path="/criar-prova" element={<CriarProva />} />
          <Route path="/criar-prova-2" element={<CriarProva2 />} />
          <Route path="/criar-prova-3" element={<CriarProva3 />} />
          <Route path="/criar-prova-4" element={<CriarProva4 />} />
          <Route path="/criar-prova-5" element={<CriarProva5 />} />
          <Route path="/materiais" element={<Materiais />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <Sonner />
    </BrowserRouter>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
