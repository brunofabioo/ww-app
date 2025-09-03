const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAtividade() {
  try {
    console.log('🔄 Criando atividade de teste...');
    
    // Primeiro, vamos tentar fazer login ou usar um usuário existente
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('⚠️ Usuário não autenticado. Tentando criar atividade sem user_id...');
    }
    
    const testAtividade = {
      title: 'Atividade de Teste para Edição',
      description: 'Esta é uma atividade criada para testar a funcionalidade de edição',
      language: 'portuguese',
      difficulty: 'b1',
      topics: 'Gramática, Vocabulário, Compreensão',
      questions_count: 15,
      generate_multiple_versions: false,
      versions_count: 1,
      question_types: {
        multipleChoice: true,
        fillBlanks: true,
        trueFalse: false,
        openQuestions: true
      },
      turma_id: null,
      material_id: null,
      user_id: user?.id || null,
      content_html: '<h1>Atividade de Teste</h1><p>Esta é uma atividade criada para testar a funcionalidade de edição.</p><h2>Questão 1</h2><p>Complete a frase: O gato _____ no telhado.</p>',
      content_json: {},
      instructions_text: 'Complete as questões seguindo as instruções de cada seção.',
      instructions_json: {},
      is_favorite: false,
      status: 'published',
      version_number: 1
    };
    
    const { data, error } = await supabase
      .from('atividades')
      .insert(testAtividade)
      .select();
    
    if (error) {
      console.error('❌ Erro ao criar atividade:', error);
      return;
    }
    
    console.log('✅ Atividade de teste criada com sucesso!');
    console.log('📋 Dados da atividade:', data[0]);
    console.log('🔗 ID da atividade:', data[0].id);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTestAtividade();