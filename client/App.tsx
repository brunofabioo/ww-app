import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Atividades from "./pages/Atividades";

import Turmas from "./pages/Turmas";
import CriarAtividade from "./pages/CriarAtividade";
import CriarAtividade2 from "./pages/CriarAtividade2";
import CriarAtividade3 from "./pages/CriarAtividade3";
import CriarAtividade4 from "./pages/CriarAtividade4";
import CriarAtividade5 from "./pages/CriarAtividade5";
import Materiais from "./pages/Materiais";

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
  
          <Route path="/turmas" element={<Turmas />} />
          <Route path="/criar-atividade" element={<CriarAtividade />} />
          <Route path="/criar-atividade-2" element={<CriarAtividade2 />} />
          <Route path="/criar-atividade-3" element={<CriarAtividade3 />} />
          <Route path="/criar-atividade-4" element={<CriarAtividade4 />} />
          <Route path="/criar-atividade-5" element={<CriarAtividade5 />} />
          <Route path="/materiais" element={<Materiais />} />
  
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
