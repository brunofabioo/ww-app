import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useSupabase";

interface AtividadeVersion {
  id: string;
  atividade_id: string | null;
  version_number: number;
  content_html: string;
  content_json: any | null;
  created_at: string;
  created_by: string | null;
}

interface UseAtividadesVersionsReturn {
  versions: AtividadeVersion[];
  loading: boolean;
  error: string | null;
  fetchVersionsByAtividade: (atividadeId: string) => Promise<void>;
  createVersion: (versionData: Omit<AtividadeVersion, 'id' | 'created_at'>) => Promise<AtividadeVersion | null>;
  deleteVersion: (versionId: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export function useAtividadesVersions(): UseAtividadesVersionsReturn {
  const [versions, setVersions] = useState<AtividadeVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  // Buscar versões de uma atividade específica
  const fetchVersionsByAtividade = useCallback(async (atividadeId: string) => {
    if (!session?.user?.id) {
      setError("Usuário não autenticado");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("atividades_versions")
        .select("*")
        .eq("atividade_id", atividadeId)
        .order("version_number", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setVersions(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar versões";
      setError(errorMessage);
      console.error("Erro ao buscar versões:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Criar nova versão
  const createVersion = useCallback(async (
    versionData: Omit<AtividadeVersion, 'id' | 'created_at'>
  ): Promise<AtividadeVersion | null> => {
    if (!session?.user?.id) {
      setError("Usuário não autenticado");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: insertError } = await supabase
        .from("atividades_versions")
        .insert({
          ...versionData,
          created_by: session.user.id
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Atualizar lista local
      if (data) {
        setVersions(prev => [data, ...prev]);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar versão";
      setError(errorMessage);
      console.error("Erro ao criar versão:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Deletar versão
  const deleteVersion = useCallback(async (versionId: string): Promise<boolean> => {
    if (!session?.user?.id) {
      setError("Usuário não autenticado");
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from("atividades_versions")
        .delete()
        .eq("id", versionId)
        .eq("created_by", session.user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Remover da lista local
      setVersions(prev => prev.filter(version => version.id !== versionId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao deletar versão";
      setError(errorMessage);
      console.error("Erro ao deletar versão:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Recarregar dados
  const refreshData = useCallback(async () => {
    // Esta função pode ser chamada para recarregar as versões da atividade atual
    // Mas precisa do ID da atividade, então será implementada quando necessário
  }, []);

  return {
    versions,
    loading,
    error,
    fetchVersionsByAtividade,
    createVersion,
    deleteVersion,
    refreshData
  };
}