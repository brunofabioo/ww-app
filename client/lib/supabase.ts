import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variáveis de ambiente do Supabase não encontradas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env",
  );
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para TypeScript baseados no schema do WordWise App
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      turmas: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      materiais: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          file_url: string;
          file_type: string;
          file_size: number;
          subject: string;
          user_id: string | null;
          turma_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          file_url: string;
          file_type: string;
          file_size: number;
          subject: string;
          user_id?: string | null;
          turma_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          file_url?: string;
          file_type?: string;
          file_size?: number;
          subject?: string;
          user_id?: string | null;
          turma_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      atividades: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          language: string;
          difficulty: string;
          topics: string;
          questions_count: number;
          generate_multiple_versions: boolean | null;
          versions_count: number | null;
          question_types: any;
          turma_id: string | null;
          material_id: string | null;
          user_id: string | null;
          content_html: string | null;
          content_json: any | null;
          instructions_text: string | null;
          instructions_json: any;
          is_favorite: boolean | null;
          status: string;
          version_number: number | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          language: string;
          difficulty: string;
          topics: string;
          questions_count?: number;
          generate_multiple_versions?: boolean | null;
          versions_count?: number | null;
          question_types?: any;
          turma_id?: string | null;
          material_id?: string | null;
          user_id?: string | null;
          content_html?: string | null;
          content_json?: any | null;
          instructions_text?: string | null;
          instructions_json?: any;
          is_favorite?: boolean | null;
          status?: string;
          version_number?: number | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          language?: string;
          difficulty?: string;
          topics?: string;
          questions_count?: number;
          generate_multiple_versions?: boolean | null;
          versions_count?: number | null;
          question_types?: any;
          turma_id?: string | null;
          material_id?: string | null;
          user_id?: string | null;
          content_html?: string | null;
          content_json?: any | null;
          instructions_text?: string | null;
          instructions_json?: any;
          is_favorite?: boolean | null;
          status?: string;
          version_number?: number | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          archived_at?: string | null;
        };
      };
      atividades_versions: {
        Row: {
          id: string;
          atividade_id: string | null;
          version_number: number;
          content_html: string;
          content_json: any | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          atividade_id?: string | null;
          version_number: number;
          content_html: string;
          content_json?: any | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          atividade_id?: string | null;
          version_number?: number;
          content_html?: string;
          content_json?: any | null;
          created_at?: string;
          created_by?: string | null;
        };
      };
      drafts: {
        Row: {
          id: string;
          user_id: string | null;
          type: string;
          data: any;
          step: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: string;
          data: any;
          step?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          type?: string;
          data?: any;
          step?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      surveys: {
        Row: {
          id: string;
          lead_id: string;
          language: string;
          institution: string;
          questions_per_test: string;
          tests_per_month: string;
          time_per_test: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          language: string;
          institution: string;
          questions_per_test: string;
          tests_per_month: string;
          time_per_test: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          language?: string;
          institution?: string;
          questions_per_test?: string;
          tests_per_month?: string;
          time_per_test?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Tipos auxiliares para o app
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Turma = Database["public"]["Tables"]["turmas"]["Row"];
export type Material = Database["public"]["Tables"]["materiais"]["Row"];
export type Atividade = Database["public"]["Tables"]["atividades"]["Row"];
export type AtividadeVersion = Database["public"]["Tables"]["atividades_versions"]["Row"];
export type Draft = Database["public"]["Tables"]["drafts"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type Survey = Database["public"]["Tables"]["surveys"]["Row"];
