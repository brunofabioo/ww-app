# Fix: Edge Function não funcionando na Vercel

## Problema Identificado

A edge function `generate-questions` estava funcionando corretamente no localhost, mas retornava dados mock na Vercel. Após investigação, foi identificado que o problema estava na configuração das variáveis de ambiente.

## Causa Raiz

O arquivo `vercel.json` não incluía as variáveis de ambiente necessárias para o Supabase:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PUBLIC_BUILDER_KEY`

Sem essas variáveis, o cliente Supabase na Vercel não conseguia se conectar corretamente com a edge function.

## Solução Implementada

### 1. Atualização do vercel.json

Adicionadas as variáveis de ambiente necessárias:

```json
{
  "env": {
    "NODE_ENV": "production",
    "VITE_SUPABASE_URL": "https://zpyuqdsjkcysjwjmwgls.supabase.co",
    "VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpweXVxZHNqa2N5c2p3am13Z2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMzM0NTMsImV4cCI6MjA3MDcwOTQ1M30.jS9EYdRZXZLH42wxPdT1wRuvboQ-TW7u0sF9jWV4e8I",
    "VITE_PUBLIC_BUILDER_KEY": "9cf14821ba6a445d9d559a08292b2042"
  }
}
```

### 2. Componente de Debug

Criado componente `DebugSupabase.tsx` para facilitar testes e diagnósticos:
- Verifica variáveis de ambiente
- Testa conexão com edge function
- Exibe logs detalhados
- Disponível apenas em desenvolvimento

### 3. Script de Teste

Criado `test-edge-function.js` para testar a edge function diretamente:
- Simula chamada real para a API
- Verifica se retorna dados mock ou reais
- Útil para debugging

## Verificação

Para confirmar que a edge function está funcionando:

1. **Teste direto**: Execute `node test-edge-function.js`
2. **No browser**: Use o componente de debug na página de criar atividade
3. **Logs da edge function**: Verifique os logs no Supabase Dashboard

## Próximos Passos

1. **Deploy na Vercel**: Faça um novo deploy para aplicar as mudanças
2. **Teste em produção**: Verifique se a geração de atividades funciona corretamente
3. **Monitoramento**: Use os logs do Supabase para monitorar o funcionamento

## Arquivos Modificados

- `vercel.json` - Adicionadas variáveis de ambiente
- `client/components/DebugSupabase.tsx` - Novo componente de debug
- `client/pages/CriarAtividade5.tsx` - Integração do componente de debug
- `test-edge-function.js` - Script de teste
- `supabase/functions/generate-questions/index.ts` - Melhorias na variabilidade

## Notas Importantes

- As chaves do Supabase são públicas (anon key) e podem ser expostas
- O componente de debug só aparece em desenvolvimento
- A edge function foi otimizada com estratégias de variabilidade
- Todos os testes confirmaram funcionamento correto da API OpenAI