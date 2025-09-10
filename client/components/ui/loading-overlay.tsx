import React from 'react';
import { Sparkles, Brain } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
}

export default function LoadingOverlay({ 
  isVisible, 
  message = "Gerando atividade pela inteligência artificial...", 
  subMessage = "Aguarde um instante" 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Ícone animado */}
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
            <Brain className="w-10 h-10 text-purple-600 animate-pulse" />
          </div>
          {/* Efeito de brilho */}
          <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-purple-200 to-blue-200 rounded-full animate-ping opacity-20"></div>
        </div>

        {/* Texto principal */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {message}
        </h3>
        
        {/* Sub-mensagem */}
        <p className="text-gray-600 mb-6">
          {subMessage}
        </p>

        {/* Indicador de progresso animado */}
        <div className="flex items-center justify-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Ícone de IA no canto */}
        <div className="absolute top-4 right-4">
          <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />
        </div>
      </div>
    </div>
  );
}
