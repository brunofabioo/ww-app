-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA O NOVO SCHEMA
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Remover políticas existentes que podem estar obsoletas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.users;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias turmas" ON public.turmas;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios materiais" ON public.materiais;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias atividades" ON public.atividades;
DROP POLICY IF EXISTS "Usuários podem ver versões de suas atividades" ON public.atividades_versions;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios drafts" ON public.drafts;
DROP POLICY IF EXISTS "Leads podem ser inseridos publicamente" ON public.leads;
DROP POLICY IF EXISTS "Surveys podem ser inseridos publicamente" ON public.surveys;
DROP POLICY IF EXISTS "Example table acesso público" ON public.example_table;

-- =====================================================
-- NOVAS POLÍTICAS RLS COMPLETAS
-- =====================================================

-- Políticas para usuários
CREATE POLICY "Usuários - Inserção do próprio perfil" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários - Leitura do próprio perfil" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários - Atualização do próprio perfil" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários - Exclusão do próprio perfil" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- Políticas para turmas
CREATE POLICY "Turmas - Leitura para próprio usuário" ON public.turmas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Turmas - Inserção para usuários autenticados" ON public.turmas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Turmas - Atualização para criador" ON public.turmas
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Turmas - Exclusão para criador" ON public.turmas
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para materiais
CREATE POLICY "Materiais - Leitura para próprio usuário" ON public.materiais
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Materiais - Inserção para usuários autenticados" ON public.materiais
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Materiais - Atualização para criador" ON public.materiais
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Materiais - Exclusão para criador" ON public.materiais
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para atividades
CREATE POLICY "Atividades - Leitura para próprio usuário" ON public.atividades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Atividades - Inserção para usuários autenticados" ON public.atividades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Atividades - Atualização para criador" ON public.atividades
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Atividades - Exclusão para criador" ON public.atividades
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para versões de atividades
CREATE POLICY "Atividades Versions - Leitura para criador da atividade" ON public.atividades_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.atividades a
      WHERE a.id = atividades_versions.atividade_id
      AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Atividades Versions - Inserção para criador da atividade" ON public.atividades_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.atividades a
      WHERE a.id = atividades_versions.atividade_id
      AND a.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Atividades Versions - Atualização para criador da atividade" ON public.atividades_versions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.atividades a
      WHERE a.id = atividades_versions.atividade_id
      AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Atividades Versions - Exclusão para criador da atividade" ON public.atividades_versions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.atividades a
      WHERE a.id = atividades_versions.atividade_id
      AND a.user_id = auth.uid()
    )
  );

-- Políticas para drafts
CREATE POLICY "Drafts - Leitura para próprio usuário" ON public.drafts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Drafts - Inserção para usuários autenticados" ON public.drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Drafts - Atualização para próprio usuário" ON public.drafts
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Drafts - Exclusão para próprio usuário" ON public.drafts
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para leads (acesso público para inserção - formulários de contato)
CREATE POLICY "Leads - Inserção pública" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Leads - Leitura restrita" ON public.leads
  FOR SELECT USING (false); -- Apenas admins devem ter acesso via dashboard

-- Políticas para surveys (acesso público para inserção - formulários de pesquisa)
CREATE POLICY "Surveys - Inserção pública" ON public.surveys
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Surveys - Leitura restrita" ON public.surveys
  FOR SELECT USING (false); -- Apenas admins devem ter acesso via dashboard

-- Políticas para example_table (acesso público para testes)
CREATE POLICY "Example Table - Acesso público completo" ON public.example_table
  FOR ALL USING (true);

-- =====================================================
-- POLÍTICAS ADMINISTRATIVAS (OPCIONAL)
-- =====================================================

-- Se você quiser criar políticas para administradores, descomente as linhas abaixo
-- e ajuste conforme necessário:

-- CREATE POLICY "Admin - Acesso total a leads" ON public.leads
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM public.users u
--       WHERE u.id = auth.uid()
--       AND u.role = 'admin'
--     )
--   );

-- CREATE POLICY "Admin - Acesso total a surveys" ON public.surveys
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM public.users u
--       WHERE u.id = auth.uid()
--       AND u.role = 'admin'
--     )
--   );

-- =====================================================
-- POLÍTICA TEMPORÁRIA PARA DESENVOLVIMENTO
-- =====================================================
-- Se ainda houver problemas durante o desenvolvimento, você pode temporariamente
-- desabilitar RLS para tabelas específicas:

-- ALTER TABLE public.atividades DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.turmas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.materiais DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.drafts DISABLE ROW LEVEL SECURITY;

-- Para reabilitar:
-- ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- As políticas agora estão alinhadas com o novo schema do banco de dados
-- e permitem operações CRUD adequadas para usuários autenticados
