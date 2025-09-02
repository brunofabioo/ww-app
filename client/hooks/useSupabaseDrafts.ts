import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useSupabase";

interface SupabaseDraft {
  id: string;
  user_id: string | null;
  type: string;
  data: any;
  step: number | null;
  created_at: string;
  updated_at: string;
}

interface UseSupabaseDraftsReturn {
  drafts: SupabaseDraft[];
  loading: boolean;
  error: string | null;
  fetchDrafts: () => Promise<void>;
  createDraft: (draftData: Omit<SupabaseDraft, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<SupabaseDraft | null>;
  updateDraft: (draftId: string, updates: Partial<Pick<SupabaseDraft, 'data' | 'step' | 'type'>>) => Promise<SupabaseDraft | null>;
  deleteDraft: (draftId: string) => Promise<boolean>;
  getDraftsByType: (type: string) => SupabaseDraft[];
  refreshData: () => Promise<void>;
}

export function useSupabaseDrafts(): UseSupabaseDraftsReturn {
  const [drafts, setDrafts] = useState<SupabaseDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  // Buscar todos os drafts do usuário
  const fetchDrafts = useCallback(async () => {
    if (!session?.user?.id) {
      setError("Usuário não autenticado");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("drafts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setDrafts(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar rascunhos";
      setError(errorMessage);
      console.error("Erro ao buscar rascunhos:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Criar novo draft
  const createDraft = useCallback(async (
    draftData: Omit<SupabaseDraft, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ): Promise<SupabaseDraft | null> => {
    if (!session?.user?.id) {
      setError("Usuário não autenticado");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: insertError } = await supabase
        .from("drafts")
        .insert({
          ...draftData,
          user_id: session.user.id
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Atualizar lista local
      if (data) {
        setDrafts(prev => [data, ...prev]);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar rascunho";
      setError(errorMessage);
      console.error("Erro ao criar rascunho:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Atualizar draft existente
  const updateDraft = useCallback(async (
    draftId: string,
    updates: Partial<Pick<SupabaseDraft, 'data' | 'step' | 'type'>>
  ): Promise<SupabaseDraft | null> => {
    if (!session?.user?.id) {
      setError("Usuário não autenticado");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("drafts")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", draftId)
        .eq("user_id", session.user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Atualizar lista local
      if (data) {
        setDrafts(prev => prev.map(draft => 
          draft.id === draftId ? data : draft
        ));
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar rascunho";
      setError(errorMessage);
      console.error("Erro ao atualizar rascunho:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Deletar draft
  const deleteDraft = useCallback(async (draftId: string): Promise<boolean> => {
    if (!session?.user?.id) {
      setError("Usuário não autenticado");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from("drafts")
        .delete()
        .eq("id", draftId)
        .eq("user_id", session.user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Remover da lista local
      setDrafts(prev => prev.filter(draft => draft.id !== draftId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao deletar rascunho";
      setError(errorMessage);
      console.error("Erro ao deletar rascunho:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Filtrar drafts por tipo
  const getDraftsByType = useCallback((type: string): SupabaseDraft[] => {
    return drafts.filter(draft => draft.type === type);
  }, [drafts]);

  // Recarregar dados
  const refreshData = useCallback(async () => {
    await fetchDrafts();
  }, [fetchDrafts]);

  // Carregar dados automaticamente quando o usuário estiver autenticado
  useEffect(() => {
    if (session?.user?.id) {
      fetchDrafts();
    }
  }, [session?.user?.id, fetchDrafts]);

  return {
    drafts,
    loading,
    error,
    fetchDrafts,
    createDraft,
    updateDraft,
    deleteDraft,
    getDraftsByType,
    refreshData
  };
}