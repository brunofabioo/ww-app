-- =====================================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS DO WORDWISE APP
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT auth.uid(),
  email text UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 2. TABELA DE TURMAS
CREATE TABLE IF NOT EXISTS public.turmas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT turmas_pkey PRIMARY KEY (id),
  CONSTRAINT turmas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 3. TABELA DE MATERIAIS
CREATE TABLE IF NOT EXISTS public.materiais (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  subject text NOT NULL,
  user_id uuid,
  turma_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT materiais_pkey PRIMARY KEY (id),
  CONSTRAINT materiais_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id),
  CONSTRAINT materiais_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 4. TABELA DE ATIVIDADES
CREATE TABLE IF NOT EXISTS public.atividades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  language text NOT NULL,
  difficulty text NOT NULL,
  topics text NOT NULL,
  questions_count integer NOT NULL DEFAULT 10,
  generate_multiple_versions boolean DEFAULT false,
  versions_count integer DEFAULT 1,
  question_types jsonb NOT NULL DEFAULT '{}'::jsonb,
  turma_id uuid,
  material_id uuid,
  user_id uuid DEFAULT auth.uid(),
  content_html text,
  content_json jsonb,
  instructions_text text,
  instructions_json jsonb DEFAULT '{}'::jsonb,
  is_favorite boolean DEFAULT false,
  status text DEFAULT 'draft'::text,
  version_number integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone,
  archived_at timestamp with time zone,
  CONSTRAINT atividades_pkey PRIMARY KEY (id),
  CONSTRAINT atividades_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materiais(id),
  CONSTRAINT atividades_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT atividades_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id)
);

-- 5. TABELA DE VERSÕES DE ATIVIDADES
CREATE TABLE IF NOT EXISTS public.atividades_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  atividade_id uuid,
  version_number integer NOT NULL,
  content_html text NOT NULL,
  content_json jsonb,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT atividades_versions_pkey PRIMARY KEY (id),
  CONSTRAINT atividades_versions_atividade_id_fkey FOREIGN KEY (atividade_id) REFERENCES public.atividades(id),
  CONSTRAINT atividades_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- 6. TABELA DE DRAFTS
CREATE TABLE IF NOT EXISTS public.drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL,
  data jsonb NOT NULL,
  step integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT drafts_pkey PRIMARY KEY (id),
  CONSTRAINT drafts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 7. TABELA DE LEADS
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT leads_pkey PRIMARY KEY (id)
);

-- 8. TABELA DE SURVEYS
CREATE TABLE IF NOT EXISTS public.surveys (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  language text NOT NULL,
  institution text NOT NULL,
  questions_per_test text NOT NULL,
  tests_per_month text NOT NULL,
  time_per_test text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT surveys_pkey PRIMARY KEY (id),
  CONSTRAINT surveys_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id)
);

-- 9. TABELA DE EXEMPLO (conforme schema fornecido)
CREATE TABLE IF NOT EXISTS public.example_table (
  id bigint NOT NULL DEFAULT nextval('example_table_id_seq'::regclass),
  title text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT example_table_pkey PRIMARY KEY (id)
);

-- =====================================================
-- ÍNDICES PARA MELHORAR PERFORMANCE
-- =====================================================

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Índices para turmas
CREATE INDEX IF NOT EXISTS idx_turmas_user ON public.turmas(user_id);

-- Índices para materiais
CREATE INDEX IF NOT EXISTS idx_materiais_turma ON public.materiais(turma_id);
CREATE INDEX IF NOT EXISTS idx_materiais_user ON public.materiais(user_id);
CREATE INDEX IF NOT EXISTS idx_materiais_subject ON public.materiais(subject);

-- Índices para atividades
CREATE INDEX IF NOT EXISTS idx_atividades_turma ON public.atividades(turma_id);
CREATE INDEX IF NOT EXISTS idx_atividades_material ON public.atividades(material_id);
CREATE INDEX IF NOT EXISTS idx_atividades_user ON public.atividades(user_id);
CREATE INDEX IF NOT EXISTS idx_atividades_status ON public.atividades(status);
CREATE INDEX IF NOT EXISTS idx_atividades_language ON public.atividades(language);

-- Índices para versões de atividades
CREATE INDEX IF NOT EXISTS idx_atividades_versions_atividade ON public.atividades_versions(atividade_id);
CREATE INDEX IF NOT EXISTS idx_atividades_versions_created_by ON public.atividades_versions(created_by);

-- Índices para drafts
CREATE INDEX IF NOT EXISTS idx_drafts_user ON public.drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_type ON public.drafts(type);

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- Índices para surveys
CREATE INDEX IF NOT EXISTS idx_surveys_lead ON public.surveys(lead_id);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.example_table ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para usuários
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Políticas para turmas
CREATE POLICY "Usuários podem ver suas próprias turmas" ON public.turmas
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para materiais
CREATE POLICY "Usuários podem ver seus próprios materiais" ON public.materiais
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para atividades
CREATE POLICY "Usuários podem ver suas próprias atividades" ON public.atividades
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para versões de atividades
CREATE POLICY "Usuários podem ver versões de suas atividades" ON public.atividades_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.atividades a
      WHERE a.id = atividades_versions.atividade_id
      AND a.user_id = auth.uid()
    )
  );

-- Políticas para drafts
CREATE POLICY "Usuários podem ver seus próprios drafts" ON public.drafts
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para leads (acesso público para inserção)
CREATE POLICY "Leads podem ser inseridos publicamente" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Políticas para surveys
CREATE POLICY "Surveys podem ser inseridos publicamente" ON public.surveys
  FOR INSERT WITH CHECK (true);

-- Políticas para example_table (acesso público)
CREATE POLICY "Example table acesso público" ON public.example_table
  FOR ALL USING (true);

-- =====================================================
-- FUNÇÕES ÚTEIS
-- =====================================================

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_turmas_updated_at BEFORE UPDATE ON public.turmas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materiais_updated_at BEFORE UPDATE ON public.materiais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_atividades_updated_at BEFORE UPDATE ON public.atividades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON public.drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================

-- Este script criou todas as tabelas necessárias para o WordWise App
-- conforme o schema atualizado fornecido
-- Verifique se não houve erros e ajuste as políticas RLS conforme necessário
