import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/ui/loading-spinner";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Atividades = lazy(() => import("./pages/Atividades"));
const Turmas = lazy(() => import("./pages/Turmas"));
const CriarAtividade = lazy(() => import("./pages/versoes-antigas/CriarAtividade"));
const CriarAtividade2 = lazy(() => import("./pages/versoes-antigas/CriarAtividade2"));
const CriarAtividade3 = lazy(() => import("./pages/versoes-antigas/CriarAtividade3"));
const CriarAtividade4 = lazy(() => import("./pages/versoes-antigas/CriarAtividade4"));
const CriarAtividade5 = lazy(() => import("./pages/CriarAtividade5"));
const Materiais = lazy(() => import("./pages/Materiais"));
const Profile = lazy(() => import("./pages/Profile"));
const EmailConfirm = lazy(() => import("./pages/EmailConfirm"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner message="Carregando..." fullScreen />}>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/confirm" element={<EmailConfirm />} />

          {/* Protected area */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Index />} />
            <Route path="/atividades" element={<Atividades />} />
    
            <Route path="/turmas" element={<Turmas />} />
            <Route path="/criar-atividade" element={<CriarAtividade />} />
            <Route path="/criar-atividade-2" element={<CriarAtividade2 />} />
            <Route path="/criar-atividade-3" element={<CriarAtividade3 />} />
            <Route path="/criar-atividade-4" element={<CriarAtividade4 />} />
            <Route path="/criar-atividade-5" element={<CriarAtividade5 />} />
            <Route path="/materiais" element={<Materiais />} />
            <Route path="/profile" element={<Profile />} />
    
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
      <Sonner />
    </BrowserRouter>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
