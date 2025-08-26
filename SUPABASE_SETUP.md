# Configuração do Supabase - WordWise

Este guia explica como configurar e usar o Supabase na aplicação WordWise.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Projeto Supabase criado
- Node.js e npm instalados

## 🚀 Configuração Inicial

### 1. Instalar Dependências

O cliente Supabase já foi instalado:

```bash
npm install @supabase/supabase-js
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto e substitua os valores:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Como obter essas informações:**

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em `Settings` > `API`
3. Copie a `URL` e a `anon public` key

### 3. Estrutura de Arquivos Criada

```
src/
├── lib/
│   └── supabase.ts          # Cliente Supabase configurado
├── hooks/
│   └── useSupabase.ts       # Hooks personalizados para Supabase
└── components/
    └── SupabaseExample.tsx  # Componente de exemplo
```

## 🛠️ Uso dos Hooks

### Hook de Autenticação

```tsx
import { useAuth } from '../hooks/useSupabase'

function MyComponent() {
  const { user, session, loading, signOut } = useAuth()
  
  if (loading) return <div>Carregando...</div>
  
  return (
    <div>
      {user ? (
        <div>
          <p>Bem-vindo, {user.email}!</p>
          <button onClick={signOut}>Sair</button>
        </div>
      ) : (
        <p>Não autenticado</p>
      )}
    </div>
  )
}
```

### Hook de Consulta

```tsx
import { useSupabaseQuery } from '../hooks/useSupabase'

interface MinhaTabela {
  id: number
  nome: string
  email: string
}

function ListaUsuarios() {
  const { data, loading, error, refetch } = useSupabaseQuery<MinhaTabela>('usuarios')
  
  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>
  
  return (
    <ul>
      {data.map(usuario => (
        <li key={usuario.id}>{usuario.nome} - {usuario.email}</li>
      ))}
    </ul>
  )
}
```

### Hook de Inserção

```tsx
import { useSupabaseInsert } from '../hooks/useSupabase'

function AdicionarUsuario() {
  const { insert, loading, error } = useSupabaseInsert('usuarios')
  
  const handleSubmit = async (dados) => {
    try {
      await insert(dados)
      console.log('Usuário adicionado com sucesso!')
    } catch (err) {
      console.error('Erro ao adicionar usuário:', err)
    }
  }
  
  // ... resto do componente
}
```

## 🗄️ Configuração do Banco de Dados

### Exemplo de Tabela

Para testar a integração, crie uma tabela de exemplo no Supabase:

```sql
-- Criar tabela de exemplo
CREATE TABLE example_table (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública" ON example_table
  FOR SELECT USING (true);

-- Política para permitir inserção pública (ajuste conforme necessário)
CREATE POLICY "Permitir inserção pública" ON example_table
  FOR INSERT WITH CHECK (true);
```

### Configuração de Autenticação

Para habilitar autenticação:

1. No Supabase Dashboard, vá em `Authentication` > `Settings`
2. Configure os provedores desejados (Email, Google, GitHub, etc.)
3. Ajuste as políticas RLS conforme suas necessidades

## 🔧 Componente de Exemplo

Um componente de exemplo foi criado em `src/components/SupabaseExample.tsx` que demonstra:

- Status da autenticação
- Inserção de dados
- Consulta de dados
- Tratamento de erros
- Estados de carregamento

Para usar o componente:

```tsx
import { SupabaseExample } from './components/SupabaseExample'

function App() {
  return (
    <div>
      <SupabaseExample />
    </div>
  )
}
```

## 🔐 Segurança

### Row Level Security (RLS)

Sempre configure políticas RLS para suas tabelas:

```sql
-- Habilitar RLS
ALTER TABLE sua_tabela ENABLE ROW LEVEL SECURITY;

-- Exemplo: usuários só podem ver seus próprios dados
CREATE POLICY "Usuários veem apenas seus dados" ON sua_tabela
  FOR ALL USING (auth.uid() = user_id);
```

### Variáveis de Ambiente

- ✅ `VITE_SUPABASE_URL` - Pode ser pública
- ✅ `VITE_SUPABASE_ANON_KEY` - Pode ser pública (chave anônima)
- ❌ **NUNCA** exponha a `service_role` key no frontend

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Cliente JavaScript](https://supabase.com/docs/reference/javascript)

## 🐛 Solução de Problemas

### Erro: "Variáveis de ambiente não encontradas"

- Verifique se as variáveis estão definidas no `.env`
- Reinicie o servidor de desenvolvimento após alterar o `.env`
- Certifique-se de que as variáveis começam com `VITE_`

### Erro de CORS

- Verifique se a URL do Supabase está correta
- Confirme se o projeto Supabase está ativo

### Erro de RLS

- Verifique se as políticas RLS estão configuradas corretamente
- Para testes, você pode temporariamente desabilitar RLS:
  ```sql
  ALTER TABLE sua_tabela DISABLE ROW LEVEL SECURITY;
  ```

## 🎯 Próximos Passos

1. Configure suas tabelas específicas do WordWise
2. Implemente autenticação de usuários
3. Crie políticas RLS adequadas
4. Integre com os componentes existentes da aplicação
5. Configure backup e monitoramento

---

**Nota:** Lembre-se de nunca commitar chaves secretas no repositório. Use sempre as variáveis de ambiente apropriadas.