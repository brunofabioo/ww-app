import { useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { WordEditor } from '@/components/editor/WordEditor'
import { Clock } from 'lucide-react'

interface ExamData {
  title: string
  language: string
  difficulty: string
  topics: string[]
  questionCount: number
  questions: Array<{
    id: string
    type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'open'
    question: string
    options?: string[]
    correctAnswer?: string | boolean
  }>
}

function examToHtml(exam: ExamData): string {
  const formatDate = () => {
    const now = new Date()
    return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
  }

  let questionsHtml = ''
  exam.questions.forEach((question, index) => {
    const questionNumber = index + 1
    
    switch (question.type) {
      case 'multiple-choice':
        questionsHtml += `
          <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 10px;"><strong>${questionNumber}.</strong> ${question.question}</p>
            <div style="margin-left: 20px;">
              ${question.options?.map((option, i) => 
                `<p>${String.fromCharCode(97 + i)}) ${option}</p>`
              ).join('') || ''}
            </div>
          </div>
        `
        break
      
      case 'true-false':
        questionsHtml += `
          <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 10px;"><strong>${questionNumber}.</strong> ${question.question}</p>
            <div style="margin-left: 20px;">
              <p>( ) Verdadeiro</p>
              <p>( ) Falso</p>
            </div>
          </div>
        `
        break
        
      case 'fill-blank':
        const questionWithBlanks = question.question.replace(/\[blank\]/g, '_____')
        questionsHtml += `
          <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 10px;"><strong>${questionNumber}.</strong> ${questionWithBlanks}</p>
          </div>
        `
        break
        
      case 'open':
        questionsHtml += `
          <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>${questionNumber}.</strong> ${question.question}</p>
            <div style="margin-left: 20px; border: 1px solid #ccc; height: 100px; padding: 10px;">
              <p style="color: #666; font-style: italic;">Espaço para resposta:</p>
            </div>
          </div>
        `
        break
    }
  })

  return `
    <div style="max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; min-height: 297mm; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">${exam.title.toUpperCase()}</h1>
        <p style="margin-bottom: 5px;"><strong>Disciplina:</strong> ${exam.topics.join(', ')} | <strong>Nível:</strong> ${exam.difficulty} | <strong>Data:</strong> ${formatDate()}</p>
        <p style="margin-bottom: 5px;"><strong>Nome:</strong> ________________________________________________</p>
        <p><strong>Turma:</strong> _______ | <strong>Número:</strong> _______</p>
      </div>

      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background-color: #f9f9f9;">
        <h3 style="margin-bottom: 10px; font-weight: bold;">INSTRUÇÕES:</h3>
        <ul style="margin-left: 20px;">
          <li>Leia atentamente todas as questões antes de respondê-las.</li>
          <li>Use caneta azul ou preta para as respostas.</li>
          <li>Mantenha sua atividade organizada e com letra legível.</li>
          <li>Tempo sugerido: 2 horas.</li>
          <li>Atividade contém ${exam.questionCount} questões.</li>
        </ul>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">QUESTÕES</h2>
        ${questionsHtml}
      </div>

      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
        <p style="font-size: 12px; color: #666;">Página 1 de 1</p>
      </div>
    </div>
  `
}

export default function CriarAtividade4() {
  const location = useLocation()
  const [lastSaved, setLastSaved] = useState<string>('')

  // Tentar obter dados do exame da navegação
  const examData = location.state?.exam as ExamData | undefined

  const initialContent = examData ? examToHtml(examData) : `
    <div style="max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; min-height: 297mm; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">NOVA PROVA</h1>
        <p style="margin-bottom: 5px;"><strong>Disciplina:</strong> ________________ | <strong>Nível:</strong> ________________ | <strong>Data:</strong> ________________</p>
        <p style="margin-bottom: 5px;"><strong>Nome:</strong> ________________________________________________</p>
        <p><strong>Turma:</strong> _______ | <strong>Número:</strong> _______</p>
      </div>

      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background-color: #f9f9f9;">
        <h3 style="margin-bottom: 10px; font-weight: bold;">INSTRUÇÕES:</h3>
        <ul style="margin-left: 20px;">
          <li>Leia atentamente todas as questões antes de respondê-las.</li>
          <li>Use caneta azul ou preta para as respostas.</li>
          <li>Mantenha sua prova organizada e com letra legível.</li>
          <li>Tempo sugerido: 2 horas.</li>
        </ul>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">QUESTÕES</h2>
        <p>Adicione suas questões aqui...</p>
      </div>

      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
        <p style="font-size: 12px; color: #666;">Página 1 de 1</p>
      </div>
    </div>
  `

  const handleSave = (content: string) => {
    // Salvar no localStorage com timestamp
    const saveData = {
      content,
      timestamp: new Date().toISOString(),
      examData: examData || null
    }
    
    localStorage.setItem('editor-prova-latest', JSON.stringify(saveData))
    setLastSaved(new Date().toLocaleString('pt-BR'))
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 h-screen flex flex-col">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Editor de Prova</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {examData ? `Editando: ${examData.title}` : 'Criando nova prova'}
            </p>
          </div>
          {lastSaved && (
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-green-600 bg-green-50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">Salvo às {lastSaved}</span>
            </div>
          )}
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        <WordEditor
          initialContent={examData ? examToHtml(examData) : undefined}
          onSave={handleSave}
          className="flex-1"
        />
      </Card>
    </div>
  )
}