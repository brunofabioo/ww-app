import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-jakarta font-bold text-slate-900">
            Página não encontrada
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ops! A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <Card className="max-w-md mx-auto border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <span>Erro 404</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Volte para o dashboard e continue criando suas provas!
            </p>
            <Link to="/">
              <Button 
                className="w-full bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
              >
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
