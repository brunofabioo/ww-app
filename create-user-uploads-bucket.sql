-- Criar bucket para armazenar uploads de usuários (avatars, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true);

-- Política para permitir upload de arquivos pelos usuários autenticados
CREATE POLICY "Usuários podem fazer upload de arquivos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-uploads' AND 
    auth.role() = 'authenticated'
  );

-- Política para permitir leitura pública dos arquivos
CREATE POLICY "Permitir leitura pública de uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-uploads');

-- Política para permitir atualização de arquivos pelo próprio usuário
CREATE POLICY "Usuários podem atualizar seus próprios arquivos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política para permitir exclusão de arquivos pelo próprio usuário
CREATE POLICY "Usuários podem excluir seus próprios arquivos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'user-uploads';