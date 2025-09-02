-- =====================================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA DESENVOLVIMENTO
-- Execute este script no SQL Editor do Supabase
-- ⚠️ ATENÇÃO: Use apenas para desenvolvimento!
-- =====================================================

-- Desabilitar RLS em todas as tabelas do novo schema
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE turmas DISABLE ROW LEVEL SECURITY;
ALTER TABLE materiais DISABLE ROW LEVEL SECURITY;
ALTER TABLE atividades DISABLE ROW LEVEL SECURITY;
ALTER TABLE atividades_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE drafts DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE surveys DISABLE ROW LEVEL SECURITY;
ALTER TABLE example_table DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================
-- RLS foi desabilitado em todas as tabelas
-- Agora você pode inserir dados sem problemas de permissão
-- 
-- ⚠️ LEMBRE-SE: Reabilite o RLS antes de ir para produção!
-- 
-- Para reabilitar, execute:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE atividades_versions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;
