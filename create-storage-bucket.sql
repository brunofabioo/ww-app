-- Criar bucket para armazenar materiais
INSERT INTO storage.buckets (id, name, public)
VALUES ('materiais', 'materiais', true);

-- Política para permitir upload de arquivos
CREATE POLICY "Permitir upload de materiais" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'materiais');

-- Política para permitir leitura pública dos arquivos
CREATE POLICY "Permitir leitura pública de materiais" ON storage.objects
  FOR SELECT USING (bucket_id = 'materiais');

-- Política para permitir atualização de arquivos
CREATE POLICY "Permitir atualização de materiais" ON storage.objects
  FOR UPDATE USING (bucket_id = 'materiais');

-- Política para permitir exclusão de arquivos
CREATE POLICY "Permitir exclusão de materiais" ON storage.objects
  FOR DELETE USING (bucket_id = 'materiais');