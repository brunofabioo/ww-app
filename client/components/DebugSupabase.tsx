import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface DebugInfo {
  environment: {
    supabaseUrl: string | undefined;
    supabaseKey: string | undefined;
    nodeEnv: string | undefined;
  };
  connection: {
    status: 'checking' | 'success' | 'error';
    message: string;
  };
  edgeFunction: {
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
    response?: any;
  };
}

export default function DebugSupabase() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    environment: {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      nodeEnv: import.meta.env.NODE_ENV,
    },
    connection: {
      status: 'checking',
      message: 'Não testado ainda'
    },
    edgeFunction: {
      status: 'idle',
      message: 'Não testado ainda'
    }
  });

  const testConnection = async () => {
    try {
      setDebugInfo(prev => ({
        ...prev,
        connection: { status: 'checking', message: 'Testando conexão...' }
      }));

      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setDebugInfo(prev => ({
          ...prev,
          connection: { 
            status: 'error', 
            message: `Erro na conexão: ${error.message}` 
          }
        }));
      } else {
        setDebugInfo(prev => ({
          ...prev,
          connection: { 
            status: 'success', 
            message: 'Conexão com Supabase funcionando!' 
          }
        }));
      }
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        connection: { 
          status: 'error', 
          message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
        }
      }));
    }
  };

  const testEdgeFunction = async () => {
    try {
      setDebugInfo(prev => ({
        ...prev,
        edgeFunction: { status: 'testing', message: 'Testando edge function...' }
      }));

      // Dados de teste simples
      const testData = {
        title: 'Teste Debug',
        language: 'Português',
        difficulty: 'Fácil',
        questionsCount: 2,
        questionTypes: {
          multipleChoice: true,
          fillBlanks: false,
          trueFalse: false,
          openQuestions: false
        },
        topics: 'Teste de funcionamento',
        generateMultipleVersions: false,
        versionsCount: 1,
        timestamp: Date.now(),
        randomSeed: Math.floor(Math.random() * 100000),
        sessionId: `debug-${Date.now()}`,
        turmaNome: null,
        materialTitulo: null,
        materialConteudo: null
      };

      console.log('🔍 Dados enviados para edge function:', testData);

      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: testData,
      });

      console.log('📥 Resposta da edge function:', { data, error });

      if (error) {
        setDebugInfo(prev => ({
          ...prev,
          edgeFunction: { 
            status: 'error', 
            message: `Erro na edge function: ${error.message}`,
            response: error
          }
        }));
      } else {
        setDebugInfo(prev => ({
          ...prev,
          edgeFunction: { 
            status: 'success', 
            message: 'Edge function funcionando!',
            response: data
          }
        }));
      }
    } catch (error) {
      console.error('❌ Erro no teste da edge function:', error);
      setDebugInfo(prev => ({
        ...prev,
        edgeFunction: { 
          status: 'error', 
          message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          response: error
        }
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'checking':
      case 'testing':
        return <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Sucesso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'checking':
      case 'testing':
        return <Badge variant="secondary">Testando...</Badge>;
      default:
        return <Badge variant="outline">Não testado</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Debug Supabase - Vercel vs Localhost
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações do Ambiente */}
        <div>
          <h3 className="text-lg font-semibold mb-3">🌍 Variáveis de Ambiente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">VITE_SUPABASE_URL:</span>
                {debugInfo.environment.supabaseUrl ? (
                  <Badge variant="default">Configurada</Badge>
                ) : (
                  <Badge variant="destructive">Não configurada</Badge>
                )}
              </div>
              {debugInfo.environment.supabaseUrl && (
                <p className="text-xs text-gray-600 break-all">
                  {debugInfo.environment.supabaseUrl}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">VITE_SUPABASE_ANON_KEY:</span>
                {debugInfo.environment.supabaseKey ? (
                  <Badge variant="default">Configurada</Badge>
                ) : (
                  <Badge variant="destructive">Não configurada</Badge>
                )}
              </div>
              {debugInfo.environment.supabaseKey && (
                <p className="text-xs text-gray-600">
                  {debugInfo.environment.supabaseKey.substring(0, 20)}...
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">NODE_ENV:</span>
                <Badge variant="outline">
                  {debugInfo.environment.nodeEnv || 'undefined'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ambiente:</span>
                <Badge variant="outline">
                  {window.location.hostname === 'localhost' ? 'Localhost' : 'Produção'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Teste de Conexão */}
        <div>
          <h3 className="text-lg font-semibold mb-3">🔌 Teste de Conexão</h3>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(debugInfo.connection.status)}
              <span className="text-sm">{debugInfo.connection.message}</span>
            </div>
            {getStatusBadge(debugInfo.connection.status)}
          </div>
          <Button onClick={testConnection} disabled={debugInfo.connection.status === 'checking'}>
            Testar Conexão Supabase
          </Button>
        </div>

        {/* Teste da Edge Function */}
        <div>
          <h3 className="text-lg font-semibold mb-3">⚡ Teste da Edge Function</h3>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(debugInfo.edgeFunction.status)}
              <span className="text-sm">{debugInfo.edgeFunction.message}</span>
            </div>
            {getStatusBadge(debugInfo.edgeFunction.status)}
          </div>
          <Button 
            onClick={testEdgeFunction} 
            disabled={debugInfo.edgeFunction.status === 'testing'}
            className="mb-3"
          >
            Testar Edge Function
          </Button>
          
          {debugInfo.edgeFunction.response && (
            <Alert>
              <AlertDescription>
                <strong>Resposta da Edge Function:</strong>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugInfo.edgeFunction.response, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Informações Adicionais */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Como usar este debug:</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>• Teste primeiro no localhost para verificar se funciona</li>
              <li>• Depois teste na Vercel para comparar os resultados</li>
              <li>• Verifique se as variáveis de ambiente estão configuradas na Vercel</li>
              <li>• Abra o console do navegador (F12) para ver logs detalhados</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}