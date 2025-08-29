// Teste de integração com Supabase - WordWise App
// Execute este arquivo com: node test-integration.js

const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase (usando variáveis de ambiente ou valores diretos)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anonima-aqui';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('seu-projeto') || supabaseAnonKey.includes('sua-chave')) {
  console.error('❌ Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  console.log('📝 Crie um arquivo .env com:');
  console.log('VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseIntegration() {
  console.log('🚀 Testando integração com Supabase...\n');

  try {
    // 1. Testar conexão básica
    console.log('1. Testando conexão básica...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('configuracoes')
      .select('*')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Erro na conexão:', healthError.message);
      return;
    }
    console.log('✅ Conexão estabelecida com sucesso');

    // 2. Testar inserção de uma atividade
    console.log('\n2. Testando criação de atividade...');
    const novaAtividade = {
      titulo: 'Teste de Integração - Prova de Inglês',
      descricao: 'Prova criada automaticamente para testar a integração',
      instrucoes: 'Esta é uma prova de teste gerada pelo sistema',
      tipo: 'prova',
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      valor_maximo: 10.0,
      status: 'ativa'
    };

    const { data: atividade, error: atividadeError } = await supabase
      .from('atividades')
      .insert(novaAtividade)
      .select()
      .single();

    if (atividadeError) {
      console.error('❌ Erro ao criar atividade:', atividadeError.message);
      return;
    }
    console.log('✅ Atividade criada:', atividade.titulo);

    // 3. Testar criação de questões
    console.log('\n3. Testando criação de questões...');
    const questoes = [
      {
        atividade_id: atividade.id,
        enunciado: 'What is the correct form of the verb "to be" for "I"?',
        tipo: 'multipla_escolha',
        opcoes: { options: ['am', 'is', 'are', 'be'] },
        resposta_correta: 'am',
        valor: 2.5,
        ordem: 1
      },
      {
        atividade_id: atividade.id,
        enunciado: 'Complete: She ___ a teacher.',
        tipo: 'dissertativa',
        resposta_correta: 'is',
        valor: 2.5,
        ordem: 2
      }
    ];

    const { data: questoesCriadas, error: questoesError } = await supabase
      .from('questoes')
      .insert(questoes)
      .select();

    if (questoesError) {
      console.error('❌ Erro ao criar questões:', questoesError.message);
      return;
    }
    console.log(`✅ ${questoesCriadas.length} questões criadas`);

    // 4. Testar busca de dados
    console.log('\n4. Testando busca de atividades...');
    const { data: atividades, error: buscaError } = await supabase
      .from('atividades')
      .select(`
        *,
        questoes (*)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (buscaError) {
      console.error('❌ Erro na busca:', buscaError.message);
      return;
    }
    console.log(`✅ ${atividades.length} atividades encontradas`);

    // 5. Limpar dados de teste
    console.log('\n5. Limpando dados de teste...');
    const { error: deleteError } = await supabase
      .from('atividades')
      .delete()
      .eq('id', atividade.id);

    if (deleteError) {
      console.error('❌ Erro ao limpar dados:', deleteError.message);
      return;
    }
    console.log('✅ Dados de teste removidos');

    console.log('\n🎉 Integração com Supabase funcionando perfeitamente!');
    console.log('\n📋 Resumo da integração:');
    console.log('   ✅ Conexão estabelecida');
    console.log('   ✅ Criação de atividades');
    console.log('   ✅ Criação de questões');
    console.log('   ✅ Busca de dados');
    console.log('   ✅ Remoção de dados');
    console.log('\n🚀 O WordWise App está pronto para usar o Supabase!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.log('\n🔧 Verifique:');
    console.log('   1. Se as tabelas foram criadas no Supabase');
    console.log('   2. Se as variáveis de ambiente estão corretas');
    console.log('   3. Se as políticas RLS estão configuradas');
  }
}

// Executar teste
testSupabaseIntegration();
