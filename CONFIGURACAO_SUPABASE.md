# 🚀 Configuração Completa do Supabase - WordWise App

## ✅ Status Atual

Seu projeto já está **parcialmente configurado** para o Supabase! Você tem:

- ✅ Cliente Supabase configurado (`src/lib/supabase.ts`)
- ✅ Hooks personalizados (`src/hooks/useSupabase.ts`)
- ✅ Componente de exemplo (`src/components/SupabaseExample.tsx`)
- ✅ Dependência instalada (`@supabase/supabase-js`)

## 🔑 Passo 1: Criar Projeto no Supabase

### 1.1 Acesse o Supabase
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta

### 1.2 Crie um Novo Projeto
- Clique em **"New Project"**
- Escolha sua organização
- **Nome do projeto**: `wordwise-app` (ou outro nome)
- **Database Password**: Escolha uma senha forte (guarde-a!)
- **Region**: `us-east-1` (recomendado para Brasil)
- Clique em **"Create new project"**

### 1.3 Aguarde a Criação
- O projeto pode levar 2-5 minutos para ser criado
- Aguarde até aparecer "Project is ready"

## 🔑 Passo 2: Obter as Credenciais

### 2.1 Acesse as Configurações da API
- No projeto criado, vá em **Settings** → **API**
- Você verá duas informações importantes:

### 2.2 Copie as Credenciais
- **Project URL**: `https://abcdefghijklmnop.supabase.co`
- **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (chave longa)

## 🔑 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Crie o Arquivo .env
Na raiz do seu projeto, crie um arquivo chamado `.env`:

```bash
# Windows (PowerShell)
New-Item -Path ".env" -ItemType File

# Linux/Mac
touch .env
```

### 3.2 Adicione as Credenciais
No arquivo `.env`, adicione:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**⚠️ IMPORTANTE**: Substitua pelos valores reais do seu projeto!

## 🗄️ Passo 4: Configurar o Banco de Dados

### 4.1 Acesse o Editor SQL
- No Supabase Dashboard, vá em **SQL Editor**
- Clique em **"New query"**

### 4.2 Execute o SQL de Configuração
Cole e execute este código SQL:

```sql
-- Criar tabela de exemplo para testar
CREATE TABLE example_table (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (para testes)
CREATE POLICY "Permitir leitura pública" ON example_table
  FOR SELECT USING (true);

-- Política para permitir inserção pública (para testes)
CREATE POLICY "Permitir inserção pública" ON example_table
  FOR INSERT WITH CHECK (true);

-- Inserir dados de exemplo
INSERT INTO example_table (title, description) VALUES
  ('Primeiro Material', 'Este é um material de exemplo para testar a integração'),
  ('Segundo Material', 'Outro material para demonstrar o funcionamento');
```

## ✅ Passo 5: Testar a Integração

### 5.1 Reinicie o Servidor
```bash
# Pare o servidor (Ctrl+C) e reinicie
pnpm dev
```

### 5.2 Verifique o Console
- Abra o navegador
- Pressione F12 para abrir as ferramentas do desenvolvedor
- Vá na aba **Console**
- Verifique se não há erros relacionados ao Supabase

### 5.3 Teste o Componente
- Acesse a aplicação
- Procure pelo componente `SupabaseExample` ou adicione-o à sua página principal

## 🔐 Passo 6: Configurar Autenticação (Opcional)

### 6.1 Configurações de Autenticação
- No Supabase Dashboard, vá em **Authentication** → **Settings**
- Configure os provedores desejados:
  - **Email**: Para login com email/senha
  - **Google**: Para login com Google
  - **GitHub**: Para login com GitHub

### 6.2 Configurar Email
- Em **SMTP Settings**, configure seu provedor de email
- Ou use o email padrão do Supabase para testes

## 🚨 Solução de Problemas Comuns

### Erro: "Variáveis de ambiente não encontradas"
```bash
# Verifique se o arquivo .env existe
ls -la .env

# Verifique o conteúdo
cat .env

# Reinicie o servidor após alterar o .env
```

### Erro de CORS
- Verifique se a URL do Supabase está correta
- Confirme se o projeto está ativo
- Verifique se não há espaços extras nas variáveis

### Erro de RLS
- Execute as políticas SQL fornecidas acima
- Para testes, você pode temporariamente desabilitar RLS:
```sql
ALTER TABLE example_table DISABLE ROW LEVEL SECURITY;
```

### Erro: "Table does not exist"
- Verifique se executou o SQL de criação da tabela
- Confirme o nome da tabela no código (`example_table`)

## 🎯 Próximos Passos

### 6.1 Integrar com a Aplicação
- Adicione o componente `SupabaseExample` à sua página principal
- Ou crie componentes específicos para suas funcionalidades

### 6.2 Criar Tabelas Específicas
- Tabela de usuários
- Tabela de materiais
- Tabela de provas
- Tabela de atividades

### 6.3 Implementar Autenticação
- Sistema de login/registro
- Proteção de rotas
- Perfis de usuário

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Cliente JavaScript](https://supabase.com/docs/reference/javascript)

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique o console do navegador para erros
2. Confirme se as variáveis de ambiente estão corretas
3. Verifique se a tabela foi criada no Supabase
4. Teste com o componente de exemplo primeiro

---

**🎉 Parabéns!** Seu projeto WordWise está configurado para usar o Supabase!
