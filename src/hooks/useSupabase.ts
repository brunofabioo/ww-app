import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// Hook para gerenciar autenticação
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    signOut: () => supabase.auth.signOut(),
  };
}

// Hook genérico para operações de banco de dados
export function useSupabaseQuery<T>(
  table: string,
  query?: string,
  dependencies: any[] = [],
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let queryBuilder = supabase.from(table).select("*");

      if (query) {
        // Adicione filtros personalizados aqui se necessário
      }

      const { data: result, error: queryError } = await queryBuilder;

      if (queryError) {
        throw queryError;
      }

      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

// Hook para inserir dados
export function useSupabaseInsert<T>(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insert = async (data: Partial<T>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: insertError } = await supabase
        .from(table)
        .insert(data)
        .select();

      if (insertError) {
        throw insertError;
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao inserir dados";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { insert, loading, error };
}

// Hook para atualizar dados
export function useSupabaseUpdate<T>(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: string | number, data: Partial<T>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(data)
        .eq("id", id)
        .select();

      if (updateError) {
        throw updateError;
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar dados";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

// Hook para deletar dados
export function useSupabaseDelete(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRecord = async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao deletar dados";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { deleteRecord, loading, error };
}

// ===== HOOKS ESPECÍFICOS DO WORDWISE APP =====

// Hook para gerenciar atividades
export function useAtividades() {
  const [atividades, setAtividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAtividades = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("atividades")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setAtividades(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar atividades";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createAtividade = async (atividadeData: any) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Inserindo atividade no Supabase:", atividadeData);
      const { data: sess } = await supabase.auth.getSession();
      const payload = {
        ...atividadeData,
        user_id: atividadeData?.user_id ?? sess.session?.user?.id ?? null,
      };
      const { data, error: createError } = await supabase
        .from("atividades")
        .insert(payload)
        .select();

      if (createError) {
        console.error("Erro do Supabase ao criar atividade:", createError);
        throw createError;
      }

      console.log("Atividade criada com sucesso:", data);

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("Erro ao criar atividade: nenhum dado retornado");
      }

      await fetchAtividades(); // Recarregar lista
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar atividade";
      console.error("Erro na função createAtividade:", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateAtividade = async (id: string, atividadeData: any) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("atividades")
        .update(atividadeData)
        .eq("id", id)
        .select();

      if (updateError) {
        throw updateError;
      }

      await fetchAtividades(); // Recarregar lista
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar atividade";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteAtividade = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from("atividades")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      await fetchAtividades(); // Recarregar lista
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao deletar atividade";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAtividadeById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("atividades")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar atividade";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    atividades,
    loading,
    error,
    fetchAtividades,
    createAtividade,
    updateAtividade,
    deleteAtividade,
    getAtividadeById,
  };
}

// Hook useQuestoes removido - tabela questoes não existe mais no novo schema

// Hook para gerenciar materiais
export function useMateriais() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMateriais = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("materiais")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setMateriais(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar materiais";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createMaterial = async (materialData: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from("materiais")
        .insert(materialData)
        .select();

      if (createError) {
        throw createError;
      }

      await fetchMateriais(); // Recarregar lista
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar material";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateMaterial = async (id: string, materialData: Partial<Omit<Material, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("materiais")
        .update(materialData)
        .eq("id", id)
        .select();

      if (updateError) {
        throw updateError;
      }

      await fetchMateriais(); // Recarregar lista
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar material";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Primeiro, buscar o material para obter o file_url
      const { data: material, error: fetchError } = await supabase
        .from("materiais")
        .select("file_url")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Extrair o nome do arquivo do file_url do Supabase Storage
      if (material?.file_url) {
        try {
          // O file_url do Supabase tem formato: https://projeto.supabase.co/storage/v1/object/public/bucket/filename
          const url = new URL(material.file_url);
          const pathParts = url.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1]; // Último segmento é o nome do arquivo
          
          // Deletar arquivo do storage
          const { error: storageError } = await supabase.storage
            .from('materiais')
            .remove([fileName]);
          
          if (storageError) {
            console.warn('Erro ao deletar arquivo do storage:', storageError);
            // Continua mesmo se houver erro no storage, para não bloquear a exclusão do registro
          }
        } catch (storageErr) {
          console.warn('Erro ao processar exclusão do arquivo:', storageErr);
          // Continua mesmo se houver erro, para não bloquear a exclusão do registro
        }
      }

      // Deletar registro do banco de dados
      const { error: deleteError } = await supabase
        .from("materiais")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      await fetchMateriais(); // Recarregar lista
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao deletar material";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    materiais,
    loading,
    error,
    fetchMateriais,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  };
}

// Hook para gerenciar turmas
export function useTurmas() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTurmas = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("turmas")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTurmas(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar turmas";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createTurma = async (turmaData: any) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from("turmas")
        .insert(turmaData)
        .select();

      if (createError) {
        throw createError;
      }

      await fetchTurmas(); // Recarregar lista
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar turma";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTurma = async (id: string, turmaData: any) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("turmas")
        .update(turmaData)
        .eq("id", id)
        .select();

      if (updateError) {
        throw updateError;
      }

      await fetchTurmas(); // Recarregar lista
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar turma";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteTurma = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from("turmas")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      await fetchTurmas(); // Recarregar lista
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao deletar turma";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    turmas,
    loading,
    error,
    fetchTurmas,
    createTurma,
    updateTurma,
    deleteTurma,
  };
}

// Hook composto para criar uma prova completa
export function useProva() {
  const { createAtividade } = useAtividades();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProva = async (atividadeData: any) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Criando atividade com dados:", atividadeData);

      const atividade = await createAtividade(atividadeData);
      console.log("Resposta da criação da atividade:", atividade);

      if (!atividade || !Array.isArray(atividade) || atividade.length === 0) {
        throw new Error(
          "Erro ao criar atividade: resposta inválida do servidor",
        );
      }

      return atividade[0];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar prova";
      console.error("Erro na função createProva:", err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createProva,
    loading,
    error,
  };
}
