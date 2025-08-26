import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  BookOpen,
  Clock,
  Globe,
  TrendingUp,
  Zap,
  Star,
  Calendar,
  Users,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

// Mock data for recent exams
const recentExams = [
  {
    id: 1,
    title: "Matemática Básica - Álgebra",
    language: "Português",
    difficulty: "A1",
    createdAt: "2024-01-15",
    questionsCount: 25,
    completions: 142,
  },
  {
    id: 2,
    title: "English Grammar Fundamentals",
    language: "English",
    difficulty: "B1",
    createdAt: "2024-01-14",
    questionsCount: 30,
    completions: 89,
  },
  {
    id: 3,
    title: "História do Brasil - República",
    language: "Português",
    difficulty: "C1",
    createdAt: "2024-01-13",
    questionsCount: 40,
    completions: 67,
  },
  {
    id: 4,
    title: "Physics - Mechanics Basics",
    language: "English",
    difficulty: "B2",
    createdAt: "2024-01-12",
    questionsCount: 20,
    completions: 234,
  },
  {
    id: 5,
    title: "Biologia - Citologia",
    language: "Português",
    difficulty: "A2",
    createdAt: "2024-01-11",
    questionsCount: 35,
    completions: 156,
  },
  {
    id: 6,
    title: "Spanish Conversation Skills",
    language: "Spanish",
    difficulty: "B1",
    createdAt: "2024-01-10",
    questionsCount: 28,
    completions: 78,
  },
];

const stats = [
  {
    title: "Total de Provas",
    value: "1,247",
    icon: BookOpen,
    trend: "+12%",
    color: "text-blue-600",
  },
  {
    title: "Total de Turmas",
    value: "24",
    icon: Users,
    trend: "+8%",
    color: "text-purple-600",
  },
  {
    title: "Total de Questões",
    value: "3,456",
    icon: BarChart3,
    trend: "+15%",
    color: "text-green-600",
  },
  {
    title: "Provas Favoritas",
    value: "89",
    icon: Star,
    trend: "+5%",
    color: "text-orange-600",
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

export default function Index() {
  const heroContent = {
    badge: (
      <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 backdrop-blur-sm rounded-full border border-purple-100">
        <Zap className="w-3 h-3 text-brand-purple" />
        <span className="text-xs font-medium text-brand-purple">
          Powered by AI
        </span>
      </div>
    ),
    title: (
      <>
        Crie provas inteligentes com{" "}
        <span className="bg-gradient-to-l from-brand-purple to-brand-pink bg-clip-text text-transparent">
          inteligência artificial
        </span>
      </>
    ),
    description: "Gere provas personalizadas em segundos com nossa IA avançada. Defina o nível, idioma e tópicos para criar avaliações perfeitas.",
    actionButton: (
      <Link to="/criar-prova?action=new">
        <Button
          size="sm"
          className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Nova Prova
        </Button>
      </Link>
    ),
  };

  return (
    <Layout heroContent={heroContent}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="border-0 bg-white/70 card-custom-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600 font-medium">
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Exams Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-jakarta font-bold text-slate-900">
              Provas Recentes
            </h2>
            <Button
              variant="outline"
              className="text-brand-purple border-purple-200 hover:bg-purple-50"
            >
              Ver Todas
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentExams.map((exam) => (
              <Card
                key={exam.id}
                className="border-0 bg-white/70 card-custom-shadow cursor-pointer group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-jakarta font-semibold text-slate-900 group-hover:text-brand-purple transition-colors line-clamp-2">
                      {exam.title}
                    </CardTitle>
                    <Star className="w-5 h-5 text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer flex-shrink-0 ml-2" />
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
                    <Badge
                      variant="outline"
                      className={`text-xs ${getDifficultyColor(exam.difficulty)}`}
                    >
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
                      <span>{exam.completions} conclusões</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(exam.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-brand-purple hover:text-brand-purple hover:bg-purple-50 h-8 px-3"
                    >
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-100">
          <h3 className="text-xl font-jakarta font-semibold text-slate-900 mb-4">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 bg-white/70 border-purple-200 hover:bg-purple-50 text-left justify-start"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    Importar Questões
                  </p>
                  <p className="text-sm text-slate-600">
                    Adicionar do banco de dados
                  </p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 bg-white/70 border-purple-200 hover:bg-purple-50 text-left justify-start"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Ver Relatórios</p>
                  <p className="text-sm text-slate-600">
                    Análise de desempenho
                  </p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 bg-white/70 border-purple-200 hover:bg-purple-50 text-left justify-start"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">IA Assistente</p>
                  <p className="text-sm text-slate-600">Otimizar suas provas</p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
