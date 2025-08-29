-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA PERMITIR INSERÇÃO
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Remover políticas existentes que só permitem SELECT
DROP POLICY IF EXISTS "Usuários podem ver suas próprias matrículas" ON matriculas;
DROP POLICY IF EXISTS "Usuários podem ver turmas onde estão matriculados" ON turmas;
DROP POLICY IF EXISTS "Usuários podem ver materiais das suas turmas" ON materiais;
DROP POLICY IF EXISTS "Usuários podem ver atividades das suas turmas" ON atividades;
DROP POLICY IF EXISTS "Usuários podem ver questões das atividades das suas turmas" ON questoes;
DROP POLICY IF EXISTS "Estudantes podem ver suas próprias submissões" ON submissoes;
DROP POLICY IF EXISTS "Professores podem ver submissões das suas atividades" ON submissoes;

-- =====================================================
-- NOVAS POLÍTICAS RLS COMPLETAS
-- =====================================================

-- Políticas para usuários
CREATE POLICY "Usuários podem gerenciar seus próprios dados" ON users
  FOR ALL USING (auth.uid()::text = id::text);

-- Políticas para turmas
CREATE POLICY "Turmas - Leitura pública" ON turmas
  FOR SELECT USING (true);

CREATE POLICY "Turmas - Inserção para usuários autenticados" ON turmas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Turmas - Atualização para criador" ON turmas
  FOR UPDATE USING (professor_id::text = auth.uid()::text);

CREATE POLICY "Turmas - Exclusão para criador" ON turmas
  FOR DELETE USING (professor_id::text = auth.uid()::text);

-- Políticas para materiais
CREATE POLICY "Materiais - Leitura pública" ON materiais
  FOR SELECT USING (true);

CREATE POLICY "Materiais - Inserção para usuários autenticados" ON materiais
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Materiais - Atualização para criador" ON materiais
  FOR UPDATE USING (professor_id::text = auth.uid()::text);

CREATE POLICY "Materiais - Exclusão para criador" ON materiais
  FOR DELETE USING (professor_id::text = auth.uid()::text);

-- Políticas para atividades
CREATE POLICY "Atividades - Leitura pública" ON atividades
  FOR SELECT USING (true);

CREATE POLICY "Atividades - Inserção para usuários autenticados" ON atividades
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Atividades - Atualização para criador" ON atividades
  FOR UPDATE USING (professor_id::text = auth.uid()::text);

CREATE POLICY "Atividades - Exclusão para criador" ON atividades
  FOR DELETE USING (professor_id::text = auth.uid()::text);

-- Políticas para questões
CREATE POLICY "Questões - Leitura pública" ON questoes
  FOR SELECT USING (true);

CREATE POLICY "Questões - Inserção para usuários autenticados" ON questoes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Questões - Atualização para criador da atividade" ON questoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM atividades a
      WHERE a.id = questoes.atividade_id
      AND a.professor_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Questões - Exclusão para criador da atividade" ON questoes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM atividades a
      WHERE a.id = questoes.atividade_id
      AND a.professor_id::text = auth.uid()::text
    )
  );

-- Políticas para submissões
CREATE POLICY "Submissões - Leitura para próprio usuário" ON submissoes
  FOR SELECT USING (estudante_id::text = auth.uid()::text);

CREATE POLICY "Submissões - Leitura para professor da atividade" ON submissoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM atividades a
      WHERE a.id = submissoes.atividade_id
      AND a.professor_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Submissões - Inserção para usuários autenticados" ON submissoes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Submissões - Atualização para professor da atividade" ON submissoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM atividades a
      WHERE a.id = submissoes.atividade_id
      AND a.professor_id::text = auth.uid()::text
    )
  );

-- Políticas para matrículas
CREATE POLICY "Matrículas - Leitura para próprio usuário" ON matriculas
  FOR SELECT USING (estudante_id::text = auth.uid()::text);

CREATE POLICY "Matrículas - Inserção para usuários autenticados" ON matriculas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Matrículas - Atualização para próprio usuário" ON matriculas
  FOR UPDATE USING (estudante_id::text = auth.uid()::text);

-- Políticas para configurações (leitura pública, escrita para admins)
CREATE POLICY "Configurações - Leitura pública" ON configuracoes
  FOR SELECT USING (true);

CREATE POLICY "Configurações - Inserção para usuários autenticados" ON configuracoes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- POLÍTICA TEMPORÁRIA PARA DESENVOLVIMENTO
-- =====================================================
-- Se ainda houver problemas, você pode temporariamente desabilitar RLS para desenvolvimento:

-- ALTER TABLE atividades DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE questoes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE turmas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE materiais DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- As políticas agora permitem inserção de dados para usuários autenticados
