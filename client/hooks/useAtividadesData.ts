import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useSupabase";

interface Atividade {
  id: string;
  title: string;
  description?: string | null;
  language: string;
  difficulty: string;
  topics: string;
  questions_count: number;
  generate_multiple_versions?: boolean | null;
  versions_count?: number | null;
  question_types: any;
  turma_id?: string | null;
  material_id?: string | null;
  user_id?: string | null;
  content_html?: string | null;
  content_json?: any | null;
  instructions_text?: string | null;
  instructions_json: any;
  is_favorite?: boolean | null;
  status: string;
  version_number?: number | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  archived_at?: string | null;

}

interface UseAtividadesDataReturn {
  atividades: Atividade[];
  loading: boolean;
  error: string | null;
  fetchAtividades: () => Promise<void>;
  refreshData: () => Promise<void>;
  deleteAtividade: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

// Cache simples para evitar múltiplas chamadas
let cachedData: Atividade[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 segundos

// Debounce para evitar múltiplas chamadas simultâneas
let fetchPromise: Promise<Atividade[]> | null = null;

export function useAtividadesData(): UseAtividadesDataReturn {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchAtividadesData = useCallback(async (): Promise<Atividade[]> => {
    // Se já existe uma requisição em andamento, retorna a mesma promise
    if (fetchPromise) {
      return fetchPromise;
    }

    // Verifica cache
    const now = Date.now();
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      return cachedData;
    }

    // Verifica se há sessão válida
    if (!session?.user?.id) {
      throw new Error('Usuário não autenticado');
    }

    fetchPromise = (async () => {
      try {
        // Busca dados diretamente sem chamar ensureAuth
        const { data, error: fetchError } = await supabase
          .from('atividades')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        // Processa os dados
        const atividadesProcessadas = (data || []).map((atividade: any) => ({
          ...atividade,
          questions_count: atividade.questions_count || 0,
        }));
        
        // Atualiza cache
        cachedData = atividadesProcessadas;
        lastFetchTime = Date.now();
        
        return atividadesProcessadas;
      } finally {
        // Limpa a promise para permitir novas chamadas
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  }, [session?.user?.id]);

  const fetchAtividades = useCallback(async () => {
    if (!session?.user?.id) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchAtividadesData();
      setAtividades(data);
    } catch (err: any) {
      console.error('Erro ao buscar atividades:', err);
      setError(err.message || 'Erro ao carregar atividades');
      setAtividades([]);
    } finally {
      setLoading(false);
    }
  }, [fetchAtividadesData, session?.user?.id]);

  const refreshData = useCallback(async () => {
    // Limpa cache para forçar nova busca
    cachedData = null;
    lastFetchTime = 0;
    await fetchAtividades();
  }, [fetchAtividades]);

  const deleteAtividade = useCallback(async (id: string) => {
    if (!session?.user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const { error: deleteError } = await supabase
        .from('atividades')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Atualiza cache local removendo o item
      if (cachedData) {
        cachedData = cachedData.filter(atividade => atividade.id !== id);
      }
      
      // Atualiza estado local
      setAtividades(prev => prev.filter(atividade => atividade.id !== id));
    } catch (err: any) {
      console.error('Erro ao deletar atividade:', err);
      throw err;
    }
  }, [session?.user?.id]);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!session?.user?.id) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Encontra a atividade atual para obter o status de favorito
      const atividadeAtual = atividades.find(atividade => atividade.id === id);
      if (!atividadeAtual) {
        throw new Error('Atividade não encontrada');
      }

      const novoStatusFavorito = !atividadeAtual.is_favorite;

      // Atualiza no banco de dados
      const { error: updateError } = await supabase
        .from('atividades')
        .update({ is_favorite: novoStatusFavorito })
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      // Atualiza cache local
      if (cachedData) {
        cachedData = cachedData.map(atividade => 
          atividade.id === id 
            ? { ...atividade, is_favorite: novoStatusFavorito }
            : atividade
        );
      }
      
      // Atualiza estado local
      setAtividades(prev => prev.map(atividade => 
        atividade.id === id 
          ? { ...atividade, is_favorite: novoStatusFavorito }
          : atividade
      ));
    } catch (err: any) {
      console.error('Erro ao alterar favorito:', err);
      throw err;
    }
  }, [session?.user?.id, atividades]);

  // Carrega dados automaticamente quando há sessão
  useEffect(() => {
    if (session?.user?.id) {
      fetchAtividades();
    } else {
      // Limpa dados quando não há sessão
      setAtividades([]);
      setError(null);
      setLoading(false);
    }
  }, [session?.user?.id]); // Remove fetchAtividades das dependências para evitar loop infinito

  return {
    atividades,
    loading,
    error,
    fetchAtividades,
    refreshData,
    deleteAtividade,
    toggleFavorite,
  };
}

// Função utilitária para limpar cache (útil para testes)
export function clearAtividadesCache() {
  cachedData = null;
  lastFetchTime = 0;
  fetchPromise = null;
}