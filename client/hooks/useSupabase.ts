import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

// Util helpers
const formatSupabaseError = (err: any): string => {
  try {
    if (!err) return "Erro desconhecido";
    if (typeof err === "string") return err;
    const e = err as any;
    const parts: string[] = [];
    if (e.message) parts.push(e.message);
    if (e.code) parts.push(`code: ${e.code}`);
    if (e.details) parts.push(e.details);
    if (e.hint) parts.push(e.hint);
    return parts.join(" ").trim() || JSON.stringify(e);
  } catch {
    return "Erro desconhecido";
  }
};

// Garante que metadata.full_name exista e que o perfil esteja criado em public.users
const ensureProfileForAuthUser = async (authUser: any) => {
  if (!authUser?.id) return;
  const uid = authUser.id as string;
  let meta: any = (authUser as any).user_metadata ?? {};
  const safeEmail = authUser.email ?? `${uid}@local`;
  const safeName = (meta.full_name ||
    meta.name ||
    (authUser.email
      ? authUser.email.split("@")[0]
      : `Usuario_${uid.slice(0, 8)}`)) as string;

  if (!meta.full_name && safeName) {
    const { error: updErr } = await supabase.auth.updateUser({
      data: { full_name: safeName },
    });
    if (updErr)
      console.warn(
        "ensureProfile updateUser metadata error:",
        formatSupabaseError(updErr),
      );
  }

  const { error: upsertErr } = await supabase
    .from("users")
    .upsert(
      {
        id: uid,
        email: safeEmail,
        full_name: safeName,
        avatar_url: meta.avatar_url ?? null,
        role: meta.role ?? "student",
      },
      { onConflict: "id" },
    );
  if (upsertErr)
    console.warn(
      "ensureProfile users upsert error:",
      formatSupabaseError(upsertErr),
    );
};

const ensureAuth = async (): Promise<Session | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const sess = session ?? null;

    if (sess?.user?.id) {
      const uid = sess.user.id;
      try {
        let meta: any = (sess.user as any)?.user_metadata ?? {};
        const safeEmail = sess.user.email ?? `${uid}@local`;
        let safeName = (meta.full_name ||
          meta.name ||
          (sess.user.email ? sess.user.email.split("@")[0] : null) ||
          `Usuario_${uid.slice(0, 8)}`) as string;

        // Garante que o auth.user tenha full_name no metadata (corrige triggers que espelham para public.users)
        if (!meta.full_name && safeName) {
          const { data: upd, error: updErr } = await supabase.auth.updateUser({
            data: { full_name: safeName },
          });
          if (updErr) {
            console.warn(
              "ensureAuth updateUser metadata error:",
              formatSupabaseError(updErr),
            );
          } else {
            meta = (upd?.user as any)?.user_metadata ?? meta;
          }
        }

        const profile = {
          id: uid,
          email: safeEmail,
          full_name: safeName,
          avatar_url: meta.avatar_url ?? null,
          role: meta.role ?? "student",
        } as const;

        const { error: upsertErr } = await supabase
          .from("users")
          .upsert(profile, { onConflict: "id" });
        if (upsertErr) {
          console.warn(
            "ensureAuth upsert error:",
            formatSupabaseError(upsertErr),
          );
        }
      } catch (e) {
        console.warn(
          "ensureAuth profile upsert error:",
          formatSupabaseError(e),
        );
      }
    }

    return sess;
  } catch (e) {
    console.warn("ensureAuth error:", formatSupabaseError(e));
    return null;
  }
};

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
      try {
        if (session?.user) ensureProfileForAuthUser(session.user);
      } catch {}
    });

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      try {
        if (session?.user) ensureProfileForAuthUser(session.user);
      } catch {}
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

