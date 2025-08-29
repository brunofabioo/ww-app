-- =====================================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS DO WORDWISE APP
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE TURMAS
CREATE TABLE IF NOT EXISTS turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  professor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ano_letivo INTEGER NOT NULL,
  semestre INTEGER NOT NULL CHECK (semestre IN (1, 2)),
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'concluida')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE MATERIAIS
CREATE TABLE IF NOT EXISTS materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  conteudo TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('texto', 'pdf', 'video', 'link', 'imagem')),
  url_arquivo TEXT,
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE ATIVIDADES
CREATE TABLE IF NOT EXISTS atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  instrucoes TEXT,
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('trabalho', 'prova', 'questionario', 'discussao')),
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  valor_maximo DECIMAL(5,2) DEFAULT 10.0,
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'concluida')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE QUESTÕES
CREATE TABLE IF NOT EXISTS questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id UUID REFERENCES atividades(id) ON DELETE CASCADE,
  enunciado TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('multipla_escolha', 'verdadeiro_falso', 'dissertativa', 'numerica')),
  opcoes JSONB, -- Para questões de múltipla escolha
  resposta_correta TEXT,
  valor DECIMAL(3,2) DEFAULT 1.0,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE SUBMISSÕES
CREATE TABLE IF NOT EXISTS submissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atividade_id UUID REFERENCES atividades(id) ON DELETE CASCADE,
  estudante_id UUID REFERENCES users(id) ON DELETE CASCADE,
  respostas JSONB, -- Respostas do estudante
  nota DECIMAL(5,2),
  comentarios_professor TEXT,
  status TEXT DEFAULT 'submetida' CHECK (status IN ('submetida', 'corrigida', 'revisada')),
  data_submissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_correcao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE MATRÍCULAS (relacionamento muitos-para-muitos entre usuários e turmas)
CREATE TABLE IF NOT EXISTS matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudante_id UUID REFERENCES users(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
  data_matricula TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'trancada')),
  UNIQUE(estudante_id, turma_id)
);

-- 8. TABELA DE CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT UNIQUE NOT NULL,
  valor TEXT,
  descricao TEXT,
  tipo TEXT DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MELHORAR PERFORMANCE
-- =====================================================

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índices para turmas
CREATE INDEX IF NOT EXISTS idx_turmas_professor ON turmas(professor_id);
CREATE INDEX IF NOT EXISTS idx_turmas_ano_semestre ON turmas(ano_letivo, semestre);

-- Índices para materiais
CREATE INDEX IF NOT EXISTS idx_materiais_turma ON materiais(turma_id);
CREATE INDEX IF NOT EXISTS idx_materiais_professor ON materiais(professor_id);
CREATE INDEX IF NOT EXISTS idx_materiais_tipo ON materiais(tipo);

-- Índices para atividades
CREATE INDEX IF NOT EXISTS idx_atividades_turma ON atividades(turma_id);
CREATE INDEX IF NOT EXISTS idx_atividades_professor ON atividades(professor_id);
CREATE INDEX IF NOT EXISTS idx_atividades_data ON atividades(data_inicio, data_fim);

-- Índices para questões
CREATE INDEX IF NOT EXISTS idx_questoes_atividade ON questoes(atividade_id);
CREATE INDEX IF NOT EXISTS idx_questoes_ordem ON questoes(atividade_id, ordem);

-- Índices para submissões
CREATE INDEX IF NOT EXISTS idx_submissoes_atividade ON submissoes(atividade_id);
CREATE INDEX IF NOT EXISTS idx_submissoes_estudante ON submissoes(estudante_id);
CREATE INDEX IF NOT EXISTS idx_submissoes_status ON submissoes(status);

-- Índices para matrículas
CREATE INDEX IF NOT EXISTS idx_matriculas_estudante ON matriculas(estudante_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_turma ON matriculas(turma_id);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS BÁSICAS (AJUSTE CONFORME NECESSÁRIO)
-- =====================================================

-- Políticas para usuários
CREATE POLICY "Usuários podem ver seus próprios dados" ON users
  FOR ALL USING (auth.uid()::text = id::text);

-- Políticas para turmas
CREATE POLICY "Usuários podem ver turmas onde estão matriculados" ON turmas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matriculas 
      WHERE matriculas.turma_id = turmas.id 
      AND matriculas.estudante_id::text = auth.uid()::text
    )
    OR turmas.professor_id::text = auth.uid()::text
  );

-- Políticas para materiais
CREATE POLICY "Usuários podem ver materiais das suas turmas" ON materiais
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matriculas 
      WHERE matriculas.turma_id = materiais.turma_id 
      AND matriculas.estudante_id::text = auth.uid()::text
    )
    OR materiais.professor_id::text = auth.uid()::text
  );

-- Políticas para atividades
CREATE POLICY "Usuários podem ver atividades das suas turmas" ON atividades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matriculas 
      WHERE matriculas.turma_id = atividades.turma_id 
      AND matriculas.estudante_id::text = auth.uid()::text
    )
    OR atividades.professor_id::text = auth.uid()::text
  );

-- Políticas para questões
CREATE POLICY "Usuários podem ver questões das atividades das suas turmas" ON questoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM atividades a
      JOIN matriculas m ON m.turma_id = a.turma_id
      WHERE a.id = questoes.atividade_id
      AND m.estudante_id::text = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM atividades a
      WHERE a.id = questoes.atividade_id
      AND a.professor_id::text = auth.uid()::text
    )
  );

-- Políticas para submissões
CREATE POLICY "Estudantes podem ver suas próprias submissões" ON submissoes
  FOR SELECT USING (estudante_id::text = auth.uid()::text);

CREATE POLICY "Professores podem ver submissões das suas atividades" ON submissoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM atividades a
      WHERE a.id = submissoes.atividade_id
      AND a.professor_id::text = auth.uid()::text
    )
  );

-- Políticas para matrículas
CREATE POLICY "Usuários podem ver suas próprias matrículas" ON matriculas
  FOR SELECT USING (estudante_id::text = auth.uid()::text);

-- Políticas para configurações (leitura pública)
CREATE POLICY "Configurações são de leitura pública" ON configuracoes
  FOR SELECT USING (true);

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_turmas_updated_at BEFORE UPDATE ON turmas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materiais_updated_at BEFORE UPDATE ON materiais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_atividades_updated_at BEFORE UPDATE ON atividades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questoes_updated_at BEFORE UPDATE ON questoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissoes_updated_at BEFORE UPDATE ON submissoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao, tipo) VALUES
  ('app_name', 'WordWise App', 'Nome da aplicação', 'string'),
  ('app_version', '1.0.0', 'Versão da aplicação', 'string'),
  ('max_file_size_mb', '10', 'Tamanho máximo de arquivo em MB', 'number'),
  ('enable_notifications', 'true', 'Habilitar notificações', 'boolean')
ON CONFLICT (chave) DO NOTHING;

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================

-- Este script criou todas as tabelas necessárias para o WordWise App
-- Verifique se não houve erros e ajuste as políticas RLS conforme necessário
