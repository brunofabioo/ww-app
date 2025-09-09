-- Script para adicionar campos de perfil na tabela users
-- Execute este script no SQL Editor do Supabase

-- Adicionar campos de perfil na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS bio text;

-- Comentários para documentação
COMMENT ON COLUMN public.users.phone IS 'Telefone do usuário';
COMMENT ON COLUMN public.users.address IS 'Endereço do usuário';
COMMENT ON COLUMN public.users.bio IS 'Biografia/descrição do usuário';

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;