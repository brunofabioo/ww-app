#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 VERIFICANDO TABELAS CRIADAS NO SUPABASE\n')
console.log('📋 Projeto: WordWise App')
console.log(`🌐 URL: ${supabaseUrl}\n`)

async function verifyTables() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Lista de tabelas que devem existir após executar o SQL
    const expectedTables = [
      { name: 'users', description: 'Usuários do sistema' },
      { name: 'turmas', description: 'Turmas/Classes' },
      { name: 'materiais', description: 'Materiais didáticos' },
      { name: 'atividades', description: 'Atividades e provas' },
      { name: 'atividades_versions', description: 'Versões das atividades' },
      { name: 'drafts', description: 'Rascunhos de atividades' },
      { name: 'leads', description: 'Leads de contato' },
      { name: 'surveys', description: 'Pesquisas de usuários' },
      { name: 'example_table', description: 'Tabela de exemplo' }
    ]
    
    console.log('📊 VERIFICANDO TABELAS ESPERADAS:\n')
    
    let foundTables = 0
    let accessibleTables = 0
    
    for (const table of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .limit(1)
        
        if (!error) {
          foundTables++
          console.log(`✅ ${table.name}`)
          console.log(`   📝 ${table.description}`)
          
          // Tentar obter estrutura da tabela
          try {
            const { data: structureData, error: structureError } = await supabase
              .from(table.name)
              .select('*')
              .limit(0)
            
            if (!structureError && structureData) {
              accessibleTables++
              
              // Para tabelas específicas, tentar inserir um registro de teste
              if (table.name === 'users') {
                try {
                  const { data: insertData, error: insertError } = await supabase
                    .from(table.name)
                    .insert({
                      email: 'teste@wordwise.com',
                      full_name: 'Usuário de Teste WordWise',
                      role: 'student'
                    })
                    .select()
                  
                  if (!insertError && insertData && insertData.length > 0) {
                    console.log(`   📊 Colunas: ${Object.keys(insertData[0]).join(', ')}`)
                    console.log(`   ✅ Inserção de teste bem-sucedida`)
                    
                    // Remover o registro de teste
                    try {
                      await supabase
                        .from(table.name)
                        .delete()
                        .eq('email', 'teste@wordwise.com')
                      console.log(`   🧹 Registro de teste removido`)
                    } catch (e) {
                      console.log(`   ⚠️ Não foi possível remover o registro de teste`)
                    }
                  }
                } catch (e) {
                  console.log(`   ❌ Erro ao inserir registro de teste: ${e.message}`)
                }
              } else if (table.name === 'configuracoes') {
                // Para configurações, apenas verificar se há dados
                try {
                  const { data: configData, error: configError } = await supabase
                    .from(table.name)
                    .select('*')
                    .limit(5)
                  
                  if (!configError && configData) {
                    console.log(`   📊 ${configData.length} configurações encontradas`)
                    console.log(`   📝 Exemplos: ${configData.slice(0, 3).map(c => c.chave).join(', ')}`)
                  }
                } catch (e) {
                  console.log(`   ❌ Erro ao verificar configurações: ${e.message}`)
                }
              } else {
                console.log(`   📊 Tabela acessível`)
              }
            }
          } catch (e) {
            console.log(`   ❌ Erro ao verificar estrutura: ${e.message}`)
          }
        } else {
          console.log(`❌ ${table.name}`)
          console.log(`   📝 ${table.description}`)
          console.log(`   ❌ Erro: ${error.message}`)
        }
      } catch (e) {
        console.log(`❌ ${table.name}`)
        console.log(`   📝 ${table.description}`)
        console.log(`   ❌ Erro de acesso: ${e.message}`)
      }
      
      console.log('') // Linha em branco para separar
    }
    
    console.log('📊 RESUMO DA VERIFICAÇÃO:')
    console.log(`   • Tabelas esperadas: ${expectedTables.length}`)
    console.log(`   • Tabelas encontradas: ${foundTables}`)
    console.log(`   • Tabelas acessíveis: ${accessibleTables}`)
    console.log(`   • Tabelas com problemas: ${expectedTables.length - foundTables}`)
    
    if (foundTables === expectedTables.length) {
      console.log('\n🎉 SUCESSO! Todas as tabelas foram criadas e estão acessíveis!')
      console.log('✅ O WordWise App está pronto para uso!')
    } else if (foundTables > 0) {
      console.log('\n⚠️ ATENÇÃO: Algumas tabelas foram criadas, mas há problemas.')
      console.log('💡 Verifique os erros acima e execute o SQL novamente se necessário.')
    } else {
      console.log('\n❌ PROBLEMA: Nenhuma tabela foi encontrada.')
      console.log('💡 Execute o arquivo create-tables.sql no SQL Editor do Supabase.')
    }
    
    console.log('\n🔗 Para acessar o Supabase Dashboard:')
    console.log(`   ${supabaseUrl.replace('https://', 'https://app.supabase.com/project/')}`)
    
  } catch (err) {
    console.log('❌ Erro geral:', err.message)
  }
}

verifyTables()
