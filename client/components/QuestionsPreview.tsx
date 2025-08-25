import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuestionCard, { Question } from "./QuestionCard";
import { 
  FileText,
  Download,
  Share2,
  Plus,
  RefreshCw,
  CheckCircle,
  Clock,
  Sparkles,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionsPreviewProps {
  questions: Question[];
  examTitle: string;
  language: string;
  difficulty: string;
  isGenerating: boolean;
  onQuestionsReorder: (questions: Question[]) => void;
  onQuestionEdit: (questionId: string) => void;
  onQuestionDelete: (questionId: string) => void;
  onRegenerateQuestions: () => void;
  onAddQuestion: () => void;
}

// Animation keyframes for question entrance
const questionAnimationDelays = [
  "animate-in slide-in-from-bottom-4 fade-in duration-500",
  "animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100",
  "animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200",
  "animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300",
  "animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500",
];

export default function QuestionsPreview({
  questions,
  examTitle,
  language,
  difficulty,
  isGenerating,
  onQuestionsReorder,
  onQuestionEdit,
  onQuestionDelete,
  onRegenerateQuestions,
  onAddQuestion
}: QuestionsPreviewProps) {
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  // Trigger animation when questions change
  useEffect(() => {
    if (questions.length > 0) {
      setAnimationTrigger(prev => prev + 1);
    }
  }, [questions.length]);

  const handleDragStart = (e: React.DragEvent, questionId: string) => {
    setDraggedQuestionId(questionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!draggedQuestionId) return;

    const draggedIndex = questions.findIndex(q => q.id === draggedQuestionId);
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    const newQuestions = [...questions];
    const [draggedQuestion] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, draggedQuestion);

    onQuestionsReorder(newQuestions);
    setDraggedQuestionId(null);
  };

  const getLanguageFlag = (lang: string) => {
    const flags: { [key: string]: string } = {
      'portuguese': '🇧🇷',
      'english': '🇺🇸',
      'spanish': '🇪🇸',
      'french': '🇫🇷',
      'german': '🇩🇪',
      'italian': '🇮🇹',
      'chinese': '🇨🇳',
      'japanese': '🇯🇵'
    };
    return flags[lang] || '🌐';
  };

  if (isGenerating) {
    return (
      <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm min-h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-slate-600" />
            <span>Gerando Questões...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-brand-purple to-brand-pink rounded-2xl flex items-center justify-center relative overflow-hidden">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-jakarta font-semibold text-slate-600">
                IA Criando Questões...
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Nossa inteligência artificial está analisando os tópicos e gerando questões personalizadas para sua prova.
              </p>
            </div>

            {/* Progress Animation */}
            <div className="w-full max-w-xs space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-brand-purple to-brand-pink h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Analisando tópicos...</span>
                <span>75%</span>
              </div>
            </div>

            {/* Loading Steps */}
            <div className="space-y-2 text-left">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700">Contexto analisado</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-700">Dificuldade configurada</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-blue-700">Gerando questões...</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm min-h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-slate-600" />
            <span>Pré-visualização</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
              <FileText className="w-12 h-12 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-jakarta font-semibold text-slate-600">
                As questões aparecerão aqui...
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Configure os parâmetros da prova e clique em "Gerar Prova" para ver as questões geradas pela IA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <h2 className="text-2xl font-jakarta font-bold text-slate-900 line-clamp-2">
                  {examTitle}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <span>{getLanguageFlag(language)}</span>
                    <span className="capitalize">{language}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {difficulty}
                  </Badge>
                  <span>{questions.length} questões</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRegenerateQuestions}
                  className="text-brand-purple border-purple-200 hover:bg-purple-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regerar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddQuestion}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
              <Button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
                <Download className="w-4 h-4 mr-2" />
                Baixar Prova
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Salvar na Biblioteca
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div
            key={`${question.id}-${animationTrigger}`}
            className={cn(
              questionAnimationDelays[index % questionAnimationDelays.length]
            )}
          >
            <QuestionCard
              question={question}
              index={index}
              onEdit={onQuestionEdit}
              onDelete={onQuestionDelete}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedQuestionId === question.id}
            />
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-jakarta font-semibold text-slate-700">
                Prova Finalizada
              </h4>
              <p className="text-sm text-slate-600">
                {questions.length} questões • Pronta para uso
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-700">
                Concluída
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
