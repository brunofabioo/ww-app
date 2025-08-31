import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Util helpers
const formatSupabaseError = (err: any): string => {
  try {
    if (!err) return 'Erro desconhecido';
    if (typeof err === 'string') return err;
    const e = err as any;
    const parts: string[] = [];
    if (e.message) parts.push(e.message);
    if (e.code) parts.push(`code: ${e.code}`);
    if (e.details) parts.push(e.details);
    if (e.hint) parts.push(e.hint);
    return parts.join(' ').trim() || JSON.stringify(e);
  } catch {
    return 'Erro desconhecido';
  }
};

const ensureAuth = async (): Promise<Session | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    let sess = session;

    if (!sess) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn('Anonymous sign-in failed:', formatSupabaseError(error));
        return null;
      }
      sess = data.session ?? null;
    }

    if (sess?.user?.id) {
      const uid = sess.user.id;
      try {
        const { data: rows, error: selErr } = await supabase
          .from('users')
          .select('id')
          .eq('id', uid)
          .limit(1);
        if (!selErr && (!rows || rows.length === 0)) {
          await supabase.from('users').insert({
            id: uid,
            email: sess.user.email || null,
            full_name: (sess.user.user_metadata as any)?.name || null,
            avatar_url: (sess.user.user_metadata as any)?.avatar_url || null
          });
        }
      } catch (e) {
        console.warn('ensureAuth profile upsert error:', formatSupabaseError(e));
      }
    }

    return sess;
  } catch (e) {
    console.warn('ensureAuth error:', formatSupabaseError(e));
    return null;
  }
};

// Hook para gerenciar autenticação
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    session,
    loading,
    signOut: () => supabase.auth.signOut(),
  }
}

// Hook genérico para operações de banco de dados
export function useSupabaseQuery<T>(
  table: string,
  query?: string,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let queryBuilder = supabase.from(table).select('*')
      
      if (query) {
        // Adicione filtros personalizados aqui se necessário
      }
      
      const { data: result, error: queryError } = await queryBuilder
      
      if (queryError) {
        throw queryError
      }
      
      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  return { data, loading, error, refetch: fetchData }
}

// Hook para inserir dados
export function useSupabaseInsert<T>(table: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const insert = async (data: Partial<T>) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: result, error: insertError } = await supabase
        .from(table)
        .insert(data)
        .select()
      
      if (insertError) {
        throw insertError
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inserir dados'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { insert, loading, error }
}

// Hook para atualizar dados
export function useSupabaseUpdate<T>(table: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = async (id: string | number, data: Partial<T>) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
      
      if (updateError) {
        throw updateError
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar dados'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { update, loading, error }
}

// Hook para deletar dados
export function useSupabaseDelete(table: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteRecord = async (id: string | number) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (deleteError) {
        throw deleteError
      }
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar dados'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { deleteRecord, loading, error }
}

// ===== HOOKS ESPECÍFICOS DO WORDWISE APP =====

// Hook para gerenciar atividades/provas
export function useAtividades() {
  const [atividades, setAtividades] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAtividades = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('atividades')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setAtividades(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar atividades'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createAtividade = async (atividadeData: any) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Inserindo atividade no Supabase:', atividadeData)
      const session = await ensureAuth()
      const payload = {
        ...atividadeData,
        user_id: atividadeData?.user_id ?? session?.user?.id ?? null
      }
      const { data, error: createError } = await supabase
        .from('atividades')
        .insert(payload)
        .select()
      if (createError) {
        console.error('Erro do Supabase ao criar atividade:', createError, formatSupabaseError(createError))
        throw new Error(formatSupabaseError(createError))
      }
      
      console.log('Atividade criada com sucesso:', data)
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Erro ao criar atividade: nenhum dado retornado')
      }
      
      await fetchAtividades() // Recarregar lista
      return data
    } catch (err) {
      const errorMessage = formatSupabaseError(err)
      console.error('Erro na função createAtividade:', err, errorMessage)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateAtividade = async (id: string, atividadeData: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: updateError } = await supabase
        .from('atividades')
        .update(atividadeData)
        .eq('id', id)
        .select()
      
      if (updateError) {
        throw updateError
      }
      
      await fetchAtividades() // Recarregar lista
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar atividade'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteAtividade = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('atividades')
        .delete()
        .eq('id', id)
      
      if (deleteError) {
        throw deleteError
      }
      
      await fetchAtividades() // Recarregar lista
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar atividade'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getAtividadeById = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('atividades')
        .select('*')
        .eq('id', id)
        .single()
      
      if (fetchError) {
        throw fetchError
      }
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar atividade'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    atividades,
    loading,
    error,
    fetchAtividades,
    createAtividade,
    updateAtividade,
    deleteAtividade,
    getAtividadeById
  }
}

