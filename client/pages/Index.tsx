import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  BookOpen,
  Clock,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Star,
  Calendar,
  Users,
  BarChart3,
  Loader2,
  GraduationCap,
  Heart,
  Edit,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAtividades } from "@/hooks/useSupabase";
import { useEffect } from "react";

// Função para formatar números com separadores
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-BR').format(num);
};

// Função para calcular tendência (simulada por enquanto)
const calculateTrend = (current: number): string => {
  // Por enquanto retorna uma tendência simulada
  // Em uma implementação real, você compararia com dados anteriores
  const trends = ["+5%", "+8%", "+12%", "+15%", "+3%", "+10%"];
  return trends[Math.floor(Math.random() * trends.length)];
};

// Função para gerar estatísticas baseadas nos dados reais
const generateStatsFromData = (dashboardStats: any) => [
  {
    title: "Total de Atividades",
    value: formatNumber(dashboardStats.totalAtividades),
    icon: BookOpen,
    trend: calculateTrend(dashboardStats.totalAtividades),
    color: "text-blue-600",
  },
  {
    title: "Total de Turmas",
    value: formatNumber(dashboardStats.totalTurmas),
    icon: Users,
    trend: calculateTrend(dashboardStats.totalTurmas),
    color: "text-purple-600",
  },
  {
    title: "Total de Questões",
    value: formatNumber(dashboardStats.totalQuestoes),
    icon: BarChart3,
    trend: calculateTrend(dashboardStats.totalQuestoes),
    color: "text-green-600",
  },
  {
    title: "Atividades Favoritas",
    value: formatNumber(dashboardStats.atividadesFavoritas),
    icon: Star,
    trend: calculateTrend(dashboardStats.atividadesFavoritas),
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

const getLanguageDisplay = (language: string) => {
  switch (language) {
    case "Português":
    case "portuguese":
      return { flag: "🇧🇷", code: "BR", name: "Português" };
    case "English":
    case "english":
      return { flag: "🇺🇸", code: "US", name: "English" };
    case "Spanish":
    case "spanish":
      return { flag: "🇪🇸", code: "ES", name: "Español" };
    case "french":
      return { flag: "🇫🇷", code: "FR", name: "Français" };
    case "german":
      return { flag: "🇩🇪", code: "DE", name: "Deutsch" };
    case "italian":
      return { flag: "🇮🇹", code: "IT", name: "Italiano" };
    case "Não definido":
      return { flag: "❓", code: "??", name: "Não definido" };
    default:
      return { flag: "🌐", code: "XX", name: language };
  }
};

export default function Index() {
  // Hooks para buscar dados do Supabase
  const { stats: dashboardStats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { atividades, loading: atividadesLoading, error: atividadesError, fetchAtividades } = useAtividades();

  // Buscar atividades quando o componente montar
  useEffect(() => {
    fetchAtividades();
  }, []);

  // Gerar estatísticas baseadas nos dados reais
  const stats = generateStatsFromData(dashboardStats);

  // Pegar as 6 atividades mais recentes
  const recentExams = atividades.slice(0, 6).map(atividade => ({
    id: atividade.id,
    title: atividade.title,
    language: atividade.language,
    difficulty: atividade.difficulty,
    createdAt: atividade.created_at,
    questionsCount: atividade.questions_count,
    completions: Math.floor(Math.random() * 300), // Simulado por enquanto
    is_favorite: atividade.is_favorite,
    turma: atividade.turmas?.name || "Sem turma",
  }));

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
        Crie atividades inteligentes com{" "}
        <span className="bg-gradient-to-l from-brand-purple to-brand-pink bg-clip-text text-transparent">
          inteligência artificial
        </span>
      </>
    ),
    description: "Gere atividades personalizadas em segundos com nossa IA avançada. Defina o nível, idioma e tópicos para criar avaliações perfeitas.",
    actionButton: (
      <Link to="/criar-atividade?action=new">
        <Button
          size="sm"
          className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Nova Atividade
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
          {statsLoading ? (
            // Loading skeleton para as estatísticas
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-0 bg-white/70 card-custom-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : statsError ? (
            <div className="col-span-full">
              <Card className="border-0 bg-red-50 card-custom-shadow">
                <CardContent className="p-6 text-center">
                  <p className="text-red-600">Erro ao carregar estatísticas: {statsError}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            stats.map((stat) => (
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
            ))
          )}
        </div>

        {/* Recent Exams Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-jakarta font-bold text-slate-900">
              Atividades Recentes
            </h2>
            <Link to="/atividades">
              <Button
                variant="outline"
                className="text-brand-purple border-purple-200 hover:bg-purple-50"
              >
                Ver Todas
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {atividadesLoading ? (
              // Loading skeleton para as atividades
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="border-0 bg-white/70 card-custom-shadow">
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : atividadesError ? (
              <div className="col-span-full">
                <Card className="border-0 bg-red-50 card-custom-shadow">
                  <CardContent className="p-6 text-center">
                    <p className="text-red-600">Erro ao carregar atividades: {atividadesError}</p>
                    <Button 
                      onClick={fetchAtividades} 
                      variant="outline" 
                      className="mt-4"
                    >
                      Tentar Novamente
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : recentExams.length === 0 ? (
              <div className="col-span-full">
                <Card className="border-0 bg-white/70 card-custom-shadow">
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma atividade encontrada
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Você ainda não criou nenhuma atividade. Comece criando sua primeira!
                    </p>
                    <Link to="/criar-atividade?action=new">
                      <Button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeira Atividade
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ) : (
              recentExams.map((exam) => (
                <Card
                  key={exam.id}
                  className="border-0 bg-white/70 card-custom-shadow cursor-pointer group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-jakarta font-semibold text-slate-900 group-hover:text-brand-purple transition-colors line-clamp-2">
                        {exam.title}
                      </CardTitle>
                      <Star 
                        className={`w-5 h-5 transition-colors cursor-pointer flex-shrink-0 ml-2 ${
                          exam.is_favorite 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300 hover:text-yellow-400'
                        }`} 
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {(() => {
                            const langDisplay = getLanguageDisplay(exam.language);
                            return `${langDisplay.flag} ${langDisplay.name}`;
                          })()}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getDifficultyColor(exam.difficulty)}`}
                      >
                        {exam.difficulty.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                       <div className="flex items-center space-x-1">
                         <BookOpen className="w-4 h-4" />
                         <span>{exam.questionsCount} questões</span>
                       </div>
                       <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{exam.turma}</span>
                        </div>
                     </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(exam.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <Link to={`/criar-atividade-5?id=${exam.id}&edit=true`}>
                         <Button
                           variant="ghost"
                           size="sm"
                           className="text-brand-purple hover:text-brand-purple hover:bg-purple-50 h-8 px-3"
                         >
                           Editar
                         </Button>
                       </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>


      </div>
    </Layout>
  );
}
