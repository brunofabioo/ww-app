import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function Atividades2() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-jakarta font-bold text-slate-900">Atividades 2</h1>
          <Link to="/criar-prova-5">
            <Button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
              Nova Prova
            </Button>
          </Link>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white/80 p-6">
          <p className="text-gray-700">Página simples para testes do menu lateral. Conteúdo mínimo intencionalmente.</p>
        </div>
      </div>
    </Layout>
  );
}
