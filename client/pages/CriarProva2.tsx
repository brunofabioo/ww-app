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
} from "lucide-react";
import Layout from "@/components/Layout";
import QuestionsPreview from "@/components/QuestionsPreview";
import { Question } from "@/components/QuestionCard";
import { useDraftSave, DraftData } from "@/hooks/useDraftSave";
import { useActivitiesSave } from "@/hooks/useActivitiesSave";

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
  { value: "portuguese", label: "Português", flag: "🇧🇷" },
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

export default function CriarProva2() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  
  // Hooks
  const { saveDraft, loadDraft, clearDraft, hasDraft } = useDraftSave();
  const { saveActivity } = useActivitiesSave();

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
          localStorage.setItem('criar-prova-2-preview', JSON.stringify(previewData));
          setLastSavedPreview(previewData.lastSaved);
        } catch (error) {
          console.error('Erro ao salvar preview:', error);
        }
      };

      const timeoutId = setTimeout(savePreviewData, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [generatedQuestions, formData]);

  // Função para salvar atividade
  const handleSaveActivity = async () => {
    if (!formData.title.trim()) {
      alert('Por favor, adicione um título para a prova.');
      return;
    }

    if (generatedQuestions.length === 0) {
      alert('Por favor, gere as questões antes de salvar.');
      return;
    }

    const activityData = {
      id: `activity-${Date.now()}`,
      title: formData.title,
      subject: formData.language,
      level: formData.difficulty,
      turma: formData.turma !== 'none' ? formData.turma : undefined,
      questionsCount: generatedQuestions.length,
      questions: generatedQuestions,
      createdAt: new Date().toISOString(),
      type: 'exam' as const,
      status: 'active' as const,
      topics: formData.topics,
      questionTypes: Object.entries(formData.questionTypes)
        .filter(([_, enabled]) => enabled)
        .map(([type]) => type),
      material: formData.selectedMaterial !== 'none' ? formData.selectedMaterial : undefined
    };

    const success = saveActivity(activityData);
    
    if (success) {
      alert('Prova salva com sucesso nas atividades!');
      // Limpar dados salvos
      clearDraft();
      localStorage.removeItem('criar-prova-2-preview');
      setLastSaved('');
      setLastSavedPreview('');
      // Redirecionar para atividades
      navigate('/atividades');
    } else {
      alert('Erro ao salvar a prova. Tente novamente.');
    }
  };

  // Função para gerar questões
  const handleGenerateExam = async () => {
    if (!isFormValid()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
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
    localStorage.removeItem('criar-prova-2-preview');
    setLastSavedPreview('');
  };

  const selectedLanguage = languages.find(l => l.value === formData.language);
  const selectedDifficulty = difficultyLevels.find(d => d.value === formData.difficulty);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Criar Prova - Layout Compacto</h1>
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
                                {turmas.map((turma) => (
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
                                {mockMaterials.map((material) => (
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
                              Gerar Prova com IA
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

          {/* Preview da Prova */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-4">

              <QuestionsPreview
                questions={generatedQuestions}
                examTitle={formData.title}
                language={selectedLanguage?.label || ''}
                difficulty={selectedDifficulty?.label || ''}
                isGenerating={isGenerating}
                onEditQuestion={(id, updatedQuestion) => {
                  setGeneratedQuestions(prev => 
                    prev.map(q => q.id === id ? { ...q, ...updatedQuestion } : q)
                  );
                }}
                onDeleteQuestion={(id) => {
                  setGeneratedQuestions(prev => prev.filter(q => q.id !== id));
                }}
                onAddQuestion={(newQuestion) => {
                  setGeneratedQuestions(prev => [...prev, { ...newQuestion, id: Date.now().toString() }]);
                }}
                onSaveActivity={handleSaveActivity}
              />
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
                <Button
                  onClick={() => setIsConfigOpen(true)}
                  variant="outline"
                  className="mx-auto"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Abrir Configurações
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}