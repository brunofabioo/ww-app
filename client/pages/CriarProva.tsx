import { useState, useEffect } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles,
  FileText,
  Globe,
  BarChart3,
  Hash,
  Copy,
  CheckSquare,
  Edit3,
  HelpCircle,
  BookOpen,
  Brain,
  Zap
} from "lucide-react";
import Layout from "@/components/Layout";
import QuestionsPreview from "@/components/QuestionsPreview";
import { Question } from "@/components/QuestionCard";

interface FormData {
  title: string;
  language: string;
  difficulty: number;
  topics: string;
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
  { value: "chinese", label: "中文", flag: "🇨🇳" },
  { value: "japanese", label: "日本語", flag: "🇯🇵" },
];

const difficultyLevels = [
  { value: 1, label: "A1", description: "Iniciante" },
  { value: 2, label: "A2", description: "Básico" },
  { value: 3, label: "B1", description: "Intermediário" },
  { value: 4, label: "B2", description: "Intermediário Superior" },
  { value: 5, label: "C1", description: "Avançado" },
  { value: 6, label: "C2", description: "Proficiente" },
];

const questionTypeIcons = {
  multipleChoice: CheckSquare,
  fillBlanks: Edit3,
  trueFalse: HelpCircle,
  openQuestions: BookOpen,
};

export default function CriarProva() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    language: "",
    difficulty: 3,
    topics: "",
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

  const [isFormValid, setIsFormValid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  // Validate form
  useEffect(() => {
    const { title, language, topics, questionTypes } = formData;
    const hasQuestionType = Object.values(questionTypes).some(type => type);
    const isValid = title.trim() !== "" && language !== "" && topics.trim() !== "" && hasQuestionType;
    setIsFormValid(isValid);
  }, [formData]);

  const updateFormData = (field: keyof FormData | string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleGenerateExam = async () => {
    setIsGenerating(true);
    setGeneratedQuestions([]); // Clear previous questions

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate mock questions based on form data
    const mockQuestions: Question[] = [];
    let questionCount = 0;

    if (formData.questionTypes.multipleChoice) {
      mockQuestions.push({
        id: `mc-${++questionCount}`,
        type: 'multipleChoice',
        question: `Complete the sentence: "The teacher ___ very helpful yesterday."`,
        options: ["was", "were", "is", "are"],
        correctAnswer: 0,
        points: 2
      });
    }

    if (formData.questionTypes.fillBlanks) {
      mockQuestions.push({
        id: `fb-${++questionCount}`,
        type: 'fillBlanks',
        question: "The cat is ___ the table and the dog is ___ the chair.",
        correctAnswer: "on, under",
        points: 3
      });
    }

    if (formData.questionTypes.trueFalse) {
      mockQuestions.push({
        id: `tf-${++questionCount}`,
        type: 'trueFalse',
        question: "The past tense of 'go' is 'went'.",
        correctAnswer: 'true',
        points: 1
      });
    }

    if (formData.questionTypes.openQuestions) {
      mockQuestions.push({
        id: `oq-${++questionCount}`,
        type: 'openQuestions',
        question: "Describe your daily routine using present simple tense. Write at least 5 sentences.",
        correctAnswer: "Sample answer should include present simple verbs and time expressions",
        points: 5
      });
    }

    // Add more questions to reach desired count
    while (mockQuestions.length < formData.questionsCount) {
      const types = Object.entries(formData.questionTypes)
        .filter(([_, enabled]) => enabled)
        .map(([type]) => type);

      if (types.length === 0) break;

      const randomType = types[Math.floor(Math.random() * types.length)];

      if (randomType === 'multipleChoice') {
        mockQuestions.push({
          id: `mc-${++questionCount}`,
          type: 'multipleChoice',
          question: `Choose the correct form: "She ___ to the store every day."`,
          options: ["go", "goes", "going", "gone"],
          correctAnswer: 1,
          points: 2
        });
      } else if (randomType === 'fillBlanks') {
        mockQuestions.push({
          id: `fb-${++questionCount}`,
          type: 'fillBlanks',
          question: "I ___ breakfast at 7 AM every morning.",
          correctAnswer: "have/eat",
          points: 2
        });
      } else if (randomType === 'trueFalse') {
        mockQuestions.push({
          id: `tf-${++questionCount}`,
          type: 'trueFalse',
          question: "English is spoken in more than 50 countries worldwide.",
          correctAnswer: 'true',
          points: 1
        });
      } else if (randomType === 'openQuestions') {
        mockQuestions.push({
          id: `oq-${++questionCount}`,
          type: 'openQuestions',
          question: "Write a short paragraph about your favorite hobby. Use at least 3 different verb tenses.",
          correctAnswer: "Sample should demonstrate correct use of past, present, and future tenses",
          points: 4
        });
      }
    }

    setGeneratedQuestions(mockQuestions);
    setIsGenerating(false);
  };

  const selectedLanguage = languages.find(lang => lang.value === formData.language);
  const selectedDifficulty = difficultyLevels.find(level => level.value === formData.difficulty);

  // Question management functions
  const handleQuestionsReorder = (reorderedQuestions: Question[]) => {
    setGeneratedQuestions(reorderedQuestions);
  };

  const handleQuestionEdit = (questionId: string) => {
    console.log('Edit question:', questionId);
    // TODO: Implement question editing modal
  };

  const handleQuestionDelete = (questionId: string) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleRegenerateQuestions = () => {
    handleGenerateExam();
  };

  const handleAddQuestion = () => {
    console.log('Add new question');
    // TODO: Implement add question modal
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-jakarta font-bold text-slate-900 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-brand-pink rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span>Criar Nova Prova</span>
            </h1>
            <p className="text-gray-600">
              Configure os parâmetros e deixe nossa IA gerar uma prova personalizada
            </p>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-100">
            <Brain className="w-4 h-4 text-brand-purple" />
            <span className="text-sm font-medium text-brand-purple">IA Assistida</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-brand-purple" />
                  <span>Configurações da Prova</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                    Título da Prova *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Avaliação de Inglês - Gramática Básica"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Idioma *
                  </Label>
                  <Select value={formData.language} onValueChange={(value) => updateFormData('language', value)}>
                    <SelectTrigger className="w-full">
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
                      {languages.map(lang => (
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

                {/* Difficulty */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-slate-700">
                    Nível de Dificuldade
                  </Label>
                  <div className="space-y-3">
                    <Slider
                      value={[formData.difficulty]}
                      onValueChange={(value) => updateFormData('difficulty', value[0])}
                      max={6}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between">
                      {difficultyLevels.map((level) => (
                        <div
                          key={level.value}
                          className={`text-center cursor-pointer transition-colors ${
                            formData.difficulty === level.value
                              ? 'text-brand-purple'
                              : 'text-gray-400'
                          }`}
                          onClick={() => updateFormData('difficulty', level.value)}
                        >
                          <div className="text-sm font-bold">{level.label}</div>
                          <div className="text-xs">{level.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedDifficulty && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Nível {selectedDifficulty.label} - {selectedDifficulty.description}
                    </Badge>
                  )}
                </div>

                {/* Topics */}
                <div className="space-y-2">
                  <Label htmlFor="topics" className="text-sm font-medium text-slate-700">
                    Tópicos e Conteúdo *
                  </Label>
                  <Textarea
                    id="topics"
                    placeholder="Descreva os tópicos que devem ser abordados na prova... 
Ex: Tempos verbais (presente, passado, futuro), vocabulário sobre família e trabalho, expressões idiomáticas básicas"
                    value={formData.topics}
                    onChange={(e) => updateFormData('topics', e.target.value)}
                    className="min-h-[100px] w-full"
                  />
                </div>

                {/* Question Count */}
                <div className="space-y-2">
                  <Label htmlFor="count" className="text-sm font-medium text-slate-700">
                    Quantidade de Questões
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      id="count"
                      type="number"
                      min="5"
                      max="100"
                      value={formData.questionsCount}
                      onChange={(e) => updateFormData('questionsCount', parseInt(e.target.value) || 5)}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600">questões</span>
                  </div>
                </div>

                {/* Multiple Versions */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiple-versions"
                      checked={formData.generateMultipleVersions}
                      onCheckedChange={(checked) => updateFormData('generateMultipleVersions', checked)}
                    />
                    <Label htmlFor="multiple-versions" className="text-sm font-medium text-slate-700">
                      Gerar Múltiplas Versões?
                    </Label>
                  </div>
                  {formData.generateMultipleVersions && (
                    <div className="ml-6 flex items-center space-x-3">
                      <Input
                        type="number"
                        min="2"
                        max="10"
                        value={formData.versionsCount}
                        onChange={(e) => updateFormData('versionsCount', parseInt(e.target.value) || 2)}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600">versões diferentes</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Question Types */}
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hash className="w-5 h-5 text-brand-purple" />
                  <span>Tipos de Questão *</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(questionTypeIcons).map(([key, Icon]) => {
                  const labels = {
                    multipleChoice: "Múltipla Escolha",
                    fillBlanks: "Preencher Lacunas",
                    trueFalse: "Verdadeiro/Falso",
                    openQuestions: "Questões Abertas",
                  };
                  
                  const descriptions = {
                    multipleChoice: "Questões com alternativas A, B, C, D",
                    fillBlanks: "Complete as frases com as palavras corretas",
                    trueFalse: "Afirmações para marcar verdadeiro ou falso",
                    openQuestions: "Questões dissertativas ou de resposta livre",
                  };

                  return (
                    <div key={key} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id={key}
                        checked={formData.questionTypes[key as keyof typeof formData.questionTypes]}
                        onCheckedChange={(checked) => updateFormData(`questionTypes.${key}`, checked)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-gray-500" />
                          <Label htmlFor={key} className="text-sm font-medium text-slate-700">
                            {labels[key as keyof typeof labels]}
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {descriptions[key as keyof typeof descriptions]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateExam}
              disabled={!isFormValid || isGenerating}
              className="w-full h-14 bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Gerando Prova...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Gerar Prova com IA</span>
                </div>
              )}
            </Button>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <QuestionsPreview
              questions={generatedQuestions}
              examTitle={formData.title || "Nova Prova"}
              language={selectedLanguage?.label || formData.language}
              difficulty={selectedDifficulty?.description || "Intermediário"}
              isGenerating={isGenerating}
              onQuestionsReorder={handleQuestionsReorder}
              onQuestionEdit={handleQuestionEdit}
              onQuestionDelete={handleQuestionDelete}
              onRegenerateQuestions={handleRegenerateQuestions}
              onAddQuestion={handleAddQuestion}
            />

            {/* Configuration Summary - Show only when no questions generated */}
            {!isGenerating && generatedQuestions.length === 0 && formData.title && formData.language && (
              <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-slate-50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h4 className="font-jakarta font-semibold text-slate-700 mb-3">Configuração Atual:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <span className="text-slate-500">Título:</span>
                      <p className="font-medium text-slate-700 truncate">{formData.title}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Idioma:</span>
                      <p className="font-medium text-slate-700">
                        {selectedLanguage?.flag} {selectedLanguage?.label}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Nível:</span>
                      <p className="font-medium text-slate-700">
                        {selectedDifficulty?.label} - {selectedDifficulty?.description}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500">Questões:</span>
                      <p className="font-medium text-slate-700">{formData.questionsCount}</p>
                    </div>
                  </div>

                  {!isFormValid && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                      <div className="flex items-center space-x-2 text-amber-700">
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Campos obrigatórios:</span>
                      </div>
                      <ul className="text-xs text-amber-600 mt-2 space-y-1">
                        {!formData.title && <li>• Título da prova</li>}
                        {!formData.language && <li>• Idioma</li>}
                        {!formData.topics && <li>• Tópicos e conteúdo</li>}
                        {!Object.values(formData.questionTypes).some(type => type) && <li>• Pelo menos um tipo de questão</li>}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
