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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  Clock,
} from "lucide-react";
import Layout from "@/components/Layout";
import QuestionsPreview from "@/components/QuestionsPreview";
import { Question } from "@/components/QuestionCard";
import { useDraftSave, DraftData } from "@/hooks/useDraftSave";

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

export default function CriarProva() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
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
  
  // Estados para o sistema de rascunho
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState<DraftData | null>(null);
  const [lastSaved, setLastSaved] = useState<string>("");
  
  // Estados para auto save na etapa de preview
  const [lastSavedPreview, setLastSavedPreview] = useState<string>("");
  
  // Hook para gerenciar rascunhos
  const { saveDraft, loadDraft, clearDraft, hasDraft } = useDraftSave();

  const totalSteps = 3;

  // Detectar rascunho salvo ao carregar a página
  useEffect(() => {
    const savedDraft = loadDraft();
    const isNewExam = searchParams.get('action') === 'new';
    
    if (savedDraft) {
      if (isNewExam) {
        // Só mostra o modal se o usuário clicou em "Nova Prova" e há rascunho
        setDraftData(savedDraft);
        setShowDraftModal(true);
      } else {
        // Se veio de "Continuar Edição", carrega o rascunho automaticamente
        setCurrentStep(savedDraft.currentStep);
        setFormData(savedDraft.formData);
        setLastSaved(savedDraft.lastSaved);
      }
    }
  }, [loadDraft, searchParams]);

  // Salvar automaticamente quando formData ou currentStep mudam
  useEffect(() => {
    // Só salva se não estiver no estado inicial
    if (formData.title || formData.language || formData.difficulty || formData.topics) {
      saveDraft(currentStep, formData);
      setLastSaved(new Date().toLocaleString('pt-BR'));
    }
  }, [formData, currentStep, saveDraft]);

  // Auto save para a etapa de preview das questões
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
          localStorage.setItem('criar-prova-preview', JSON.stringify(previewData));
          setLastSavedPreview(previewData.lastSaved);
          console.log('Preview salvo automaticamente:', previewData.lastSaved);
        } catch (error) {
          console.error('Erro ao salvar preview:', error);
        }
      };

      // Debounce de 2 segundos para evitar muitos saves
      const timeoutId = setTimeout(savePreviewData, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [generatedQuestions, formData]);

  // Função para restaurar rascunho
  const restoreDraft = () => {
    if (draftData) {
      setCurrentStep(draftData.currentStep);
      setFormData(draftData.formData);
      setLastSaved(draftData.lastSaved);
      setShowDraftModal(false);
    }
  };

  // Função para descartar rascunho
  const discardDraft = () => {
    clearDraft();
    setDraftData(null);
    setShowDraftModal(false);
  };

  const updateFormData = (field: keyof FormData | string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return (
          formData.title.trim() !== "" &&
          formData.language !== "" &&
          formData.difficulty !== ""
        );
      case 2:
        return (
          formData.topics.trim() !== "" &&
          Object.values(formData.questionTypes).some((type) => type)
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateExam = async () => {
    setIsGenerating(true);
    setGeneratedQuestions([]);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // Limpar rascunho após gerar prova com sucesso
    clearDraft();
    setLastSaved("");

    // Generate mock questions (same logic as before but simplified)
    const mockQuestions: Question[] = [];
    let questionCount = 0;

    if (formData.questionTypes.multipleChoice) {
      mockQuestions.push({
        id: `mc-${++questionCount}`,
        type: "multipleChoice",
        question: `Complete the sentence: "The teacher ___ very helpful yesterday."`,
        options: ["was", "were", "is", "are"],
        correctAnswer: 0,
        points: 2,
      });
    }

    if (formData.questionTypes.fillBlanks) {
      mockQuestions.push({
        id: `fb-${++questionCount}`,
        type: "fillBlanks",
        question: "The cat is ___ the table and the dog is ___ the chair.",
        correctAnswer: "on, under",
        points: 3,
      });
    }

    if (formData.questionTypes.trueFalse) {
      mockQuestions.push({
        id: `tf-${++questionCount}`,
        type: "trueFalse",
        question: "The past tense of 'go' is 'went'.",
        correctAnswer: "true",
        points: 1,
      });
    }

    if (formData.questionTypes.openQuestions) {
      mockQuestions.push({
        id: `oq-${++questionCount}`,
        type: "openQuestions",
        question:
          "Describe your daily routine using present simple tense. Write at least 5 sentences.",
        correctAnswer:
          "Sample answer should include present simple verbs and time expressions",
        points: 5,
      });
    }

    // Add more questions to reach desired count
    while (mockQuestions.length < formData.questionsCount) {
      const types = Object.entries(formData.questionTypes)
        .filter(([_, enabled]) => enabled)
        .map(([type]) => type);

      if (types.length === 0) break;

      const randomType = types[Math.floor(Math.random() * types.length)];

      if (randomType === "multipleChoice") {
        mockQuestions.push({
          id: `mc-${++questionCount}`,
          type: "multipleChoice",
          question: `Choose the correct form: "She ___ to the store every day."`,
          options: ["go", "goes", "going", "gone"],
          correctAnswer: 1,
          points: 2,
        });
      }
    }

    setGeneratedQuestions(mockQuestions);
    setIsGenerating(false);
  };

  // Question management functions
  const handleQuestionsReorder = (reorderedQuestions: Question[]) => {
    setGeneratedQuestions(reorderedQuestions);
  };

  const handleQuestionEdit = (questionId: string) => {
    console.log("Edit question:", questionId);
  };

  const handleQuestionDelete = (questionId: string) => {
    setGeneratedQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleRegenerateQuestions = () => {
    handleGenerateExam();
  };

  const handleAddQuestion = () => {
    console.log("Add new question");
  };

  const selectedLanguage = languages.find(
    (lang) => lang.value === formData.language,
  );
  const selectedDifficulty = difficultyLevels.find(
    (level) => level.value === formData.difficulty,
  );

  if (generatedQuestions.length > 0 || isGenerating) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setGeneratedQuestions([]);
                setIsGenerating(false);
                setCurrentStep(1);
                // Limpar preview salvo
                localStorage.removeItem('criar-prova-preview');
                setLastSavedPreview("");
              }}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Configuração
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/atividades')}
              className="text-slate-600 hover:text-slate-900"
            >
              Ir para Atividades
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Indicador de Auto Save para Preview */}
          {lastSavedPreview && (
            <div className="mb-4 flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Preview salvo automaticamente
                  </p>
                  <p className="text-xs text-green-600 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Última atualização: {lastSavedPreview}</span>
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('criar-prova-preview');
                  setLastSavedPreview("");
                }}
                className="text-green-700 hover:text-green-800 hover:bg-green-100"
              >
                Limpar Preview
              </Button>
            </div>
          )}

          <QuestionsPreview
            questions={generatedQuestions}
            examTitle={formData.title}
            language={selectedLanguage?.label || formData.language}
            difficulty={selectedDifficulty?.label || formData.difficulty}
            isGenerating={isGenerating}
            onQuestionsReorder={handleQuestionsReorder}
            onQuestionEdit={handleQuestionEdit}
            onQuestionDelete={handleQuestionDelete}
            onRegenerateQuestions={handleRegenerateQuestions}
            onAddQuestion={handleAddQuestion}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-100">
            <Sparkles className="w-4 h-4 text-brand-purple" />
            <span className="text-sm font-medium text-brand-purple">
              Powered by AI
            </span>
          </div>
          <h1 className="text-4xl font-jakarta font-bold text-slate-900">
            Criar Nova Prova
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Configure os parâmetros em 3 passos simples e deixe nossa IA gerar
            uma prova personalizada
          </p>
        </div>

        {/* Banner de Status do Rascunho */}
        {lastSaved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Save className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Rascunho salvo automaticamente
                </p>
                <p className="text-xs text-green-600 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Última atualização: {lastSaved}</span>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearDraft();
                setLastSaved("");
              }}
              className="text-green-700 hover:text-green-800 hover:bg-green-100"
            >
              Limpar Rascunho
            </Button>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step === currentStep
                    ? "bg-brand-purple text-white"
                    : step < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              <span
                className={`text-sm font-medium ${
                  step === currentStep
                    ? "text-brand-purple"
                    : step < currentStep
                      ? "text-green-600"
                      : "text-gray-500"
                }`}
              >
                {step === 1 ? "Básico" : step === 2 ? "Conteúdo" : "Gerar"}
              </span>
              {step < 3 && (
                <div
                  className={`w-16 h-0.5 ml-4 ${
                    step < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="border-0 bg-white/80 card-custom-shadow">
          <CardContent className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-jakarta font-bold text-slate-900">
                    Informações Básicas
                  </h2>
                  <p className="text-slate-600">
                    Defina o título, idioma e nível de dificuldade da sua prova
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <div className="md:col-span-2 space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-base font-medium text-slate-700"
                    >
                      Título da Prova
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ex: Avaliação de Inglês - Gramática Básica"
                      value={formData.title}
                      onChange={(e) => updateFormData("title", e.target.value)}
                      className="text-base h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium text-slate-700">
                      Idioma
                    </Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) =>
                        updateFormData("language", value)
                      }
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o idioma">
                          {selectedLanguage && (
                            <div className="flex items-center space-x-2">
                              <span>{selectedLanguage.flag}</span>
                              <span>{selectedLanguage.label}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <div className="flex items-center space-x-2">
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium text-slate-700">
                      Nível de Dificuldade
                    </Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) =>
                        updateFormData("difficulty", value)
                      }
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o nível">
                          {selectedDifficulty && (
                            <div className="flex items-center space-x-2">
                              <span>{selectedDifficulty.label}</span>
                              <span className="text-sm text-gray-500">
                                ({selectedDifficulty.description})
                              </span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center space-x-2">
                              <span>{level.label}</span>
                              <span className="text-sm text-gray-500">
                                ({level.description})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-base font-medium text-slate-700">
                      Vincular a uma Turma
                    </Label>
                    <Select
                      value={formData.turma}
                      onValueChange={(value) => updateFormData("turma", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione uma turma (opcional)">
                          {formData.turma && (
                            <span>
                              {
                                turmas.find((t) => t.value === formData.turma)
                                  ?.label
                              }
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {turmas.map((turma) => (
                          <SelectItem key={turma.value} value={turma.value}>
                            {turma.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Vincule esta prova a uma turma específica para organizar
                      melhor suas atividades
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Content Configuration */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-jakarta font-bold text-slate-900">
                    Conteúdo e Tipos de Questão
                  </h2>
                  <p className="text-slate-600">
                    Descreva os tópicos e escolha os tipos de questão para sua
                    prova
                  </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="topics"
                      className="text-base font-medium text-slate-700"
                    >
                      Tópicos e Conteúdo
                    </Label>
                    <Textarea
                      id="topics"
                      placeholder="Descreva os tópicos que devem ser abordados na prova...
Ex: Tempos verbais (presente, passado, futuro), vocabulário sobre família e trabalho, expressões idiomáticas básicas"
                      value={formData.topics}
                      onChange={(e) => updateFormData("topics", e.target.value)}
                      className="min-h-[120px] text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium text-slate-700">
                      Material Base (Opcional)
                    </Label>
                    <Select
                      value={formData.selectedMaterial}
                      onValueChange={(value) => updateFormData("selectedMaterial", value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione um material para basear a prova">
                          {formData.selectedMaterial && (
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-slate-500" />
                              <span>
                                {mockMaterials.find((m) => m.id === formData.selectedMaterial)?.title}
                              </span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {mockMaterials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            <div className="flex items-start space-x-3 py-1">
                              <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{material.title}</div>
                                {material.subject && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {material.subject}
                                  </Badge>
                                )}
                                <div className="text-xs text-slate-500 mt-1">
                                  {material.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Selecione um material uploadado para que a IA gere questões baseadas no conteúdo do documento
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium text-slate-700">
                        Quantidade de Questões
                      </Label>
                      <div className="flex items-center space-x-3">
                        <Input
                          type="number"
                          min="5"
                          max="50"
                          value={formData.questionsCount}
                          onChange={(e) =>
                            updateFormData(
                              "questionsCount",
                              parseInt(e.target.value) || 5,
                            )
                          }
                          className="w-20 h-12 text-center"
                        />
                        <span className="text-slate-600">questões</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-medium text-slate-700">
                      Tipos de Questão
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {questionTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <div
                            key={type.key}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              formData.questionTypes[
                                type.key as keyof typeof formData.questionTypes
                              ]
                                ? "border-brand-purple bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              updateFormData(
                                `questionTypes.${type.key}`,
                                !formData.questionTypes[
                                  type.key as keyof typeof formData.questionTypes
                                ],
                              )
                            }
                          >
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                id={type.key}
                                checked={
                                  formData.questionTypes[
                                    type.key as keyof typeof formData.questionTypes
                                  ]
                                }
                                onChange={() => {}}
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Icon className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium text-slate-700">
                                    {type.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {type.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Generate */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-jakarta font-bold text-slate-900">
                    Pronto para Gerar!
                  </h2>
                  <p className="text-slate-600">
                    Revise suas configurações e gere sua prova personalizada
                  </p>
                </div>

                <div className="max-w-2xl mx-auto">
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-100">
                    <CardContent className="p-6">
                      <h3 className="font-jakarta font-semibold text-slate-900 mb-4">
                        Resumo:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Título:</span>
                          <p className="font-medium text-slate-700 truncate">
                            {formData.title}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Idioma:</span>
                          <p className="font-medium text-slate-700">
                            {selectedLanguage?.flag} {selectedLanguage?.label}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Nível:</span>
                          <p className="font-medium text-slate-700">
                            {selectedDifficulty?.label} (
                            {selectedDifficulty?.description})
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Questões:</span>
                          <p className="font-medium text-slate-700">
                            {formData.questionsCount}
                          </p>
                        </div>
                        {formData.turma && formData.turma !== "none" && (
                          <div className="md:col-span-2">
                            <span className="text-slate-500">Turma:</span>
                            <p className="font-medium text-slate-700">
                              {
                                turmas.find((t) => t.value === formData.turma)
                                  ?.label
                              }
                            </p>
                          </div>
                        )}
                        {formData.topics && (
                          <div className="md:col-span-2">
                            <span className="text-slate-500">Tópicos e Conteúdo:</span>
                            <p className="font-medium text-slate-700 text-sm leading-relaxed">
                              {formData.topics}
                            </p>
                          </div>
                        )}
                        {formData.selectedMaterial && formData.selectedMaterial !== "none" && (
                          <div className="md:col-span-2">
                            <span className="text-slate-500">Material Base:</span>
                            <p className="font-medium text-slate-700">
                              {mockMaterials.find((m) => m.id === formData.selectedMaterial)?.title}
                            </p>
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <span className="text-slate-500">
                            Tipos selecionados:
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Object.entries(formData.questionTypes)
                              .filter(([_, enabled]) => enabled)
                              .map(([type]) => {
                                const config = questionTypes.find(
                                  (t) => t.key === type,
                                );
                                return (
                                  <Badge
                                    key={type}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {config?.label}
                                  </Badge>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="text-center mt-8">
                    <Button
                      onClick={handleGenerateExam}
                      className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Gerar Prova com IA
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                  className="bg-brand-purple hover:bg-brand-purple/90 px-6"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <div /> // Empty div for spacing
              )}
            </div>
          </CardContent>
        </Card>
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
                    <strong>Etapa:</strong> {draftData.currentStep} de 3
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
