import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sparkles,
  FileText,
  Globe,
  Hash,
  CheckSquare,
  Edit3,
  HelpCircle,
  BookOpen,
  Brain,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
  Save,
  Clock,
  ArrowLeft,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Layout from "@/components/Layout";
import QuestionsPreview from "@/components/QuestionsPreview";
import { Question } from "@/components/QuestionCard";
import { useDraftSave, DraftData } from "@/hooks/useDraftSave";
import { useActivitiesSave } from "@/hooks/useActivitiesSave";
import { WordEditor } from "@/components/editor/WordEditor";
import { useToast } from "@/hooks/use-toast";
// Importar hooks do Supabase
import { useProva, useMateriais, useTurmas } from "@/hooks/useSupabase";
import type { Atividade, Questao, Material, Turma } from "@/lib/supabase";

interface FormData {
  title: string;
  language: string;
  difficulty: string;
  turma: string;
  topics: string;
  selectedMaterial: string;
  questionsCount: number;
  generateMultipleVersions: boolean;
  versionsCount: number;
  questionTypes: {
    multipleChoice: boolean;
    fillBlanks: boolean;
    trueFalse: boolean;
    openQuestions: boolean;
  };
}

const languages = [
  { value: "portuguese", label: "Portugu��s", flag: "🇧🇷" },
  { value: "english", label: "English", flag: "🇺🇸" },
  { value: "spanish", label: "Español", flag: "🇪🇸" },
  { value: "french", label: "Français", flag: "🇫🇷" },
  { value: "german", label: "Deutsch", flag: "🇩🇪" },
  { value: "italian", label: "Italiano", flag: "🇮🇹" },
];

const difficultyLevels = [
  { value: "a1", label: "A1", description: "Básico" },
  { value: "a2", label: "A2", description: "Pré-intermediário" },
  { value: "b1", label: "B1", description: "Intermediário" },
  { value: "b2", label: "B2", description: "Intermediário superior" },
  { value: "c1", label: "C1", description: "Avançado" },
  { value: "c2", label: "C2", description: "Proficiente" },
];

const turmas = [
  { value: "none", label: "Nenhuma Turma (Opcional)" },
  { value: "turma-a-ingles", label: "Turma A - Inglês Básico" },
  { value: "turma-b-matematica", label: "Turma B - Matemática 9º Ano" },
  { value: "turma-c-historia", label: "Turma C - História Ensino Médio" },
];

const questionTypes = [
  {
    key: "multipleChoice",
    icon: CheckSquare,
    label: "Múltipla Escolha",
    description: "Questões com alternativas A, B, C, D",
  },
  {
    key: "fillBlanks",
    icon: Edit3,
    label: "Preencher Lacunas",
    description: "Complete as frases com palavras corretas",
  },
  {
    key: "trueFalse",
    icon: HelpCircle,
    label: "Verdadeiro/Falso",
    description: "Afirmações para marcar V ou F",
  },
  {
    key: "openQuestions",
    icon: BookOpen,
    label: "Questões Abertas",
    description: "Questões dissertativas ou de resposta livre",
  },
];

const mockMaterials = [
  {
    id: "none",
    title: "Nenhum Material (Opcional)",
    type: "none",
    subject: "",
    description: "Criar prova sem material base"
  },
  {
    id: "material-1",
    title: "Gramática Inglesa - Tempos Verbais.pdf",
    type: "pdf",
    subject: "Inglês",
    description: "Material sobre present, past e future tenses"
  },
  {
    id: "material-2",
    title: "História do Brasil - República.docx",
    type: "docx",
    subject: "História",
    description: "Conteúdo sobre a República Velha e Era Vargas"
  },
  {
    id: "material-3",
    title: "Matemática - Funções Quadráticas.txt",
    type: "txt",
    subject: "Matemática",
    description: "Teoria e exercícios sobre funções do 2º grau"
  },
  {
    id: "material-4",
    title: "Literatura Brasileira - Romantismo.pdf",
    type: "pdf",
    subject: "Literatura",
    description: "Características e principais autores românticos"
  }
];

