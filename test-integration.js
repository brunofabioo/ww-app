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
      .from('users')
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
      title: 'Teste de Integração - Prova de Inglês',
      description: 'Prova criada automaticamente para testar a integração',
      language: 'english',
      difficulty: 'intermediate',
      topics: 'grammar, vocabulary',
      questions_count: 10,
      status: 'draft',
      instructions_text: 'Esta é uma prova de teste gerada pelo sistema'
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
    console.log('✅ Atividade criada:', atividade.title);

    // 3. Testar criação de versão da atividade
    console.log('\n3. Testando criação de versão da atividade...');
    const novaVersao = {
      atividade_id: atividade.id,
      version_number: 1,
      content_html: '<div><h2>Teste de Inglês</h2><p>Questão 1: What is the correct form of the verb "to be" for "I"?</p></div>',
      content_json: {
        questions: [
          {
            question: 'What is the correct form of the verb "to be" for "I"?',
            type: 'multiple_choice',
            options: ['am', 'is', 'are', 'be'],
            correct_answer: 'am'
          }
        ]
      }
    };

    const { data: versaoCriada, error: versaoError } = await supabase
      .from('atividades_versions')
      .insert(novaVersao)
      .select();

    if (versaoError) {
      console.error('❌ Erro ao criar versão:', versaoError.message);
      return;
    }
    console.log('✅ Versão da atividade criada');

    // 4. Testar busca de dados
    console.log('\n4. Testando busca de atividades...');
    const { data: atividades, error: buscaError } = await supabase
      .from('atividades')
      .select(`
        *,
        atividades_versions (*)
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