// Hook para gerenciar questões
export function useQuestoes() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchByAtividade = async (atividadeId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('questoes')
        .select('*')
        .eq('atividade_id', atividadeId)
        .order('ordem', { ascending: true })
      
      if (fetchError) {
        throw fetchError
      }
      
      return data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar questões'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createQuestao = async (questaoData: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: createError } = await supabase
        .from('questoes')
        .insert(questaoData)
        .select()
      
      if (createError) {
        throw createError
      }
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar questão'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createMultipleQuestoes = async (questoesData: any[]) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Inserindo questões no Supabase:', questoesData)
      
      await ensureAuth()
      const { data, error: createError } = await supabase
        .from('questoes')
        .insert(questoesData)
        .select()
      if (createError) {
        console.error('Erro do Supabase ao criar questões:', createError, formatSupabaseError(createError))
        throw new Error(formatSupabaseError(createError))
      }
      
      console.log('Questões criadas com sucesso:', data)
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Erro ao criar questões: nenhum dado retornado')
      }
      
      return data
    } catch (err) {
      const errorMessage = formatSupabaseError(err)
      console.error('Erro na função createMultipleQuestoes:', err, errorMessage)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateQuestao = async (id: string, questaoData: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: updateError } = await supabase
        .from('questoes')
        .update(questaoData)
        .eq('id', id)
        .select()
      
      if (updateError) {
        throw updateError
      }
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar questão'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteQuestao = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('questoes')
        .delete()
        .eq('id', id)
      
      if (deleteError) {
        throw deleteError
      }
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar questão'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    fetchByAtividade,
    createQuestao,
    createMultipleQuestoes,
    updateQuestao,
    deleteQuestao
  }
}

// Hook para gerenciar materiais
export function useMateriais() {
  const [materiais, setMateriais] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMateriais = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('materiais')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) {
        throw fetchError
      }
      
      setMateriais(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar materiais'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createMaterial = async (materialData: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: createError } = await supabase
        .from('materiais')
        .insert(materialData)
        .select()
      
      if (createError) {
        throw createError
      }
      
      await fetchMateriais() // Recarregar lista
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar material'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateMaterial = async (id: string, materialData: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: updateError } = await supabase
        .from('materiais')
        .update(materialData)
        .eq('id', id)
        .select()
      
      if (updateError) {
        throw updateError
      }
      
      await fetchMateriais() // Recarregar lista
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar material'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteMaterial = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('materiais')
        .delete()
        .eq('id', id)
      
      if (deleteError) {
        throw deleteError
      }
      
      await fetchMateriais() // Recarregar lista
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar material'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    materiais,
    loading,
    error,
    fetchMateriais,
    createMaterial,
    updateMaterial,
    deleteMaterial
  }
}

// Hook para gerenciar turmas
export function useTurmas() {
  const [turmas, setTurmas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTurmas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('turmas')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) {
        throw fetchError
      }
      
      setTurmas(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar turmas'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createTurma = async (turmaData: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: createError } = await supabase
        .from('turmas')
        .insert(turmaData)
        .select()
      
      if (createError) {
        throw createError
      }
      
      await fetchTurmas() // Recarregar lista
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar turma'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateTurma = async (id: string, turmaData: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: updateError } = await supabase
        .from('turmas')
        .update(turmaData)
        .eq('id', id)
        .select()
      
      if (updateError) {
        throw updateError
      }
      
      await fetchTurmas() // Recarregar lista
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar turma'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteTurma = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('turmas')
        .delete()
        .eq('id', id)
      
      if (deleteError) {
        throw deleteError
      }
      
      await fetchTurmas() // Recarregar lista
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar turma'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    turmas,
    loading,
    error,
    fetchTurmas,
    createTurma,
    updateTurma,
    deleteTurma
  }
}

// Hook composto para criar uma prova completa
export function useProva() {
  const { createAtividade } = useAtividades()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProva = async (atividadeData: any, questoesData: any[]) => {
    try {
      setLoading(true)
      setError(null)

      // Incluir perguntas no content_json, se fornecidas
      const payload = {
        ...atividadeData,
        content_json: atividadeData?.content_json ?? { questions: questoesData || [] }
      }

      console.log('Criando atividade com dados:', payload)

      const atividade = await createAtividade(payload)
      console.log('Resposta da criação da atividade:', atividade)

      if (!atividade || !Array.isArray(atividade) || atividade.length === 0) {
        throw new Error('Erro ao criar atividade: resposta inválida do servidor')
      }

      return {
        atividade: atividade[0],
        questoes: questoesData || []
      }
    } catch (err) {
      const errorMessage = formatSupabaseError(err)
      console.error('Erro na função createProva:', err, errorMessage)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    createProva,
    loading,
    error
  }
}
