-- =====================================================
-- REABILITAR RLS E APLICAR POLÍTICAS CORRETAS
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. REABILITAR ROW LEVEL SECURITY EM TODAS AS TABELAS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.example_table ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES PARA RECRIAR
DROP POLICY IF EXISTS "Usuários - Inserção do próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários - Leitura do próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários - Atualização do próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários - Exclusão do próprio perfil" ON public.users;

DROP POLICY IF EXISTS "Turmas - Leitura para próprio usuário" ON public.turmas;
DROP POLICY IF EXISTS "Turmas - Inserção para usuários autenticados" ON public.turmas;
DROP POLICY IF EXISTS "Turmas - Atualização para criador" ON public.turmas;
DROP POLICY IF EXISTS "Turmas - Exclusão para criador" ON public.turmas;

DROP POLICY IF EXISTS "Materiais - Leitura para próprio usuário" ON public.materiais;
DROP POLICY IF EXISTS "Materiais - Inserção para usuários autenticados" ON public.materiais;
DROP POLICY IF EXISTS "Materiais - Atualização para criador" ON public.materiais;
DROP POLICY IF EXISTS "Materiais - Exclusão para criador" ON public.materiais;

DROP POLICY IF EXISTS "Atividades - Leitura para próprio usuário" ON public.atividades;
DROP POLICY IF EXISTS "Atividades - Inserção para usuários autenticados" ON public.atividades;
DROP POLICY IF EXISTS "Atividades - Atualização para criador" ON public.atividades;
DROP POLICY IF EXISTS "Atividades - Exclusão para criador" ON public.atividades;

DROP POLICY IF EXISTS "Atividades Versions - Leitura para criador da atividade" ON public.atividades_versions;
DROP POLICY IF EXISTS "Atividades Versions - Inserção para criador da atividade" ON public.atividades_versions;
DROP POLICY IF EXISTS "Atividades Versions - Atualização para criador da atividade" ON public.atividades_versions;
DROP POLICY IF EXISTS "Atividades Versions - Exclusão para criador da atividade" ON public.atividades_versions;


DROP POLICY IF EXISTS "Leads - Inserção pública" ON public.leads;
DROP POLICY IF EXISTS "Leads - Leitura restrita" ON public.leads;

DROP POLICY IF EXISTS "Surveys - Inserção pública" ON public.surveys;
DROP POLICY IF EXISTS "Surveys - Leitura restrita" ON public.surveys;

DROP POLICY IF EXISTS "Example Table - Acesso público completo" ON public.example_table;

-- 3. CRIAR POLÍTICAS RLS CORRETAS E SEGURAS

-- POLÍTICAS PARA USUÁRIOS
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- POLÍTICAS PARA TURMAS
CREATE POLICY "turmas_select_own" ON public.turmas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "turmas_insert_own" ON public.turmas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "turmas_update_own" ON public.turmas
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "turmas_delete_own" ON public.turmas
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS PARA MATERIAIS (CRÍTICO PARA SEGURANÇA)
CREATE POLICY "materiais_select_own" ON public.materiais
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "materiais_insert_own" ON public.materiais
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "materiais_update_own" ON public.materiais
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "materiais_delete_own" ON public.materiais
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS PARA ATIVIDADES
CREATE POLICY "atividades_select_own" ON public.atividades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "atividades_insert_own" ON public.atividades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "atividades_update_own" ON public.atividades
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "atividades_delete_own" ON public.atividades
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS PARA VERSÕES DE ATIVIDADES
CREATE POLICY "atividades_versions_select_own" ON public.atividades_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.atividades a
      WHERE a.id = atividades_versions.atividade_id
      AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "atividades_versions_insert_own" ON public.atividades_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.atividades a
      WHERE a.id = atividades_versions.atividade_id
      AND a.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "atividades_versions_update_own" ON public.atividades_versions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.atividades a
      WHERE a.id = atividades_versions.atividade_id
      AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "atividades_versions_delete_own" ON public.atividades_versions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.atividades a
      WHERE a.id = atividades_versions.atividade_id
      AND a.user_id = auth.uid()
    )
  );


-- POLÍTICAS PARA LEADS (apenas inserção pública)
CREATE POLICY "leads_insert_public" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "leads_select_none" ON public.leads
  FOR SELECT USING (false);

-- POLÍTICAS PARA SURVEYS (apenas inserção pública)
CREATE POLICY "surveys_insert_public" ON public.surveys
  FOR INSERT WITH CHECK (true);

CREATE POLICY "surveys_select_none" ON public.surveys
  FOR SELECT USING (false);

-- POLÍTICAS PARA EXAMPLE_TABLE (acesso público para testes)
CREATE POLICY "example_table_all_public" ON public.example_table
  FOR ALL USING (true);

-- 4. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS CORRETAMENTE
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================
-- RLS foi reabilitado e as políticas foram aplicadas corretamente
-- Agora cada usuário só pode ver seus próprios dados
-- 
-- ⚠️ IMPORTANTE: Teste com diferentes usuários para confirmar o isolamento