// Função para converter questões para HTML
function questionsToHtml(formData: FormData, questions: Question[]): string {
  const formatDate = () => {
    const now = new Date()
    return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`
  }

  const selectedLanguage = languages.find(l => l.value === formData.language)?.label || formData.language
  const selectedDifficulty = difficultyLevels.find(d => d.value === formData.difficulty)?.description || formData.difficulty
  const selectedTurma = turmas.find(t => t.value === formData.turma)?.label || formData.turma

  let questionsHtml = ''
  questions.forEach((question, index) => {
    const questionNumber = index + 1
    
    switch (question.type) {
      case 'multipleChoice':
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
      
      case 'trueFalse':
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
        
      case 'fillBlanks':
        const questionWithBlanks = question.question.replace(/\[blank\]/g, '_____')
        questionsHtml += `
          <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 10px;"><strong>${questionNumber}.</strong> ${questionWithBlanks}</p>
          </div>
        `
        break
        
      case 'openQuestions':
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
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">${formData.title.toUpperCase()}</h1>
        <p style="margin-bottom: 5px;"><strong>Disciplina:</strong> ${selectedLanguage} | <strong>Nível:</strong> ${selectedDifficulty} | <strong>Data:</strong> ${formatDate()}</p>
        <p style="margin-bottom: 5px;"><strong>Nome:</strong> ________________________________________________</p>
        <p><strong>Turma:</strong> ${formData.turma !== 'none' ? selectedTurma : '_______'} | <strong>Número:</strong> _______</p>
      </div>

      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background-color: #f9f9f9;">
        <h3 style="margin-bottom: 10px; font-weight: bold;">INSTRUÇÕES:</h3>
        <ul style="margin-left: 20px;">
          <li>Leia atentamente todas as questões antes de respondê-las.</li>
          <li>Use caneta azul ou preta para as respostas.</li>
          <li>Mantenha sua prova organizada e com letra legível.</li>
          <li>Tempo sugerido: 2 horas.</li>
          <li>Prova contém ${questions.length} questões.</li>
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

export default function CriarProva5() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = searchParams.get('edit') === 'true';
  const [formData, setFormData] = useState<FormData>({
    title: "",
    language: "",
    difficulty: "",
    turma: "",
    topics: "",
    selectedMaterial: "",
    questionsCount: 10,
    generateMultipleVersions: false,
    versionsCount: 2,
    questionTypes: {
      multipleChoice: true,
      fillBlanks: false,
      trueFalse: false,
      openQuestions: false,
    },
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [lastSavedPreview, setLastSavedPreview] = useState<string>("");
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState<string>("");
  const [lastSavedEditor, setLastSavedEditor] = useState<string>("");
  
  // Estados para o modal de rascunho
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState<DraftData | null>(null);
  const [isNewExam, setIsNewExam] = useState(true);
  
  // Hooks
  const { saveDraft, loadDraft, clearDraft, hasDraft } = useDraftSave();
  const { saveActivity } = useActivitiesSave();
  const { toast } = useToast();
  
  // Hooks do Supabase
  const { createProva, loading: provaLoading, error: provaError } = useProva();
  const { materiais, loading: materiaisLoading } = useMateriais();
  const { turmas, loading: turmasLoading } = useTurmas();

  // Auto save quando formData muda
  useEffect(() => {
    if (formData.title || formData.language || formData.difficulty || formData.topics) {
      saveDraft(1, formData);
      setLastSaved(new Date().toLocaleString('pt-BR'));
    }
  }, [formData, saveDraft]);

  // Auto save para preview das questões
  useEffect(() => {
    if (generatedQuestions.length > 0) {
      const savePreviewData = () => {
        const previewData = {
          formData,
          generatedQuestions,
          timestamp: Date.now(),
          lastSaved: new Date().toLocaleString('pt-BR')
        };
        
        try {
          localStorage.setItem('criar-prova-5-preview', JSON.stringify(previewData));
          setLastSavedPreview(previewData.lastSaved);
        } catch (error) {
          console.error('Erro ao salvar preview:', error);
        }
      };

      const timeoutId = setTimeout(savePreviewData, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [generatedQuestions, formData]);

  // Verificar se existe rascunho ao carregar a página
  useEffect(() => {
    const checkForDraft = () => {
      // Verificar se é uma nova prova (não vem de edição)
      const isNew = !searchParams.get('edit');
      setIsNewExam(isNew);
      
      if (isNew && hasDraft()) {
        const draft = loadDraft();
        if (draft) {
          setDraftData(draft);
          setShowDraftModal(true);
        }
      } else if (!isNew) {
        // Se vem de edição (continuar edição), carregar automaticamente
        if (hasDraft()) {
          const draft = loadDraft();
          if (draft) {
            setFormData(draft.formData);
            setLastSaved(draft.lastSaved);
            
            // Tentar carregar preview das questões se existir
            try {
              const savedPreview = localStorage.getItem('criar-prova-5-preview');
              if (savedPreview) {
                const previewData = JSON.parse(savedPreview);
                if (previewData.generatedQuestions) {
                  setGeneratedQuestions(previewData.generatedQuestions);
                  setLastSavedPreview(previewData.lastSaved);
                  
                  // Converter questões para HTML e abrir no editor
                  const htmlContent = questionsToHtml(draft.formData, previewData.generatedQuestions);
                  setEditorContent(htmlContent);
                  setShowEditor(true);
                  setIsConfigOpen(false); // Recolher configurações se já há questões
                } else {
                  // Se não há questões geradas, manter configurações expandidas
                  setShowEditor(false);
                  setIsConfigOpen(true);
                }
              } else {
                // Se não há preview salvo, manter configurações expandidas
                setShowEditor(false);
                setIsConfigOpen(true);
              }
            } catch (error) {
              console.error('Erro ao carregar preview:', error);
              // Em caso de erro, manter configurações expandidas
              setShowEditor(false);
              setIsConfigOpen(true);
            }
          }
        }
      }
    };

    checkForDraft();
  }, [searchParams, hasDraft, loadDraft]);

  // Função para restaurar rascunho
  const restoreDraft = () => {
    if (draftData) {
      setFormData(draftData.formData);
      setLastSaved(draftData.lastSaved);
      
      // Tentar carregar preview das questões se existir
      try {
        const savedPreview = localStorage.getItem('criar-prova-5-preview');
        if (savedPreview) {
          const previewData = JSON.parse(savedPreview);
          if (previewData.generatedQuestions) {
            setGeneratedQuestions(previewData.generatedQuestions);
            setLastSavedPreview(previewData.lastSaved);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar preview:', error);
      }
    }
    setShowDraftModal(false);
  };

  // Função para descartar rascunho
  const discardDraft = () => {
    clearDraft();
    localStorage.removeItem('criar-prova-5-preview');
    setDraftData(null);
    setShowDraftModal(false);
  };

  // Função para salvar atividade no Supabase
  const handleSaveActivity = async () => {
    console.log('Iniciando salvamento da prova...');
    
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, adicione um título para a prova.",
        variant: "destructive",
      });
      return;
    }

    if (generatedQuestions.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, gere as questões antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('FormData:', formData);
      console.log('Generated Questions:', generatedQuestions);
      
      // Converter questões para o formato do Supabase (apenas campos básicos)
      const questoesSupabase = generatedQuestions.map((q, index) => ({
        enunciado: q.question,
        tipo: mapQuestionType(q.type),
        opcoes: q.options ? { options: q.options } : null,
        resposta_correta: String(q.correctAnswer || '')
      }));

      console.log('Questões convertidas para Supabase:', questoesSupabase);

      // Preparar dados da atividade (apenas campos básicos)
      const atividadeData = {
        titulo: formData.title,
        descricao: formData.topics,
        instrucoes: `Prova de ${formData.language} - Nível ${formData.difficulty}`
      };

      console.log('Dados da atividade preparados:', atividadeData);

      // Criar prova no Supabase
      console.log('Chamando createProva...');
      const { atividade, questoes } = await createProva(atividadeData, questoesSupabase);
      console.log('Prova criada com sucesso:', { atividade, questoes });

      toast({
        title: "Sucesso!",
        description: "Prova salva com sucesso no Supabase!",
        variant: "default",
      });

      // Limpar dados salvos
      clearDraft();
      localStorage.removeItem('criar-prova-5-preview');
      setLastSaved('');
      setLastSavedPreview('');
      
      // Redirecionar para atividades
      navigate('/atividades');
      
    } catch (error) {
      console.error('Erro ao salvar prova:', error);
      console.error('Erro detalhado:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        provaError
      });

      const description = (error instanceof Error && error.message) ? error.message : (provaError || "Erro ao salvar a prova. Tente novamente.");
      toast({
        title: "Erro",
        description,
        variant: "destructive",
      });
    }
  };

  // Função para mapear tipos de questão para o formato do Supabase
  const mapQuestionType = (type: string): 'multipla_escolha' | 'verdadeiro_falso' | 'dissertativa' | 'numerica' => {
    switch (type) {
      case 'multipleChoice':
        return 'multipla_escolha';
      case 'trueFalse':
        return 'verdadeiro_falso';
      case 'fillBlanks':
      case 'openQuestions':
        return 'dissertativa';
      default:
        return 'dissertativa';
    }
  };

  // Função para gerar questões
  const handleGenerateExam = async () => {
    if (!isFormValid()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simular geração de questões
    setTimeout(() => {
      const mockQuestions: Question[] = [
        {
          id: '1',
          type: 'multipleChoice',
          question: 'Qual é a forma correta do verbo "to be" na terceira pessoa do singular no presente?',
          options: ['am', 'is', 'are', 'be'],
          correctAnswer: 'is'
        },
        {
          id: '2',
          type: 'fillBlanks',
          question: 'Complete a frase: "She ___ a teacher."',
          correctAnswer: 'is'
        },
        {
          id: '3',
          type: 'trueFalse',
          question: 'O verbo "to be" no passado para "I" é "was".',
          correctAnswer: 'true'
        }
      ];
      
      setGeneratedQuestions(mockQuestions);
      
      // Converter questões para HTML e mostrar no editor
      const htmlContent = questionsToHtml(formData, mockQuestions);
      setEditorContent(htmlContent);
      setShowEditor(true);
      
      setIsGenerating(false);
      setIsConfigOpen(false); // Recolher configurações após gerar
    }, 2000);
  };

  // Validação do formulário
  const isFormValid = () => {
    return formData.title.trim() && 
           formData.language && 
           formData.difficulty && 
           formData.topics.trim() &&
           Object.values(formData.questionTypes).some(Boolean);
  };

  // Handlers para atualizar form data
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateQuestionType = (type: keyof FormData['questionTypes'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: {
        ...prev.questionTypes,
        [type]: checked
      }
    }));
  };

  // Função para limpar preview
  const clearPreview = () => {
    localStorage.removeItem('criar-prova-5-preview');
    setLastSavedPreview('');
  };

  // Função para salvar conteúdo do editor
  const handleEditorSave = (content: string) => {
    const saveData = {
      content,
      timestamp: new Date().toISOString(),
      formData,
      generatedQuestions
    };
    
    localStorage.setItem('editor-prova-5-latest', JSON.stringify(saveData));
    setLastSavedEditor(new Date().toLocaleString('pt-BR'));
  };

  // Função para voltar às configurações
  const handleBackToConfig = () => {
    setShowEditor(false);
    setIsConfigOpen(true);
  };

  const selectedLanguage = languages.find(l => l.value === formData.language);
  const selectedDifficulty = difficultyLevels.find(d => d.value === formData.difficulty);

  // Carregar materiais e turmas do Supabase
  const materiaisDisponiveis = [
    {
      id: "none",
      title: "Nenhum Material (Opcional)",
      type: "none",
      subject: "",
      description: "Criar prova sem material base"
    },
    ...(materiais || []).map(material => ({
      id: material.id,
      title: material.titulo,
      type: material.tipo,
      subject: material.descricao || "",
      description: material.descricao || ""
    }))
  ];

  const turmasDisponiveis = [
    { value: "none", label: "Nenhuma Turma (Opcional)" },
    ...(turmas || []).map(turma => ({
      value: turma.id,
      label: turma.nome
    }))
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edição da Prova' : 'Criar Prova'}</h1>
                <p className="text-gray-600 mt-1">Configure e visualize sua prova em tempo real</p>
              </div>
              {lastSaved && (
                <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>Salvo automaticamente às {lastSaved}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configurações Recolhíveis */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <Card className="mb-6">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-purple-600" />
                      <CardTitle>Configurações da Prova</CardTitle>
                    </div>
                    {isConfigOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna 1: Campos principais */}
                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        {/* Linha 1: Título da Prova e Idioma */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="title" className="text-sm font-bold text-gray-900">Título da Prova <span className="text-red-500">*</span></Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => updateFormData('title', e.target.value)}
                              placeholder="Ex: Prova de Inglês - Tempos Verbais"
                              className="mt-1 border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400"
                            />
                          </div>
                          <div>
                            <Label htmlFor="language" className="text-sm font-bold text-gray-900">Idioma <span className="text-red-500">*</span></Label>
                            <Select value={formData.language} onValueChange={(value) => updateFormData('language', value)}>
                              <SelectTrigger className="mt-1 border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400">
                                <SelectValue placeholder="Selecione o idioma" />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map((lang) => (
                                  <SelectItem key={lang.value} value={lang.value}>
                                    <span className="flex items-center space-x-2">
                                      <span>{lang.flag}</span>
                                      <span>{lang.label}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Linha 2: Nível de Dificuldade e Turma */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="difficulty" className="text-sm font-bold text-gray-900">Nível de Dificuldade <span className="text-red-500">*</span></Label>
                            <Select value={formData.difficulty} onValueChange={(value) => updateFormData('difficulty', value)}>
                              <SelectTrigger className="mt-1 border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400">
                                <SelectValue placeholder="Selecione o nível" />
                              </SelectTrigger>
                              <SelectContent>
                                {difficultyLevels.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    <span className="flex items-center space-x-2">
                                      <span className="font-medium">{level.label}</span>
                                      <span className="text-gray-500">({level.description})</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="turma" className="text-sm font-bold text-gray-900">Turma</Label>
                            <Select value={formData.turma} onValueChange={(value) => updateFormData('turma', value)}>
                              <SelectTrigger className="mt-1 border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400">
                                <SelectValue placeholder="Selecione a turma" />
                              </SelectTrigger>
                              <SelectContent>
                                {turmasDisponiveis.map((turma) => (
                                  <SelectItem key={turma.value} value={turma.value}>
                                    {turma.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Linha 3: Tópicos e Conteúdo (campo largo) */}
                        <div>
                          <Label htmlFor="topics" className="text-sm font-bold text-gray-900">Tópicos e Conteúdo <span className="text-red-500">*</span></Label>
                          <Textarea
                            id="topics"
                            value={formData.topics}
                            onChange={(e) => updateFormData('topics', e.target.value)}
                            placeholder="Descreva os tópicos que devem ser abordados na prova..."
                            className="mt-1 min-h-[80px] border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400"
                          />
                        </div>

                        {/* Linha 4: Material Base e Número de Questões */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="material" className="text-sm font-bold text-gray-900">Material Base</Label>
                            <Select value={formData.selectedMaterial} onValueChange={(value) => updateFormData('selectedMaterial', value)}>
                              <SelectTrigger className="mt-1 border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400">
                                <SelectValue placeholder="Selecione um material" />
                              </SelectTrigger>
                              <SelectContent>
                                {materiaisDisponiveis.map((material) => (
                                  <SelectItem key={material.id} value={material.id}>
                                    <div className="flex flex-col">
                                      <span>{material.title}</span>
                                      {material.description && (
                                        <span className="text-xs text-gray-500">{material.description}</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="questionsCount" className="text-sm font-bold text-gray-900">Número de Questões</Label>
                            <Input
                              id="questionsCount"
                              type="number"
                              min="1"
                              max="50"
                              value={formData.questionsCount}
                              onChange={(e) => updateFormData('questionsCount', parseInt(e.target.value) || 10)}
                              className="mt-1 border-purple-200 rounded-lg focus:border-purple-400 focus:ring-purple-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Coluna 2: Tipos de Questões */}
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-gray-900">Tipos de Questões <span className="text-red-500">*</span></Label>
                      
                      <div className="space-y-2">
                        {questionTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <div 
                              key={type.key} 
                              className="flex items-start space-x-2 p-2 border border-purple-100 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                              onClick={() => updateQuestionType(type.key as keyof FormData['questionTypes'], !formData.questionTypes[type.key as keyof FormData['questionTypes']])}
                            >
                              <Checkbox
                                id={type.key}
                                checked={formData.questionTypes[type.key as keyof FormData['questionTypes']]}
                                onCheckedChange={(checked) => updateQuestionType(type.key as keyof FormData['questionTypes'], checked as boolean)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Icon className="w-4 h-4 text-purple-600" />
                                  <span className="font-medium text-sm">{type.label}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Botão para gerar/regerar prova */}
                      <div className="mt-4">
                        <Button
                          onClick={handleGenerateExam}
                          disabled={!isFormValid() || isGenerating}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg"
                        >
                          {isGenerating ? (
                            <>
                              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                              Gerando Prova...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              {generatedQuestions.length > 0 ? 'Regerar' : 'Gerar Prova com IA'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Nota sobre campos obrigatórios */}
                  <div className="flex justify-end mt-4">
                    <p className="text-xs text-red-500">* campos obrigatórios</p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Editor de Prova */}
          {showEditor && (
            <div className="mt-6 flex-1 flex flex-col">
              {/* Header do Editor */}
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div>
                  </div>

                </div>
              </div>

              {/* WordEditor */}
              <Card className="flex-1 flex flex-col">
                <WordEditor
                  initialContent={editorContent}
                  onSave={handleEditorSave}
                  className="flex-1"
                />
              </Card>

              {/* Botões de Ação */}
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Limpar todos os dados da prova
                    setShowEditor(false);
                    setGeneratedQuestions([]);
                    setEditorContent("");
                    setLastSaved("");
                    setLastSavedPreview("");
                    setLastSavedEditor("");
                    
                    // Limpar rascunho e dados salvos
                    clearDraft();
                    localStorage.removeItem('criar-prova-5-preview');
                    localStorage.removeItem('editor-prova-5-latest');
                    
                    // Redirecionar para atividades
                    navigate('/atividades');
                  }}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Descartar Prova
                </Button>
                
                <Button 
                  onClick={handleSaveActivity}
                  disabled={provaLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {provaLoading ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Aprovar e Salvar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Estado vazio */}
          {generatedQuestions.length === 0 && !isGenerating && (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Pronta para gerar sua prova?
                </h3>
                <p className="text-gray-600 mb-6">
                  Preencha as configurações acima e clique em "Gerar Prova com IA" para começar.
                </p>

              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Confirmação para Restaurar Rascunho */}
      <AlertDialog open={showDraftModal} onOpenChange={setShowDraftModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Save className="w-5 h-5 text-blue-600" />
              <span>Rascunho Encontrado</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Encontramos um rascunho não salvo da sua prova anterior. Deseja continuar de onde parou ou começar uma nova prova?
              {draftData && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="text-sm">
                    <strong>Título:</strong> {draftData.formData.title || "Sem título"}
                  </div>
                  <div className="text-sm">
                    <strong>Idioma:</strong> {languages.find(l => l.value === draftData.formData.language)?.label || "Não definido"}
                  </div>
                  <div className="text-sm">
                    <strong>Salvo em:</strong> {draftData.lastSaved}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={discardDraft}>
              Começar do Zero
            </AlertDialogCancel>
            <AlertDialogAction onClick={restoreDraft}>
              Continuar Rascunho
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
