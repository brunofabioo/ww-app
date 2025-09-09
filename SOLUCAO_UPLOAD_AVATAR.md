# 🔧 Solução: Upload de Foto de Perfil

## 🚨 Problema Identificado

O upload de foto de perfil não está funcionando porque o bucket `user-uploads` não existe no Supabase Storage. O código está tentando fazer upload para um bucket que não foi criado.

## ✅ Solução

### Passo 1: Criar o Bucket no Supabase

1. **Acesse o Supabase Dashboard**
   - Vá para [app.supabase.com](https://app.supabase.com)
   - Selecione seu projeto WordWise

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

3. **Execute o Script SQL**
   - Copie todo o conteúdo do arquivo `create-user-uploads-bucket.sql`
   - Cole no editor SQL
   - Clique em **Run** para executar

### Passo 2: Verificar a Criação

1. **Verificar o Bucket**
   - Vá em **Storage** no menu lateral
   - Você deve ver o bucket `user-uploads` listado

2. **Testar as Políticas**
   - Execute esta query para verificar:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'user-uploads';
   ```

### Passo 3: Testar o Upload

1. **Acesse a Aplicação**
   - Vá para a página de Perfil
   - Tente fazer upload de uma foto

2. **Verificar se Funcionou**
   - A foto deve aparecer no avatar
   - Não deve haver erros no console

## 🔒 Políticas de Segurança Configuradas

O script configura as seguintes políticas:

- ✅ **Upload**: Apenas usuários autenticados podem fazer upload
- ✅ **Leitura**: Arquivos são públicos (para exibir avatars)
- ✅ **Atualização**: Usuários só podem atualizar seus próprios arquivos
- ✅ **Exclusão**: Usuários só podem excluir seus próprios arquivos

## 📁 Estrutura de Arquivos

Os avatars serão salvos com a estrutura:
```
avatars/
├── {user_id}-{timestamp}.jpg
├── {user_id}-{timestamp}.png
└── ...
```

## 🚨 Troubleshooting

### Se ainda não funcionar:

1. **Verificar Variáveis de Ambiente**
   ```bash
   # Verifique se estão definidas no .env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_aqui
   ```

2. **Verificar Console do Navegador**
   - Abra as ferramentas de desenvolvedor (F12)
   - Veja se há erros na aba Console

3. **Verificar Permissões RLS**
   ```sql
   -- Verificar se RLS está habilitado
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'storage';
   ```

## ✅ Resultado Esperado

Após seguir estes passos:
- ✅ Upload de foto de perfil funcionando
- ✅ Preview da imagem antes de salvar
- ✅ Validação de tipo e tamanho de arquivo
- ✅ Mensagens de sucesso/erro apropriadas
- ✅ Avatar atualizado na interface

---

**Nota**: Este problema ocorreu porque o bucket `user-uploads` não estava configurado no Supabase Storage. O script SQL resolve isso criando o bucket com as políticas de segurança adequadas.