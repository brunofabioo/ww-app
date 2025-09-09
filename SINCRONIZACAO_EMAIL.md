# Sincronização de Email entre Auth e Users

Este documento explica como funciona a sincronização automática de emails entre a tabela `auth.users` e `public.users` no Supabase.

## Problema Resolvido

Quando um usuário altera seu email através do sistema de autenticação do Supabase, o email é atualizado apenas na tabela `auth.users`. A tabela `public.users` não é automaticamente sincronizada, causando inconsistência de dados.

## Solução Implementada

### 1. Funções SQL Criadas

#### `sync_auth_email_to_users(user_id UUID, new_email TEXT)`
- **Propósito**: Sincroniza o email de um usuário específico
- **Parâmetros**:
  - `user_id`: UUID do usuário
  - `new_email`: Novo endereço de email
- **Retorno**: `BOOLEAN` (true se a atualização foi bem-sucedida)

#### `sync_all_emails()`
- **Propósito**: Sincroniza todos os emails desatualizados
- **Retorno**: `INTEGER` (número de registros atualizados)

### 2. Integração no Frontend

O componente `Profile.tsx` foi atualizado para chamar automaticamente a função de sincronização após uma mudança de email bem-sucedida:

```typescript
// Sincronizar email na tabela public.users
try {
  const { data: user } = await supabase.auth.getUser();
  if (user.user) {
    const { error: syncError } = await supabase.rpc('sync_auth_email_to_users', {
      user_id: user.user.id,
      new_email: newEmail
    });
    
    if (syncError) {
      console.warn('Aviso: Email não foi sincronizado na tabela users:', syncError);
    }
  }
} catch (syncError) {
  console.warn('Aviso: Erro ao sincronizar email:', syncError);
}
```

## Como Usar

### Sincronização Manual de um Usuário

```sql
SELECT sync_auth_email_to_users('uuid-do-usuario', 'novo-email@exemplo.com');
```

### Sincronização de Todos os Usuários

```sql
SELECT sync_all_emails();
```

### Verificar Emails Desatualizados

```sql
SELECT 
  u.id,
  u.email as public_email,
  au.email as auth_email
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email IS DISTINCT FROM au.email;
```

## Limitações e Considerações

### Por que não usar Triggers?

Tentamos criar um trigger diretamente na tabela `auth.users`, mas o Supabase não permite modificações diretas nesta tabela por questões de segurança. A solução com funções RPC é mais segura e controlada.

### Alternativas Futuras

1. **Webhooks**: Configurar webhooks no Supabase Auth para capturar eventos de mudança de email
2. **Edge Functions**: Criar uma Edge Function que seja chamada automaticamente
3. **Triggers na tabela public.users**: Criar triggers que sincronizem na direção oposta

## Monitoramento

### Logs de Sincronização

O sistema registra avisos no console quando há problemas na sincronização, mas não interrompe o fluxo principal de mudança de email.

### Verificação de Integridade

Execute periodicamente a query de verificação para identificar emails desatualizados:

```sql
-- Contar emails desatualizados
SELECT COUNT(*) as emails_desatualizados
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email IS DISTINCT FROM au.email;
```

## Arquivos Relacionados

- `email-sync-trigger.sql`: Contém as funções SQL
- `client/pages/Profile.tsx`: Implementação no frontend
- `SINCRONIZACAO_EMAIL.md`: Esta documentação

## Manutenção

### Sincronização Periódica

Recomenda-se executar a função `sync_all_emails()` periodicamente (ex: diariamente) para garantir que todos os emails estejam sincronizados:

```sql
-- Executar via cron job ou scheduled function
SELECT sync_all_emails();
```

### Backup e Recuperação

Antes de executar sincronizações em massa, faça backup da tabela `public.users`:

```sql
-- Criar backup
CREATE TABLE users_backup AS SELECT * FROM public.users;

-- Restaurar se necessário
-- TRUNCATE public.users;
-- INSERT INTO public.users SELECT * FROM users_backup;
```

## Troubleshooting

### Erro: "function sync_auth_email_to_users does not exist"

1. Verifique se as funções foram criadas corretamente
2. Execute o arquivo `email-sync-trigger.sql` no SQL Editor do Supabase

### Sincronização não está funcionando

1. Verifique os logs do console no navegador
2. Teste a função manualmente no SQL Editor
3. Verifique as permissões RLS na tabela `public.users`

### Performance

Para grandes volumes de dados, considere:

1. Executar `sync_all_emails()` em horários de baixo tráfego
2. Implementar paginação na função se necessário
3. Monitorar o tempo de execução das queries