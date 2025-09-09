// Script para testar a edge function generate-questions
// Compara comportamento entre localhost e produção

const testData = {
  title: "Teste de Atividade",
  language: "portuguese",
  difficulty: "b1",
  topics: "Gramática básica, verbos regulares",
  questionsCount: 3,
  questionTypes: {
    multipleChoice: true,
    fillBlanks: false,
    trueFalse: false,
    openQuestions: false
  },
  timestamp: Date.now(),
  randomSeed: Math.random().toString(36).substring(7),
  sessionId: `test-${Date.now()}`
};

const SUPABASE_URL = 'https://zpyuqdsjkcysjwjmwgls.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpweXVxZHNqa2N5c2p3am13Z2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMzM0NTMsImV4cCI6MjA3MDcwOTQ1M30.jS9EYdRZXZLH42wxPdT1wRuvboQ-TW7u0sF9jWV4e8I';

async function testEdgeFunction(environment = 'production') {
  console.log(`\n=== Testando Edge Function (${environment}) ===`);
  console.log('URL:', SUPABASE_URL);
  console.log('Dados enviados:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testData)
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response (raw):', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('Response (parsed):', JSON.stringify(responseJson, null, 2));
      
      // Verificar se é mock data
      if (responseJson.questions && responseJson.questions.length > 0) {
        const firstQuestion = responseJson.questions[0];
        if (firstQuestion.question && firstQuestion.question.includes('Esta é uma questão de exemplo')) {
          console.log('⚠️  DETECTADO: Dados mock retornados!');
        } else {
          console.log('✅ Dados reais da OpenAI retornados');
        }
      }
      
      // Verificar metadados de variabilidade
      if (responseJson.metadata) {
        console.log('Metadados de variabilidade:', responseJson.metadata);
      }
      
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta:', parseError);
    }
    
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}

// Executar teste
if (typeof window === 'undefined') {
  // Node.js environment
  testEdgeFunction('production');
} else {
  // Browser environment
  window.testEdgeFunction = testEdgeFunction;
  console.log('Função testEdgeFunction disponível no console do browser');
  console.log('Execute: testEdgeFunction("production") para testar');
}

export { testEdgeFunction };