// Hook para gerenciar atividades/provas
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

      console.log(
        "Inserindo atividade no Supabase (dados originais):",
        atividadeData,
      );
      const session = await ensureAuth();

      // Garante que exista linha em public.users para o usuário atual
      try {
        const { data: u } = await supabase.auth.getUser();
        const authUser = u?.user;
        if (authUser) {
          const meta: any = (authUser as any).user_metadata || {};
          const safeName =
            meta.full_name ||
            meta.name ||
            (authUser.email
              ? authUser.email.split("@")[0]
              : `Usuario_${authUser.id.slice(0, 8)}`);
          await supabase.from("users").upsert(
            {
              id: authUser.id,
              email: authUser.email ?? null,
              full_name: safeName,
              avatar_url: meta.avatar_url ?? null,
              role: meta.role ?? "student",
            },
            { onConflict: "id" },
          );
        }
      } catch (e) {
        console.warn(
          "Não foi possível garantir perfil em users (possível RLS):",
          formatSupabaseError(e),
        );
      }

      const isUUID = (v: any) =>
        typeof v === "string" && /^[0-9a-fA-F-]{36}$/.test(v);

      // Mapear para o esquema REAL do banco (create-tables.sql)
      const payloadDB = {
        titulo: atividadeData?.title ?? atividadeData?.titulo ?? "Atividade",
        descricao: atividadeData?.description ?? atividadeData?.topics ?? null,
        instrucoes: atividadeData?.instructions_text ?? null,
        turma_id: isUUID(atividadeData?.turma_id)
          ? atividadeData.turma_id
          : null,
        professor_id: session?.user?.id ?? null,
        tipo: (atividadeData?.tipo ?? "prova") as
          | "trabalho"
          | "prova"
          | "questionario"
          | "discussao",
        data_inicio: atividadeData?.data_inicio ?? new Date().toISOString(),
        data_fim:
          atividadeData?.data_fim ??
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        valor_maximo: Number(atividadeData?.valor_maximo ?? 10),
        status: (atividadeData?.status ?? "ativa") as
          | "ativa"
          | "pausada"
          | "concluida",
      };

      console.log("Payload mapeado para atividades:", payloadDB);

      const { data, error: createError } = await supabase
        .from("atividades")
        .insert(payloadDB)
        .select();
      if (createError) {
        const formatted = formatSupabaseError(createError);
        console.error(
          "Erro do Supabase ao criar atividade:",
          createError,
          formatted,
        );
        throw new Error(formatted);
      }

      console.log("Atividade criada com sucesso:", data);

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("Erro ao criar atividade: nenhum dado retornado");
      }

      await fetchAtividades(); // Recarregar lista
      return data;
    } catch (err) {
      const errorMessage = formatSupabaseError(err);
      console.error("Erro na função createAtividade:", err, errorMessage);
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

// Hook para gerenciar questões
export function useQuestoes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByAtividade = async (atividadeId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("questoes")
        .select("*")
        .eq("atividade_id", atividadeId)
        .order("ordem", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      return data || [];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar questões";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createQuestao = async (questaoData: any) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from("questoes")
        .insert(questaoData)
        .select();

      if (createError) {
        throw createError;
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar questão";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createMultipleQuestoes = async (questoesData: any[]) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Inserindo questões no Supabase:", questoesData);

      await ensureAuth();
      const { data, error: createError } = await supabase
        .from("questoes")
        .insert(questoesData)
        .select();
      if (createError) {
        console.error(
          "Erro do Supabase ao criar questões:",
          createError,
          formatSupabaseError(createError),
        );
        throw new Error(formatSupabaseError(createError));
      }

      console.log("Questões criadas com sucesso:", data);

      if (!data || !Array.isArray(data)) {
        throw new Error("Erro ao criar questões: nenhum dado retornado");
      }

      return data;
    } catch (err) {
      const errorMessage = formatSupabaseError(err);
      console.error(
        "Erro na função createMultipleQuestoes:",
        err,
        errorMessage,
      );
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateQuestao = async (id: string, questaoData: any) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from("questoes")
        .update(questaoData)
        .eq("id", id)
        .select();

      if (updateError) {
        throw updateError;
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar questão";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestao = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from("questoes")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao deletar questão";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchByAtividade,
    createQuestao,
    createMultipleQuestoes,
    updateQuestao,
    deleteQuestao,
  };
}

// Hook para gerenciar materiais
export function useMateriais() {
  const [materiais, setMateriais] = useState<any[]>([]);
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

  const createMaterial = async (materialData: any) => {
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

  const updateMaterial = async (id: string, materialData: any) => {
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

  const createProva = async (atividadeData: any, questoesData: any[]) => {
    try {
      setLoading(true);
      setError(null);

      // Incluir perguntas no content_json, se fornecidas
      const payload = {
        ...atividadeData,
        content_json: atividadeData?.content_json ?? {
          questions: questoesData || [],
        },
      };

      console.log("Criando atividade com dados:", payload);

      const atividade = await createAtividade(payload);
      console.log("Resposta da criação da atividade:", atividade);

      if (!atividade || !Array.isArray(atividade) || atividade.length === 0) {
        throw new Error(
          "Erro ao criar atividade: resposta inválida do servidor",
        );
      }

      return {
        atividade: atividade[0],
        questoes: questoesData || [],
      };
    } catch (err) {
      const errorMessage = formatSupabaseError(err);
      console.error("Erro na função createProva:", err, errorMessage);
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
