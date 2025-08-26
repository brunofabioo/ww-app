import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

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

  useEffect(() => {
    async function fetchData() {
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

    fetchData()
  }, dependencies)

  return { data, loading, error, refetch: () => fetchData() }
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