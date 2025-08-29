import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env')
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript baseados no schema do WordWise App
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'student' | 'professor' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: 'student' | 'professor' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'student' | 'professor' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      turmas: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          professor_id: string | null
          ano_letivo: number
          semestre: number
          status: 'ativa' | 'inativa' | 'concluida'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          professor_id?: string | null
          ano_letivo: number
          semestre: number
          status?: 'ativa' | 'inativa' | 'concluida'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          professor_id?: string | null
          ano_letivo?: number
          semestre?: number
          status?: 'ativa' | 'inativa' | 'concluida'
          created_at?: string
          updated_at?: string
        }
      }
      materiais: {
        Row: {
          id: string
          titulo: string
          descricao: string | null
          conteudo: string | null
          tipo: 'texto' | 'pdf' | 'video' | 'link' | 'imagem'
          url_arquivo: string | null
          turma_id: string | null
          professor_id: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descricao?: string | null
          conteudo?: string | null
          tipo: 'texto' | 'pdf' | 'video' | 'link' | 'imagem'
          url_arquivo?: string | null
          turma_id?: string | null
          professor_id?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descricao?: string | null
          conteudo?: string | null
          tipo?: 'texto' | 'pdf' | 'video' | 'link' | 'imagem'
          url_arquivo?: string | null
          turma_id?: string | null
          professor_id?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      provas: {
        Row: {
          id: string
          titulo: string
          descricao: string | null
          instrucoes: string | null
          turma_id: string | null
          professor_id: string | null
          tipo: 'trabalho' | 'prova' | 'questionario' | 'discussao'
          data_inicio: string
          data_fim: string
          valor_maximo: number
          status: 'ativa' | 'pausada' | 'concluida'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descricao?: string | null
          instrucoes?: string | null
          turma_id?: string | null
          professor_id?: string | null
          tipo: 'trabalho' | 'prova' | 'questionario' | 'discussao'
          data_inicio: string
          data_fim: string
          valor_maximo?: number
          status?: 'ativa' | 'pausada' | 'concluida'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descricao?: string | null
          instrucoes?: string | null
          turma_id?: string | null
          professor_id?: string | null
          tipo?: 'trabalho' | 'prova' | 'questionario' | 'discussao'
          data_inicio?: string
          data_fim?: string
          valor_maximo?: number
          status?: 'ativa' | 'pausada' | 'concluida'
          created_at?: string
          updated_at?: string
        }
      }
      questoes: {
        Row: {
          id: string
          prova_id: string
          enunciado: string
          tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'dissertativa' | 'numerica'
          opcoes: any | null
          resposta_correta: string | null
          valor: number
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prova_id: string
          enunciado: string
          tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'dissertativa' | 'numerica'
          opcoes?: any | null
          resposta_correta?: string | null
          valor?: number
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prova_id?: string
          enunciado?: string
          tipo?: 'multipla_escolha' | 'verdadeiro_falso' | 'dissertativa' | 'numerica'
          opcoes?: any | null
          resposta_correta?: string | null
          valor?: number
          ordem?: number
          created_at?: string
          updated_at?: string
        }
      }
      submissoes: {
        Row: {
          id: string
          atividade_id: string
          estudante_id: string
          respostas: any | null
          nota: number | null
          comentarios_professor: string | null
          status: 'submetida' | 'corrigida' | 'revisada'
          data_submissao: string
          data_correcao: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          atividade_id: string
          estudante_id: string
          respostas?: any | null
          nota?: number | null
          comentarios_professor?: string | null
          status?: 'submetida' | 'corrigida' | 'revisada'
          data_submissao?: string
          data_correcao?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          atividade_id?: string
          estudante_id?: string
          respostas?: any | null
          nota?: number | null
          comentarios_professor?: string | null
          status?: 'submetida' | 'corrigida' | 'revisada'
          data_submissao?: string
          data_correcao?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      matriculas: {
        Row: {
          id: string
          estudante_id: string
          turma_id: string
          data_matricula: string
          status: 'ativa' | 'inativa' | 'trancada'
        }
        Insert: {
          id?: string
          estudante_id: string
          turma_id: string
          data_matricula?: string
          status?: 'ativa' | 'inativa' | 'trancada'
        }
        Update: {
          id?: string
          estudante_id?: string
          turma_id?: string
          data_matricula?: string
          status?: 'ativa' | 'inativa' | 'trancada'
        }
      }
      configuracoes: {
        Row: {
          id: string
          chave: string
          valor: string | null
          descricao: string | null
          tipo: 'string' | 'number' | 'boolean' | 'json'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chave: string
          valor?: string | null
          descricao?: string | null
          tipo?: 'string' | 'number' | 'boolean' | 'json'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chave?: string
          valor?: string | null
          descricao?: string | null
          tipo?: 'string' | 'number' | 'boolean' | 'json'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Tipos auxiliares para o app
export type User = Database['public']['Tables']['users']['Row']
export type Turma = Database['public']['Tables']['turmas']['Row']
export type Material = Database['public']['Tables']['materiais']['Row']
export type Atividade = Database['public']['Tables']['atividades']['Row']
export type Questao = Database['public']['Tables']['questoes']['Row']
export type Submissao = Database['public']['Tables']['submissoes']['Row']
export type Matricula = Database['public']['Tables']['matriculas']['Row']
export type Configuracao = Database['public']['Tables']['configuracoes']['Row']
