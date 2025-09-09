import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import Layout from '../components/Layout';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function EmailConfirm() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmailChange = async () => {
      try {
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        if (!tokenHash || type !== 'email_change') {
          setStatus('error');
          setMessage('Link de confirmação inválido ou expirado.');
          return;
        }

        // Verificar o token de mudança de email
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email_change'
        });

        if (error) {
          console.error('Erro ao confirmar mudança de email:', error);
          setStatus('error');
          setMessage('Erro ao confirmar a mudança de email. O link pode estar expirado.');
          
          toast({
            title: "Erro na confirmação",
            description: "Não foi possível confirmar a mudança de email.",
            variant: "destructive",
          });
        } else {
          setStatus('success');
          setMessage('Email alterado com sucesso!');
          
          toast({
            title: "Email confirmado",
            description: "Seu email foi alterado com sucesso!",
          });
        }
      } catch (error: any) {
        console.error('Erro inesperado:', error);
        setStatus('error');
        setMessage('Ocorreu um erro inesperado.');
      }
    };

    confirmEmailChange();
  }, [searchParams, toast]);

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <Card className="border-0 bg-white/70 card-enhanced">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              {status === 'loading' && (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span>Confirmando email...</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-green-600">Email Confirmado</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="text-red-600">Erro na Confirmação</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-700">{message}</p>
            
            <div className="space-y-2">
              {status === 'success' && (
                <Button onClick={handleGoToProfile} className="w-full">
                  Ir para o Perfil
                </Button>
              )}
              {status === 'error' && (
                <>
                  <Button onClick={handleGoToProfile} className="w-full">
                    Tentar Novamente no Perfil
                  </Button>
                  <Button onClick={handleGoToLogin} variant="outline" className="w-full">
                    Fazer Login
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}