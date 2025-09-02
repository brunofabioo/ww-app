import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  BookOpen,
  Users,
  Grid3X3,
  List,
  Star,
  StarOff,
  Eye,
  Edit,
  Copy,
  Trash2,
} from "lucide-react";

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

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "A1":
    case "A2":
      return "bg-green-100 text-green-800 border-green-200";
    case "B1":
    case "B2":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "C1":
    case "C2":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getLanguageFlag = (language: string) => {
  switch (language) {
    case "Português":
      return "🇧🇷";
    case "English":
      return "🇺🇸";
    case "Spanish":
      return "🇪🇸";
    default:
      return "🌐";
  }
};

export default function Atividades2() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [exams, setExams] = useState<ExamItem[]>(initialExams);

  const items = useMemo(() => exams, [exams]);

  const toggleFavorite = (id: number) => {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e)),
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-jakarta font-bold text-slate-900">Atividades 2</h1>
            <p className="text-gray-600">
              {items.length} {items.length === 1 ? "prova encontrada" : "provas encontradas"}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle (igual Atividades) */}
            <div className="flex border border-purple-200 rounded-lg p-1 bg-white/80 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm"
                    : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                <List className="w-4 h-4 mr-1" />
                Linhas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm"
                    : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                Cards
              </Button>
            </div>

            <Link to="/criar-prova-5">
              <Button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
                Nova Prova
              </Button>
            </Link>
          </div>
        </div>

        {/* Results */}
        {items.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((exam) => (
                  <Card key={exam.id} className="border-0 bg-white/70 card-custom-shadow group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg font-jakarta font-semibold text-slate-900 group-hover:text-brand-purple transition-colors line-clamp-2">
                              {exam.title}
                            </CardTitle>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(exam.id)}
                          className="p-1 h-auto"
                        >
                          {exam.isFavorite ? (
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4 text-gray-300" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {getLanguageFlag(exam.language)} {exam.language}
                          </span>
                        </div>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(exam.difficulty)}`}>
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
                          <div>
                            Criado: {new Date(exam.createdAt).toLocaleDateString("pt-BR")}
                          </div>
                          <div>
                            Modificado: {new Date(exam.modifiedAt).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {exam.topic}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <Card className="border-0 bg-white/70 card-custom-shadow">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200 bg-gray-50/50">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-700">Prova</th>
                          <th className="text-left p-4 font-medium text-gray-700">Idioma</th>
                          <th className="text-left p-4 font-medium text-gray-700">Nível</th>
                          <th className="text-left p-4 font-medium text-gray-700">Questões</th>
                          <th className="text-left p-4 font-medium text-gray-700">Turma</th>
                          <th className="text-left p-4 font-medium text-gray-700">Modificado</th>
                          <th className="text-left p-4 font-medium text-gray-700">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((exam, index) => (
                          <tr
                            key={exam.id}
                            className={`border-b border-gray-100 hover:bg-purple-50/50 transition-colors ${
                              index % 2 === 0 ? "bg-white/50" : "bg-gray-25/50"
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFavorite(exam.id)}
                                  className="p-1 h-auto"
                                >
                                  {exam.isFavorite ? (
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  ) : (
                                    <StarOff className="w-4 h-4 text-gray-300" />
                                  )}
                                </Button>
                                <div>
                                  <p className="font-medium text-slate-900 hover:text-brand-purple transition-colors">
                                    {exam.title}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span>{getLanguageFlag(exam.language)}</span>
                                <span className="text-sm text-gray-700">{exam.language}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className={`text-xs ${getDifficultyColor(exam.difficulty)}`}>
                                {exam.difficulty}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-1 text-sm text-gray-700">
                                <BookOpen className="w-4 h-4" />
                                <span>{exam.questionsCount}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-1 text-sm text-gray-700">
                                <Users className="w-4 h-4 text-indigo-600" />
                                <span>{exam.turma || "Sem turma"}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {new Date(exam.modifiedAt).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm" className="p-1 h-auto text-blue-600 hover:text-blue-700">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-600 hover:text-gray-700">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-600 hover:text-gray-700">
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-600 hover:text-gray-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-600">Sem itens</div>
        )}
      </div>
    </Layout>
  );
}
