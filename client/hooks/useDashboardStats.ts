import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useSupabase";

export interface DashboardStats {
  totalAtividades: number;
  totalTurmas: number;
  totalQuestoes: number;
  atividadesFavoritas: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAtividades: 0,
    totalTurmas: 0,
    totalQuestoes: 0,
    atividadesFavoritas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session) {
        // Se não estiver logado, retorna estatísticas zeradas
        setStats({
          totalAtividades: 0,
          totalTurmas: 0,
          totalQuestoes: 0,
          atividadesFavoritas: 0,
        });
        return;
      }

      // Buscar total de atividades do usuário
      const { count: atividadesCount, error: atividadesError } = await supabase
        .from("atividades")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      if (atividadesError) {
        console.warn("Erro ao buscar atividades:", atividadesError);
      }

      // Buscar total de turmas do usuário
      const { count: turmasCount, error: turmasError } = await supabase
        .from("turmas")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      if (turmasError) {
        console.warn("Erro ao buscar turmas:", turmasError);
      }

      // Buscar atividades favoritas do usuário
      const { count: favoritasCount, error: favoritasError } = await supabase
        .from("atividades")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("is_favorite", true);

      if (favoritasError) {
        console.warn("Erro ao buscar favoritas:", favoritasError);
      }

      // Buscar total de questões (soma de questions_count de todas as atividades)
      const { data: atividadesData, error: questoesError } = await supabase
        .from("atividades")
        .select("questions_count")
        .eq("user_id", session.user.id);

      let totalQuestoes = 0;
      if (!questoesError && atividadesData) {
        totalQuestoes = atividadesData.reduce(
          (sum, atividade) => sum + (atividade.questions_count || 0),
          0
        );
      } else if (questoesError) {
        console.warn("Erro ao buscar questões:", questoesError);
      }

      setStats({
        totalAtividades: atividadesCount || 0,
        totalTurmas: turmasCount || 0,
        totalQuestoes,
        atividadesFavoritas: favoritasCount || 0,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar estatísticas";
      setError(errorMessage);
      console.error("Erro ao buscar estatísticas do dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [session]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}