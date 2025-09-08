import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Validar método HTTP
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Método não permitido'
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Parse do request body
    const config = await req.json();
    // Validar campos obrigatórios
    if (!config.title || !config.language || !config.difficulty) {
      return new Response(JSON.stringify({
        error: 'Campos obrigatórios faltando: title, language, difficulty'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Buscar chave da OpenAI dos secrets do Supabase
    const openaiApiKey = Deno.env.get('OpenAI');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({
        error: 'Chave da OpenAI não configurada. Configure OpenAI nos Edge Function Secrets.'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Log dos dados recebidos para debug
    console.log('Dados recebidos:', JSON.stringify(config, null, 2));
    console.log('Tipos de questões recebidos:', config.questionTypes);
    console.log('Tipo de questionTypes:', typeof config.questionTypes);
    console.log('questionTypes é objeto?', config.questionTypes && typeof config.questionTypes === 'object');
    // Verificar se questionTypes existe e é um objeto
    if (!config.questionTypes || typeof config.questionTypes !== 'object') {
      return new Response(JSON.stringify({
        error: 'Campo questionTypes é obrigatório e deve ser um objeto',
        received: config.questionTypes
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Construir tipos de questões selecionados
    const selectedTypes = [];
    if (config.questionTypes.multipleChoice) selectedTypes.push('multipleChoice');
    if (config.questionTypes.fillBlanks) selectedTypes.push('fillBlanks');
    if (config.questionTypes.trueFalse) selectedTypes.push('trueFalse');
    if (config.questionTypes.openQuestions) selectedTypes.push('openQuestions');
    console.log('Tipos selecionados processados:', selectedTypes);
    if (selectedTypes.length === 0) {
      return new Response(JSON.stringify({
        error: 'Pelo menos um tipo de questão deve ser selecionado'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Gerar variabilidade para evitar questões repetidas
    const timestamp = new Date().getTime();
    const randomSeed = Math.floor(Math.random() * 10000);
    const variabilityPrompts = [
      'Crie questões completamente diferentes das anteriores',
      'Use abordagens criativas e variadas para as questões',
      'Explore diferentes aspectos do tópico em cada questão',
      'Varie o estilo das questões mantendo a complexidade adequada ao nível',
      'Use exemplos e contextos diversos'
    ];
    const selectedVariability = variabilityPrompts[randomSeed % variabilityPrompts.length];
    // Construir prompt para o ChatGPT
    let materialInfo = '';
    if (config.materialConteudo) {
      materialInfo = `

**MATERIAL BASE PARA INSPIRAÇÃO:**
- Título do Material: ${config.materialTitulo}
- Assunto: ${config.materialConteudo.assunto}
- Descrição: ${config.materialConteudo.descricao}
- Tipo de Arquivo: ${config.materialConteudo.tipo}

**IMPORTANTE:** Use este material como base e inspiração para criar as questões. As questões devem estar relacionadas ao conteúdo deste material e complementar os tópicos especificados.`;
    }
    let turmaInfo = '';
    if (config.turmaNome) {
      turmaInfo = `
- Turma: ${config.turmaNome}`;
    }
    const prompt = `Você é um especialista em criação de atividades educacionais. 

**INSTRUÇÃO CRÍTICA:** Crie exatamente ${config.questionsCount} questões APENAS dos tipos especificados abaixo.

**IMPORTANTE - VARIABILIDADE:** ${selectedVariability}. Cada geração deve produzir questões únicas e originais.
**ID DE GERAÇÃO:** ${timestamp}-${randomSeed} (use para garantir originalidade)

**CONFIGURAÇÃO DA ATIVIDADE:**
- Título: ${config.title}
- Idioma: ${config.language}
- Nível: ${config.difficulty}${config.topics ? `
- Tópicos: ${config.topics}` : ''}${turmaInfo}${materialInfo}

**TIPOS DE QUESTÕES PERMITIDOS (APENAS ESTES):**
${selectedTypes.map((type)=>`- ${type}`).join('\n')}

**ATENÇÃO:** Você DEVE criar questões SOMENTE dos tipos listados acima. NÃO crie questões de outros tipos.

**DIRETRIZES DE ORIGINALIDADE:**
- Use vocabulário e exemplos variados
- Explore diferentes ângulos do mesmo tópico
- Varie a estrutura das frases
- Use contextos e cenários diversos
- Evite padrões repetitivos

**FORMATO DE RESPOSTA OBRIGATÓRIO:**
Retorne APENAS um JSON válido no formato exato abaixo:

{
  "questions": [
    {
      "id": "1",
      "type": "${selectedTypes[0]}",
      "question": "texto da questão",
      "options": ["opção 1", "opção 2", "opção 3", "opção 4"],
      "correctAnswer": "resposta correta"
    }
  ]
}

**REGRAS ESPECÍFICAS POR TIPO:**
${selectedTypes.includes('multipleChoice') ? '- multipleChoice: inclua array "options" com 4 alternativas' : ''}
${selectedTypes.includes('fillBlanks') ? '- fillBlanks: marque lacunas com [blank] na questão, sem array "options"' : ''}
${selectedTypes.includes('trueFalse') ? '- trueFalse: "correctAnswer" deve ser "true" ou "false", sem array "options"' : ''}
${selectedTypes.includes('openQuestions') ? '- openQuestions: questão dissertativa, sem array "options"' : ''}

**VALIDAÇÃO FINAL:**
- Total de questões: exatamente ${config.questionsCount}
- Tipos permitidos: ${selectedTypes.join(', ')}
- Idioma: ${config.language}
- Nível: ${config.difficulty}
- ID único: ${timestamp}-${randomSeed}`;
    console.log('Prompt enviado para OpenAI:', prompt);
    // Chamar a API do OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em criação de atividades educacionais. Sempre responda apenas com JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 10000,
        temperature: 0.9,
        top_p: 0.95
      })
    });
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('Erro da OpenAI API:', errorText);
      return new Response(JSON.stringify({
        error: `Erro da OpenAI API: ${openaiResponse.status} - ${errorText}`
      }), {
        status: openaiResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const data = await openaiResponse.json();
    console.log('Resposta completa da OpenAI:', JSON.stringify(data, null, 2));
    const aiResponse = data.choices?.[0]?.message?.content;
    console.log('Conteúdo da resposta da OpenAI:', aiResponse);
    if (!aiResponse) {
      return new Response(JSON.stringify({
        error: 'Resposta vazia da OpenAI'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Tentar parsear a resposta como JSON
    let parsedQuestions;
    try {
      // Limpar possíveis caracteres extras da resposta
      const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      console.log('Conteúdo limpo para parsing:', cleanResponse);
      parsedQuestions = JSON.parse(cleanResponse);
      console.log('Questões parseadas:', JSON.stringify(parsedQuestions, null, 2));
    } catch (parseError) {
      console.error('Erro ao parsear resposta da OpenAI:', aiResponse);
      return new Response(JSON.stringify({
        error: 'Erro ao processar resposta da IA. Tente novamente.',
        details: `Resposta recebida: ${aiResponse}`
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validar estrutura da resposta
    if (!parsedQuestions.questions || !Array.isArray(parsedQuestions.questions)) {
      return new Response(JSON.stringify({
        error: 'Formato de resposta inválido da IA'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validar se todas as questões são dos tipos permitidos
    const invalidQuestions = parsedQuestions.questions.filter((q)=>!selectedTypes.includes(q.type));
    if (invalidQuestions.length > 0) {
      console.error('Questões de tipos não permitidos encontradas:', invalidQuestions);
      console.error('Tipos permitidos:', selectedTypes);
      return new Response(JSON.stringify({
        error: `IA gerou questões de tipos não permitidos. Tipos encontrados: ${invalidQuestions.map((q)=>q.type).join(', ')}. Tipos permitidos: ${selectedTypes.join(', ')}`
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('Validação concluída: todas as questões são dos tipos permitidos');
    // Retornar as questões geradas
    return new Response(JSON.stringify({
      questions: parsedQuestions.questions,
      generatedAt: new Date().toISOString(),
      config: {
        title: config.title,
        language: config.language,
        difficulty: config.difficulty,
        questionsCount: config.questionsCount
      }
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Erro na edge function:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : null,
      name: error instanceof Error ? error.name : null
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
