# Configuração do Supabase - Passo a Passo

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

## 📋 Passos para Obter as Credenciais

### 1. Acesse o Supabase Dashboard
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta

### 2. Crie um Novo Projeto
- Clique em "New Project"
- Escolha sua organização
- Nome: `wordwise-app` (ou outro nome)
- Senha do banco: escolha uma senha forte
- Região: `us-east-1` (recomendado)
- Clique em "Create new project"

### 3. Obtenha as Credenciais
- No projeto criado, vá em **Settings** → **API**
- Copie a **Project URL**
- Copie a **anon public** key

### 4. Configure o .env
- Substitua os valores no arquivo `.env`
- Reinicie o servidor de desenvolvimento

## 🗄️ Configuração do Banco de Dados

Após criar o projeto, execute este SQL no Editor SQL do Supabase:

```sql
-- Criar tabela de usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de materiais
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajuste conforme necessário)
CREATE POLICY "Usuários podem ver seus próprios dados" ON users
  FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários podem ver seus materiais" ON materials
  FOR ALL USING (auth.uid()::text = user_id::text);
```

## ✅ Verificação da Configuração

1. Crie o arquivo `.env` com suas credenciais
2. Execute `pnpm dev` para iniciar o servidor
3. Acesse a aplicação no navegador
4. Verifique se não há erros no console relacionados ao Supabase

## 🔐 Configuração de Autenticação

No Supabase Dashboard:
1. Vá em **Authentication** → **Settings**
2. Configure os provedores desejados (Email, Google, etc.)
3. Ajuste as configurações de email se necessário

## 🚨 Solução de Problemas

### Erro: "Variáveis de ambiente não encontradas"
- Verifique se o arquivo `.env` existe na raiz
- Confirme se as variáveis começam com `VITE_`
- Reinicie o servidor após alterar o `.env`

### Erro de CORS
- Verifique se a URL do Supabase está correta
- Confirme se o projeto está ativo

### Erro de RLS
- Execute as políticas SQL fornecidas acima
- Para testes, você pode temporariamente desabilitar RLS
