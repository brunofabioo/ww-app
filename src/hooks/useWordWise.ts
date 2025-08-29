import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { 
  Atividade, 
  Questao, 
  Material, 
  Turma, 
  User,
  Database 
} from '../lib/supabase'

// Hook para gerenciar atividades (provas, trabalhos, etc.)
export function useAtividades() {
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar todas as atividades
  const fetchAtividades = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('atividades')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setAtividades(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar atividades')
    } finally {
      setLoading(false)
    }
  }

  // Criar nova atividade
  const createAtividade = async (atividadeData: Omit<Atividade, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      
      const { data, error: insertError } = await supabase
        .from('atividades')
        .insert(atividadeData)
        .select()
        .single()
      
      if (insertError) throw insertError
      
      // Atualizar lista local
      setAtividades(prev => [data, ...prev])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar atividade'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Atualizar atividade
  const updateAtividade = async (id: string, updates: Partial<Atividade>) => {
    try {
      setError(null)
      
      const { data, error: updateError } = await supabase
        .from('atividades')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // Atualizar lista local
      setAtividades(prev => prev.map(item => item.id === id ? data : item))
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar atividade'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Deletar atividade
  const deleteAtividade = async (id: string) => {
    try {
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('atividades')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // Remover da lista local
      setAtividades(prev => prev.filter(item => item.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar atividade'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Buscar atividade por ID
  const getAtividadeById = async (id: string) => {
    try {
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('atividades')
        .select('*')
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar atividade'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchAtividades()
  }, [])

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
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar questões de uma atividade
  const fetchQuestoesByAtividade = async (atividadeId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('questoes')
        .select('*')
        .eq('atividade_id', atividadeId)
        .order('ordem', { ascending: true })
      
      if (fetchError) throw fetchError
      
      setQuestoes(data || [])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar questões')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Criar questão
  const createQuestao = async (questaoData: Omit<Questao, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      
      const { data, error: insertError } = await supabase
        .from('questoes')
        .insert(questaoData)
        .select()
        .single()
      
      if (insertError) throw insertError
      
      // Atualizar lista local
      setQuestoes(prev => [...prev, data])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar questão'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Criar múltiplas questões de uma vez
  const createQuestoes = async (questoesData: Omit<Questao, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      setError(null)
      
      const { data, error: insertError } = await supabase
        .from('questoes')
        .insert(questoesData)
        .select()
      
      if (insertError) throw insertError
      
      // Atualizar lista local
      setQuestoes(prev => [...prev, ...(data || [])])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar questões'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Atualizar questão
  const updateQuestao = async (id: string, updates: Partial<Questao>) => {
    try {
      setError(null)
      
      const { data, error: updateError } = await supabase
        .from('questoes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // Atualizar lista local
      setQuestoes(prev => prev.map(item => item.id === id ? data : item))
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar questão'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Deletar questão
  const deleteQuestao = async (id: string) => {
    try {
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('questoes')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // Remover da lista local
      setQuestoes(prev => prev.filter(item => item.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar questão'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    questoes,
    loading,
    error,
    fetchQuestoesByAtividade,
    createQuestao,
    createQuestoes,
    updateQuestao,
    deleteQuestao
  }
}

// Hook para gerenciar materiais
export function useMateriais() {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar todos os materiais
  const fetchMateriais = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('materiais')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setMateriais(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar materiais')
    } finally {
      setLoading(false)
    }
  }

  // Criar material
  const createMaterial = async (materialData: Omit<Material, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      
      const { data, error: insertError } = await supabase
        .from('materiais')
        .insert(materialData)
        .select()
        .single()
      
      if (insertError) throw insertError
      
      // Atualizar lista local
      setMateriais(prev => [data, ...prev])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar material'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Atualizar material
  const updateMaterial = async (id: string, updates: Partial<Material>) => {
    try {
      setError(null)
      
      const { data, error: updateError } = await supabase
        .from('materiais')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // Atualizar lista local
      setMateriais(prev => prev.map(item => item.id === id ? data : item))
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar material'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Deletar material
  const deleteMaterial = async (id: string) => {
    try {
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('materiais')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // Remover da lista local
      setMateriais(prev => prev.filter(item => item.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar material'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchMateriais()
  }, [])

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
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar todas as turmas
  const fetchTurmas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('turmas')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      setTurmas(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar turmas')
    } finally {
      setLoading(false)
    }
  }

  // Criar turma
  const createTurma = async (turmaData: Omit<Turma, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      
      const { data, error: insertError } = await supabase
        .from('turmas')
        .insert(turmaData)
        .select()
        .single()
      
      if (insertError) throw insertError
      
      // Atualizar lista local
      setTurmas(prev => [data, ...prev])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar turma'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Atualizar turma
  const updateTurma = async (id: string, updates: Partial<Turma>) => {
    try {
      setError(null)
      
      const { data, error: updateError } = await supabase
        .from('turmas')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // Atualizar lista local
      setTurmas(prev => prev.map(item => item.id === id ? data : item))
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar turma'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Deletar turma
  const deleteTurma = async (id: string) => {
    try {
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('turmas')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // Remover da lista local
      setTurmas(prev => prev.filter(item => item.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar turma'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchTurmas()
  }, [])

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

// Hook para operações de prova completa (atividade + questões)
export function useProva() {
  const { createAtividade } = useAtividades()
  const { createQuestoes } = useQuestoes()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Criar prova completa com questões
  const createProva = async (provaData: {
    atividade: Omit<Atividade, 'id' | 'created_at' | 'updated_at'>
    questoes: Omit<Questao, 'id' | 'atividade_id' | 'created_at' | 'updated_at'>[]
  }) => {
    try {
      setLoading(true)
      setError(null)

      // 1. Criar a atividade
      const atividade = await createAtividade(provaData.atividade)

      // 2. Preparar questões com o ID da atividade
      const questoesComAtividade = provaData.questoes.map((questao, index) => ({
        ...questao,
        atividade_id: atividade.id,
        ordem: index + 1
      }))

      // 3. Criar todas as questões
      const questoes = await createQuestoes(questoesComAtividade)

      return {
        atividade,
        questoes
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar prova'
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
