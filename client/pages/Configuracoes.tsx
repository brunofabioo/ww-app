import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Cog, Plus } from "lucide-react";
import Layout from "@/components/Layout";

export default function Configuracoes() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-brand-pink rounded-2xl flex items-center justify-center mx-auto">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-jakarta font-bold text-slate-900">
            Configurações
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Esta página está sendo construída. Em breve você poderá personalizar todas as configurações do seu ExamAI.
          </p>
        </div>
        
        <Card className="max-w-md mx-auto border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <Cog className="w-5 h-5 text-brand-purple" />
              <span>Em desenvolvimento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Continue criando provas enquanto preparamos esta funcionalidade para você!
            </p>
            <Button 
              className="w-full bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Nova Prova
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
