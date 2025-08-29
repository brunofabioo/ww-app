-- =====================================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA DESENVOLVIMENTO
-- Execute este script no SQL Editor do Supabase
-- ⚠️ ATENÇÃO: Use apenas para desenvolvimento!
-- =====================================================

-- Desabilitar RLS em todas as tabelas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE turmas DISABLE ROW LEVEL SECURITY;
ALTER TABLE materiais DISABLE ROW LEVEL SECURITY;
ALTER TABLE atividades DISABLE ROW LEVEL SECURITY;
ALTER TABLE questoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;

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
-- ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE submissoes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
