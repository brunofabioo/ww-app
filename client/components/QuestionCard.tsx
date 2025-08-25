import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit3, 
  Trash2, 
  GripVertical,
  CheckSquare,
  Edit,
  HelpCircle,
  BookOpen,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Question {
  id: string;
  type: 'multipleChoice' | 'fillBlanks' | 'trueFalse' | 'openQuestions';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points?: number;
}

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  onDragStart: (e: React.DragEvent, questionId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetIndex: number) => void;
  isDragging?: boolean;
}

const questionTypeConfig = {
  multipleChoice: {
    icon: CheckSquare,
    label: "Múltipla Escolha",
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  fillBlanks: {
    icon: Edit,
    label: "Preencher Lacunas",
    color: "bg-green-100 text-green-800 border-green-200"
  },
  trueFalse: {
    icon: HelpCircle,
    label: "Verdadeiro/Falso",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  openQuestions: {
    icon: BookOpen,
    label: "Questão Aberta",
    color: "bg-purple-100 text-purple-800 border-purple-200"
  }
};

export default function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging = false
}: QuestionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = questionTypeConfig[question.type];
  const Icon = config.icon;

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multipleChoice':
        return (
          <div className="space-y-3">
            <p className="text-slate-800 font-medium leading-relaxed">
              {question.question}
            </p>
            <div className="space-y-2">
              {question.options?.map((option, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                    question.correctAnswer === idx 
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold",
                    question.correctAnswer === idx
                      ? "border-green-500 bg-green-100 text-green-700"
                      : "border-gray-400 bg-white text-gray-600"
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1">{option}</span>
                  {question.correctAnswer === idx && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'fillBlanks':
        return (
          <div className="space-y-3">
            <p className="text-slate-800 font-medium leading-relaxed">
              {question.question.split('___').map((part, idx, arr) => (
                <span key={idx}>
                  {part}
                  {idx < arr.length - 1 && (
                    <span className="inline-block mx-1 px-3 py-1 bg-blue-100 border-b-2 border-blue-300 rounded text-blue-700 font-medium">
                      ___
                    </span>
                  )}
                </span>
              ))}
            </p>
            {question.correctAnswer && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm text-green-700 font-medium">
                  Resposta: {question.correctAnswer}
                </span>
              </div>
            )}
          </div>
        );

      case 'trueFalse':
        return (
          <div className="space-y-3">
            <p className="text-slate-800 font-medium leading-relaxed">
              {question.question}
            </p>
            <div className="flex space-x-4">
              <div className={cn(
                "flex items-center space-x-2 p-3 rounded-lg border transition-colors",
                question.correctAnswer === 'true'
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              )}>
                <Check className="w-5 h-5 text-green-600" />
                <span>Verdadeiro</span>
                {question.correctAnswer === 'true' && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </div>
              <div className={cn(
                "flex items-center space-x-2 p-3 rounded-lg border transition-colors",
                question.correctAnswer === 'false'
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-gray-50 border-gray-200 text-gray-700"
              )}>
                <X className="w-5 h-5 text-red-600" />
                <span>Falso</span>
                {question.correctAnswer === 'false' && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </div>
            </div>
          </div>
        );

      case 'openQuestions':
        return (
          <div className="space-y-3">
            <p className="text-slate-800 font-medium leading-relaxed">
              {question.question}
            </p>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-500 italic">
                Resposta dissertativa - Área para o aluno escrever
              </div>
              <div className="mt-2 h-20 border border-dashed border-gray-300 rounded bg-white"></div>
            </div>
            {question.correctAnswer && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm text-blue-700 font-medium">
                  Resposta esperada: {question.correctAnswer}
                </span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card 
      className={cn(
        "border-0 shadow-sm bg-white/70 backdrop-blur-sm transition-all duration-200 group",
        isDragging && "opacity-50 scale-95",
        isHovered && "shadow-md scale-[1.02]"
      )}
      draggable
      onDragStart={(e) => onDragStart(e, question.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-slate-600 font-semibold text-sm">
              {index + 1}
            </div>
            <Badge variant="outline" className={config.color}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            {question.points && (
              <Badge variant="secondary" className="text-xs">
                {question.points} pts
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto cursor-grab active:cursor-grabbing"
              title="Arrastar para reordenar"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(question.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Editar questão"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(question.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Excluir questão"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Question Content */}
        {renderQuestionContent()}
      </CardContent>
    </Card>
  );
}
