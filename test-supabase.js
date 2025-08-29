#!/usr/bin/env node

/**
 * Script de Teste para Configuração do Supabase
 * Execute este script para verificar se sua configuração está funcionando
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

console.log('🔍 Verificando configuração do Supabase...\n')

// Verificar variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('📋 Variáveis de Ambiente:')
console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ Não configurada'}`)
console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada'}`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Erro: Variáveis de ambiente não configuradas!')
  console.log('Crie um arquivo .env na raiz do projeto com:')
  console.log('VITE_SUPABASE_URL=https://seu-projeto.supabase.co')
  console.log('VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui')
  process.exit(1)
}

// Testar conexão
console.log('\n🔌 Testando conexão com o Supabase...')

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Testar conexão básica
  const { data, error } = await supabase.from('example_table').select('count').limit(1)
  
  if (error) {
    console.log('❌ Erro na conexão:', error.message)
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Dica: A tabela "example_table" não existe.')
      console.log('Execute o SQL de configuração no Editor SQL do Supabase:')
      console.log(`
CREATE TABLE example_table (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública" ON example_table
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública" ON example_table
  FOR INSERT WITH CHECK (true);
      `)
    }
  } else {
    console.log('✅ Conexão bem-sucedida!')
    console.log('✅ Tabela "example_table" encontrada')
    console.log('✅ Configuração do Supabase funcionando perfeitamente!')
  }
  
} catch (err) {
  console.log('❌ Erro inesperado:', err.message)
  console.log('\n💡 Verifique:')
  console.log('1. Se as credenciais estão corretas')
  console.log('2. Se o projeto Supabase está ativo')
  console.log('3. Se não há problemas de rede')
}

console.log('\n📚 Para mais informações, consulte:')
console.log('- CONFIGURACAO_SUPABASE.md')
console.log('- SUPABASE_SETUP.md')
