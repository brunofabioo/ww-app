# Deploy na Vercel - WordWise App

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Projeto conectado ao GitHub
- Configurações do Supabase

## 🚀 Processo de Deploy

### 1. Configuração do Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe seu repositório do GitHub
4. Configure as seguintes opções:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build:client`
   - **Output Directory**: `dist/spa`
   - **Install Command**: `npm install`

### 2. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente na Vercel:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui

# Builder.io (opcional)
VITE_PUBLIC_BUILDER_KEY=sua-chave-builder-aqui

# Environment
NODE_ENV=production
```

#### Como adicionar variáveis de ambiente na Vercel:

1. No dashboard do projeto, vá em **Settings**
2. Clique em **Environment Variables**
3. Adicione cada variável:
   - **Name**: Nome da variável (ex: `VITE_SUPABASE_URL`)
   - **Value**: Valor da variável
   - **Environment**: Selecione `Production`, `Preview` e `Development`

### 3. Configurações do Supabase

#### Obter credenciais do Supabase:

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings** > **API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

#### Configurar domínio na Vercel no Supabase:

1. No Supabase, vá em **Authentication** > **URL Configuration**
2. Adicione sua URL da Vercel em **Site URL**:
   ```
   https://seu-projeto.vercel.app
   ```
3. Adicione também em **Redirect URLs**:
   ```
   https://seu-projeto.vercel.app/**
   ```

### 4. Arquivos de Configuração

#### ✅ vercel.json (já configurado)
```json
{
  "version": 2,
  "buildCommand": "npm run build:client",
  "outputDirectory": "dist/spa",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

#### ✅ vite.config.ts (otimizado para chunks)
- Configurações de `manualChunks` implementadas
- Lazy loading configurado no App.tsx
- Chunks otimizados para evitar limite de 500kB

### 5. Deploy Automático

Após configurar:

1. Faça commit das alterações:
   ```bash
   git add .
   git commit -m "feat: configuração para deploy na Vercel"
   git push
   ```

2. A Vercel fará o deploy automaticamente
3. Acesse a URL fornecida pela Vercel

### 6. Verificações Pós-Deploy

- [ ] Site carrega corretamente
- [ ] Login/registro funcionando
- [ ] Conexão com Supabase ativa
- [ ] Todas as páginas acessíveis
- [ ] Funcionalidades do editor funcionando

### 🔧 Troubleshooting

#### Erro de Build:
- Verifique se todas as dependências estão instaladas
- Confirme se o comando de build está correto

#### Erro de Conexão com Supabase:
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o domínio da Vercel está configurado no Supabase

#### Chunks muito grandes:
- As configurações de `manualChunks` já estão otimizadas
- Lazy loading implementado para reduzir bundle inicial

### 📞 Suporte

Se encontrar problemas:
1. Verifique os logs de build na Vercel
2. Confirme as configurações de ambiente
3. Teste localmente com `npm run build:client`

---

**Status**: ✅ Projeto configurado e pronto para deploy na Vercel