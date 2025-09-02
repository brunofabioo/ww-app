# Configuração do Storage no Supabase

Para que o upload e download de arquivos funcione corretamente, você precisa configurar o bucket de storage no Supabase.

## Passos para Configurar o Storage

### 1. Acesse o Supabase Dashboard
- Vá para [app.supabase.com](https://app.supabase.com)
- Acesse seu projeto WordWise

### 2. Navegue até Storage
- No menu lateral, clique em **Storage**
- Clique em **Buckets**

### 3. Criar o Bucket
- Clique em **New bucket**
- Nome do bucket: `materiais`
- Marque a opção **Public bucket** (para permitir acesso público aos arquivos)
- Clique em **Create bucket**

### 4. Configurar Políticas (Opcional)
Se você quiser configurar políticas mais específicas, execute o SQL abaixo no **SQL Editor**:

```sql
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
```

## Verificação

Após configurar o bucket:

1. Acesse a página de Materiais na aplicação
2. Tente fazer upload de um arquivo
3. Verifique se o download funciona com o nome correto

## Solução de Problemas

### Erro: "Bucket does not exist"
- Verifique se o bucket `materiais` foi criado corretamente
- Confirme se o nome está exatamente como `materiais`

### Erro de permissão
- Verifique se o bucket está marcado como público
- Execute as políticas SQL fornecidas acima

### Arquivo não baixa com nome correto
- Verifique se o `file_type` está sendo salvo corretamente no banco
- Confirme se o `title` do material está preenchido

## Funcionalidades Implementadas

✅ **Upload Real**: Arquivos são enviados para o Supabase Storage
✅ **Nome Único**: Cada arquivo recebe um nome único no storage
✅ **Download Correto**: Arquivos são baixados com o título + extensão
✅ **Exclusão Completa**: Ao deletar um material, o arquivo também é removido do storage
✅ **Tipos Suportados**: .pdf, .docx, .doc, .txt
✅ **Validação**: Tamanho máximo e tipos de arquivo
✅ **Tratamento de Erros**: Exclusão do registro continua mesmo se houver erro no storage

---

**Nota**: Após configurar o storage, teste a funcionalidade fazendo upload de um arquivo e verificando se o download funciona com o nome correto.