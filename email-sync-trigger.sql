-- =====================================================
-- TRIGGER DE SINCRONIZAÇÃO DE EMAIL
-- =====================================================
-- Este arquivo contém as funções para sincronizar emails
-- entre auth.users e public.users no Supabase

-- Função para sincronizar email do auth.users para public.users
-- Esta função pode ser chamada manualmente ou via webhook
CREATE OR REPLACE FUNCTION sync_auth_email_to_users(user_id UUID, new_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Atualiza o email na tabela public.users
  UPDATE public.users 
  SET 
    email = new_email,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Retorna true se a atualização foi bem-sucedida
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para sincronizar todos os emails (útil para sincronização inicial)
CREATE OR REPLACE FUNCTION sync_all_emails()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  -- Atualiza todos os emails da tabela public.users baseado em auth.users
  UPDATE public.users 
  SET 
    email = auth_users.email,
    updated_at = NOW()
  FROM auth.users AS auth_users
  WHERE public.users.id = auth_users.id
    AND public.users.email IS DISTINCT FROM auth_users.email;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMO USAR AS FUNÇÕES
-- =====================================================

-- 1. Para sincronizar um usuário específico:
-- SELECT sync_auth_email_to_users('user-uuid-here', 'novo-email@exemplo.com');

-- 2. Para sincronizar todos os usuários:
-- SELECT sync_all_emails();

-- 3. Para verificar emails desatualizados:
-- SELECT 
--   u.id,
--   u.email as public_email,
--   au.email as auth_email
-- FROM public.users u
-- JOIN auth.users au ON u.id = au.id
-- WHERE u.email IS DISTINCT FROM au.email;

-- =====================================================
-- INTEGRAÇÃO COM O FRONTEND
-- =====================================================
-- No código React/TypeScript, após uma mudança de email bem-sucedida:
-- 
-- const { data, error } = await supabase.rpc('sync_auth_email_to_users', {
--   user_id: user.id,
--   new_email: newEmail
-- });
--
-- if (error) {
--   console.error('Erro ao sincronizar email:', error);
-- } else {
--   console.log('Email sincronizado com sucesso');
-- }

-- =====================================================
-- WEBHOOK ALTERNATIVO (OPCIONAL)
-- =====================================================
-- Como não é possível criar triggers diretamente na tabela auth.users,
-- uma alternativa é usar webhooks do Supabase Auth para capturar
-- eventos de mudança de email e chamar a função de sincronização.
--
-- Configuração no Dashboard do Supabase:
-- 1. Vá em Authentication > Settings > Webhooks
-- 2. Adicione um webhook para o evento "user.updated"
-- 3. Configure a URL do webhook para chamar sua função

-- Comentários explicativos
COMMENT ON FUNCTION sync_auth_email_to_users(UUID, TEXT) IS 'Sincroniza o email de um usuário específico do auth.users para public.users';
COMMENT ON FUNCTION sync_all_emails() IS 'Sincroniza todos os emails do auth.users para public.users e retorna o número de registros atualizados';