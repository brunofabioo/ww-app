import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, BookOpen, Users } from "lucide-react";

interface ExamItem {
  id: number;
  title: string;
  language: string;
  difficulty: string;
  topic: string;
  turma: string | null;
  createdAt: string;
  modifiedAt: string;
  questionsCount: number;
  completions: number;
  isFavorite: boolean;
}

const initialExams: ExamItem[] = [
  {
    id: 1,
    title: "Matemática Básica - Álgebra Linear",
    language: "Português",
    difficulty: "A1",
    topic: "Matemática",
    turma: "Turma B - 9º Ano",
    createdAt: "2024-01-15",
    modifiedAt: "2024-01-16",
    questionsCount: 25,
    completions: 142,
    isFavorite: true,
  },
  {
    id: 2,
    title: "English Grammar Fundamentals",
    language: "English",
    difficulty: "B1",
    topic: "Idiomas",
    turma: null,
    createdAt: "2024-01-14",
    modifiedAt: "2024-01-15",
    questionsCount: 30,
    completions: 89,
    isFavorite: false,
  },
  {
    id: 3,
    title: "História do Brasil - República",
    language: "Português",
    difficulty: "C1",
    topic: "História",
    turma: "Turma C - EM",
    createdAt: "2024-01-13",
    modifiedAt: "2024-01-14",
    questionsCount: 40,
    completions: 67,
    isFavorite: true,
  },
];

const difficultyColor = (d: string) =>
  d.startsWith("A")
    ? "bg-green-100 text-green-800 border-green-200"
    : d.startsWith("B")
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-red-100 text-red-800 border-red-200";

const flag = (l: string) =>
  l === "Português" ? "🇧🇷" : l === "English" ? "🇺🇸" : l === "Spanish" ? "🇪🇸" : "🌐";

export default function Atividades2() {
  const [exams, setExams] = useState<ExamItem[]>(initialExams);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-jakarta font-bold text-slate-900">Atividades 2</h1>
          <Link to="/criar-prova-5">
            <Button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
              Nova Prova
            </Button>
          </Link>
        </div>

        {/* Listagem mínima (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="border-0 bg-white/70 card-custom-shadow group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-jakarta font-semibold text-slate-900 group-hover:text-brand-purple transition-colors line-clamp-2">
                      {exam.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{flag(exam.language)} {exam.language}</span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${difficultyColor(exam.difficulty)}`}>
                    {exam.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{exam.questionsCount} questões</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{exam.completions}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    <div> Criado: {new Date(exam.createdAt).toLocaleDateString("pt-BR")}</div>
                    <div> Modificado: {new Date(exam.modifiedAt).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">{exam.topic}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
