import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Link } from "react-router-dom";
import {
  Library,
  Search,
  Filter,
  Copy,
  Trash2,
  BookOpen,
  Clock,
  Globe,
  Calendar,
  Users,
  Plus,
  FileText,
  Heart,
  Sparkles,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  X,
  Star,
  StarOff,
  Save,
  PenTool,
} from "lucide-react";
import Layout from "@/components/Layout";
import { getAllDrafts, DraftData, deleteDraft } from "@/hooks/useDraftSave";
import { useAtividades } from "@/hooks/useSupabase";
import type { Atividade, Questao } from "@/lib/supabase";

// Interface para atividade com questões
interface AtividadeComQuestoes extends Atividade {
  questoes?: Questao[];
  // Campos adicionais para compatibilidade com a interface existente
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
  isDraft?: boolean;
  currentStep?: number;
  lastSaved?: string;
  // Garantir que o id está disponível
  id: string;
}
import { useToast } from "@/components/ui/use-toast";

// Mock data for library
const mockExams = [
  {
    id: 1,
    title: "Matemática Básica - Álgebra Linear",
    language: "Português",
    difficulty: "A1",
    topic: "Matemática",
    turma: "Turma B - Matemática 9º Ano",
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
    turma: "Turma A - Inglês Básico",
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
    turma: "Turma C - História Ensino Médio",
    createdAt: "2024-01-13",
    modifiedAt: "2024-01-14",
    questionsCount: 40,
    completions: 67,
    isFavorite: true,
  },
  {
    id: 4,
    title: "Physics - Mechanics Basics",
    language: "English",
    difficulty: "B1",
    topic: "Física",
    turma: null,
    createdAt: "2024-01-12",
    modifiedAt: "2024-01-13",
    questionsCount: 20,
    completions: 234,
    isFavorite: false,
  },
  {
    id: 5,
    title: "Biologia - Citologia Celular",
    language: "Português",
    difficulty: "A2",
    topic: "Biologia",
    turma: "Turma B - Matemática 9º Ano",
    createdAt: "2024-01-11",
    modifiedAt: "2024-01-12",
    questionsCount: 35,
    completions: 156,
    isFavorite: false,
  },
  {
    id: 6,
    title: "Spanish Conversation Skills",
    language: "Spanish",
    difficulty: "B2",
    topic: "Idiomas",
    turma: "Turma A - Inglês Básico",
    createdAt: "2024-01-10",
    modifiedAt: "2024-01-11",
    questionsCount: 28,
    completions: 78,
    isFavorite: true,
  },
  {
    id: 7,
    title: "Química Orgânica - Hidrocarbonetos",
    language: "Português",
    difficulty: "C2",
    topic: "Química",
    turma: null,
    createdAt: "2024-01-09",
    modifiedAt: "2024-01-10",
    questionsCount: 45,
    completions: 92,
    isFavorite: false,
  },
  {
    id: 8,
    title: "Literature Analysis - Shakespeare",
    language: "English",
    difficulty: "C1",
    topic: "Literatura",
    turma: "Turma C - História Ensino Médio",
    createdAt: "2024-01-08",
    modifiedAt: "2024-01-09",
    questionsCount: 22,
    completions: 45,
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
    case "Não definido":
      return "❓";
    default:
      return "🌐";
  }
};

export default function Atividades() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedTurma, setSelectedTurma] = useState("all");
  const [sortBy, setSortBy] = useState("modified");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [exams, setExams] = useState<AtividadeComQuestoes[]>([]);
  const [drafts, setDrafts] = useState<DraftData[]>([]);

  // Hooks do Supabase
  const { atividades, loading: atividadesLoading, error: atividadesError, fetchAtividades, deleteAtividade } = useAtividades();
  const { toast } = useToast();

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchAtividades();
    const loadedDrafts = getAllDrafts();
    setDrafts(loadedDrafts);
  }, [fetchAtividades]);

  // Processar atividades do Supabase para o formato da interface
  useEffect(() => {
    if (atividades) {
      const atividadesProcessadas: AtividadeComQuestoes[] = atividades.map(atividade => ({
        ...atividade,
        questoesCount: 0,
        completions: 0,
        isFavorite: Boolean(atividade.is_favorite),
        // Mapear campos para compatibilidade com a interface existente
        title: (atividade as any).titulo || (atividade as any).title || 'Atividade',
        language: 'Não definido',
        difficulty: '',
        topic: (atividade as any).descricao || 'Não especificado',
        turma: (atividade as any).turma_id || null,
        createdAt: (atividade as any).created_at || new Date().toISOString(),
        modifiedAt: (atividade as any).updated_at || new Date().toISOString(),
        questionsCount: (atividade as any).questions_count ?? 0
      }));
      setExams(atividadesProcessadas);
    }
  }, [atividades]);

  // Convert drafts to exam format for display
  // Função para mapear valores do formulário para exibição
  const mapLanguageValue = (value: string) => {
    const languageMap: { [key: string]: string } = {
      'portuguese': 'Português',
      'english': 'English',
      'spanish': 'Spanish',
      'french': 'French',
      'german': 'German',
      'italian': 'Italian'
    };
    return languageMap[value] || value || "Não definido";
  };

  const mapDifficultyValue = (value: string) => {
    return value ? value.toUpperCase() : "A1";
  };

  const draftsAsExams = useMemo(() => {
    return drafts.map((draft, index) => ({
      id: `draft-${index}`,
      title: draft.formData.title || "Rascunho sem título",
      language: mapLanguageValue(draft.formData.language),
      difficulty: mapDifficultyValue(draft.formData.difficulty),
      topic: "Rascunho",
      turma: draft.formData.turma || null,
      createdAt: new Date(draft.timestamp).toISOString().split('T')[0],
      modifiedAt: new Date(draft.timestamp).toISOString().split('T')[0],
      questionsCount: draft.formData.questionsCount || 0,
      completions: 0,
      isFavorite: false,
      isDraft: true,
      currentStep: draft.currentStep,
      lastSaved: draft.lastSaved,
      // Campos do Supabase para compatibilidade
      questoesCount: 0,
      titulo: draft.formData.title || "Rascunho sem título",
      descricao: draft.formData.topics || "Não especificado",
      instrucoes: `Rascunho de ${draft.formData.language || 'idioma'} - Nível ${draft.formData.difficulty || 'não especificado'}`,
      turma_id: draft.formData.turma !== 'none' ? draft.formData.turma : null,
      professor_id: null,
      tipo: 'prova' as const,
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      valor_maximo: 10.0,
      status: 'ativa' as const,
      created_at: draft.lastSaved,
      updated_at: draft.lastSaved
    }));
  }, [drafts]);

  // Handle table sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Get unique values for filters
  const languages = [...new Set(exams.map((exam) => exam.language))];
  const levels = [...new Set(exams.map((exam) => exam.difficulty))];

  const turmas = [
    ...new Set(exams.map((exam) => exam.turma).filter(Boolean)),
  ];

  // Filter and sort exams (including drafts)
  const filteredExams = useMemo(() => {
    // Combine regular exams with drafts
    const allItems = [...exams, ...draftsAsExams];
    
    let filtered = allItems.filter((exam) => {
      const matchesSearch = exam.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesLanguage =
        selectedLanguage === "all" || exam.language === selectedLanguage;
      const matchesLevel =
        selectedLevel === "all" || exam.difficulty === selectedLevel;

      const matchesTurma =
        selectedTurma === "all" ||
        (selectedTurma === "none" && !exam.turma) ||
        exam.turma === selectedTurma;
      const matchesFavorites = !showFavoritesOnly || exam.isFavorite;

      return (
        matchesSearch &&
        matchesLanguage &&
        matchesLevel &&
        matchesTurma &&
        matchesFavorites
      );
    });

    // Apply table column sorting if active, otherwise use dropdown sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortColumn) {
          case "title":
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case "language":
            aValue = a.language.toLowerCase();
            bValue = b.language.toLowerCase();
            break;
          case "difficulty":
            const difficultyOrder = { "A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6 };
            aValue = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0;
            bValue = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0;
            break;
          case "questionsCount":
            aValue = a.questionsCount;
            bValue = b.questionsCount;
            break;
          case "completions":
            aValue = a.completions;
            bValue = b.completions;
            break;
          case "modifiedAt":
            aValue = new Date(a.modifiedAt).getTime();
            bValue = new Date(b.modifiedAt).getTime();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    } else {
      // Use dropdown sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "title":
            return a.title.localeCompare(b.title);
          case "created":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "modified":
            return (
              new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
            );
          case "questions":
            return b.questionsCount - a.questionsCount;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [
    exams,
    draftsAsExams,
    searchTerm,
    selectedLanguage,
    selectedLevel,
    selectedTurma,
    showFavoritesOnly,
    sortBy,
    sortColumn,
    sortDirection,
  ]);

  const toggleFavorite = (examId: string | number) => {
    setExams(
      exams.map((exam) =>
        exam.id === examId ? { ...exam, isFavorite: !exam.isFavorite } : exam,
      ),
    );
  };

  const duplicateExam = async (examId: string | number) => {
    try {
      const exam = exams.find((e) => e.id === examId);
      if (exam) {
        // TODO: Implementar duplicação no Supabase
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "A duplicação de provas será implementada em breve.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao duplicar a prova.",
        variant: "destructive",
      });
    }
  };

  const deleteExam = async (examId: string | number) => {
    try {
      // Se for um rascunho, deletar do localStorage
      if (typeof examId === 'string' && examId.startsWith('draft-')) {
        const draftIndex = parseInt(examId.replace('draft-', ''));
        const draft = drafts[draftIndex];
        if (draft) {
          deleteDraft(draft.timestamp);
          setDrafts(prev => prev.filter((_, index) => index !== draftIndex));
        }
        toast({
          title: "Rascunho deletado",
          description: "Rascunho removido com sucesso.",
          variant: "default",
        });
        return;
      }

      // Se for uma atividade do Supabase, deletar do banco
      if (typeof examId === 'string') {
        await deleteAtividade(examId);
        toast({
          title: "Prova deletada",
          description: "Prova removida com sucesso do banco de dados.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar a prova.",
        variant: "destructive",
      });
    }
  };

  const deleteDraftById = (draftTimestamp: number) => {
    const success = deleteDraft(draftTimestamp);
    if (success) {
      // Reload drafts after deletion
      const loadedDrafts = getAllDrafts();
      setDrafts(loadedDrafts);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLanguage("all");
    setSelectedLevel("all");
    setSelectedTurma("all");
    setShowFavoritesOnly(false);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedLanguage !== "all" ||
    selectedLevel !== "all" ||
    selectedTurma !== "all" ||
    showFavoritesOnly;

  const EmptyState = ({
    title,
    description,
    icon: Icon,
  }: {
    title: string;
    description: string;
    icon: any;
  }) => (
    <div className="text-center py-16 space-y-4">
      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-jakarta font-semibold text-gray-900">
        {title}
      </h3>
      <p className="text-gray-600 max-w-sm mx-auto">{description}</p>
      <Link to="/criar-prova-5">
        <Button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
          <Plus className="w-4 h-4 mr-2" />
          Criar Nova Prova
        </Button>
      </Link>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-jakarta font-bold text-slate-900">
              Atividades
            </h1>
            <p className="text-gray-600">
              {filteredExams.length}{" "}
              {filteredExams.length === 1
                ? "prova encontrada"
                : "provas encontradas"}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex border border-purple-200 rounded-lg p-1 bg-white/80 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <List className="w-4 h-4 mr-1" />
                Linhas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                Cards
              </Button>
            </div>

            <Link to="/criar-prova-5">
              <Button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
                <Plus className="w-4 h-4 mr-2" />
                Nova Prova
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Controls */}
        <Card className="border-0 bg-white/70 card-custom-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar provas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Modern Controls Section */}
              <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-4 border border-purple-100/50 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">

                  {/* Favorites Filter */}
                  <Button
                    variant="outline"
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`transition-all duration-200 shadow-sm ${
                      showFavoritesOnly 
                        ? "bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300 text-yellow-800 shadow-yellow-200/50" 
                        : "bg-white/80 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50"
                    }`}
                  >
                    <Star className={`w-4 h-4 mr-2 transition-colors ${showFavoritesOnly ? 'fill-current text-yellow-600' : 'text-gray-500'}`} />
                    Favoritas
                  </Button>

                  {/* Language Filter */}
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <Select
                      value={selectedLanguage}
                      onValueChange={setSelectedLanguage}
                    >
                      <SelectTrigger className="w-40 bg-white/80 border-blue-200 hover:border-blue-300 transition-colors shadow-sm">
                        <SelectValue placeholder="Idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os idiomas</SelectItem>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {getLanguageFlag(lang)} {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Level Filter */}
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger className="w-40 bg-white/80 border-green-200 hover:border-green-300 transition-colors shadow-sm">
                        <SelectValue placeholder="Nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os níveis</SelectItem>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Turma Filter */}
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                      <SelectTrigger className="w-40 bg-white/80 border-indigo-200 hover:border-indigo-300 transition-colors shadow-sm">
                        <SelectValue placeholder="Turma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Turmas</SelectItem>
                        <SelectItem value="none">Sem Turma</SelectItem>
                        {turmas.map((turma) => (
                          <SelectItem key={turma} value={turma}>
                            {turma}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      size="icon"
                      className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-700 hover:from-red-100 hover:to-pink-100 hover:border-red-300 transition-all duration-200 shadow-sm"
                      title="Limpar Filtros"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}

                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredExams.length > 0 ? (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map((exam) => (
                  <Card
                    key={exam.id}
                    className="border-0 bg-white/70 card-custom-shadow group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg font-jakarta font-semibold text-slate-900 group-hover:text-brand-purple transition-colors line-clamp-2">
                              {exam.title}
                            </CardTitle>
                            {exam.isDraft && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-1">
                                <PenTool className="w-3 h-3 mr-1" />
                                Rascunho
                              </Badge>
                            )}
                          </div>
                          {exam.isDraft && (
                            <p className="text-xs text-gray-500">
                              Etapa {exam.currentStep} de 4 • Salvo em {new Date(exam.lastSaved).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {exam.isDraft ? (
                            <Link to="/criar-prova-5?edit=true">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-auto text-green-600 hover:text-green-700"
                                title="Continuar edição"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-auto text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-auto text-gray-600 hover:text-gray-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => duplicateExam(exam.id)}
                                className="p-1 h-auto text-gray-600 hover:text-gray-700"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-auto text-gray-600 hover:text-gray-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a atividade "{exam.title}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteExam(exam.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
                          <span>{exam.completions}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          <div>
                            Criado:{" "}
                            {new Date(exam.createdAt).toLocaleDateString(
                              "pt-BR",
                            )}
                          </div>
                          <div>
                            Modificado:{" "}
                            {new Date(exam.modifiedAt).toLocaleDateString(
                              "pt-BR",
                            )}
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
                          <th className="text-left p-4 font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("title")}
                              className="flex items-center space-x-1 hover:text-brand-purple transition-colors"
                            >
                              <span>Prova</span>
                              {sortColumn === "title" ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="w-4 h-4" />
                                ) : (
                                  <ArrowDown className="w-4 h-4" />
                                )
                              ) : (
                                <ArrowUpDown className="w-4 h-4 opacity-50" />
                              )}
                            </button>
                          </th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("language")}
                              className="flex items-center space-x-1 hover:text-brand-purple transition-colors"
                            >
                              <span>Idioma</span>
                              {sortColumn === "language" ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="w-4 h-4" />
                                ) : (
                                  <ArrowDown className="w-4 h-4" />
                                )
                              ) : (
                                <ArrowUpDown className="w-4 h-4 opacity-50" />
                              )}
                            </button>
                          </th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("difficulty")}
                              className="flex items-center space-x-1 hover:text-brand-purple transition-colors"
                            >
                              <span>Nível</span>
                              {sortColumn === "difficulty" ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="w-4 h-4" />
                                ) : (
                                  <ArrowDown className="w-4 h-4" />
                                )
                              ) : (
                                <ArrowUpDown className="w-4 h-4 opacity-50" />
                              )}
                            </button>
                          </th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("questionsCount")}
                              className="flex items-center space-x-1 hover:text-brand-purple transition-colors"
                            >
                              <span>Questões</span>
                              {sortColumn === "questionsCount" ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="w-4 h-4" />
                                ) : (
                                  <ArrowDown className="w-4 h-4" />
                                )
                              ) : (
                                <ArrowUpDown className="w-4 h-4 opacity-50" />
                              )}
                            </button>
                          </th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("turma")}
                              className="flex items-center space-x-1 hover:text-brand-purple transition-colors"
                            >
                              <span>Turma</span>
                              {sortColumn === "turma" ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="w-4 h-4" />
                                ) : (
                                  <ArrowDown className="w-4 h-4" />
                                )
                              ) : (
                                <ArrowUpDown className="w-4 h-4 opacity-50" />
                              )}
                            </button>
                          </th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            <button
                              onClick={() => handleSort("modifiedAt")}
                              className="flex items-center space-x-1 hover:text-brand-purple transition-colors"
                            >
                              <span>Modificado</span>
                              {sortColumn === "modifiedAt" ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="w-4 h-4" />
                                ) : (
                                  <ArrowDown className="w-4 h-4" />
                                )
                              ) : (
                                <ArrowUpDown className="w-4 h-4 opacity-50" />
                              )}
                            </button>
                          </th>
                          <th className="text-left p-4 font-medium text-gray-700">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExams.map((exam, index) => (
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
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium text-slate-900 hover:text-brand-purple transition-colors">
                                      {exam.title}
                                    </p>
                                    {exam.isDraft && (
                                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                        <PenTool className="w-3 h-3 mr-1" />
                                        Rascunho
                                      </Badge>
                                    )}
                                  </div>
                                  {exam.isDraft && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Etapa {exam.currentStep} • Salvo {exam.lastSaved}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span>{getLanguageFlag(exam.language)}</span>
                                <span className="text-sm text-gray-700">
                                  {exam.language}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getDifficultyColor(exam.difficulty)}`}
                              >
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
                              {new Date(exam.modifiedAt).toLocaleDateString(
                                "pt-BR",
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-1">
                                {exam.isDraft ? (
                                  <>
                                    <Link to="/criar-prova-5?edit=true">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-brand-purple border-brand-purple hover:bg-brand-purple hover:text-white"
                                      >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Continuar Edição
                                      </Button>
                                    </Link>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-1 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Confirmar exclusão do rascunho</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir o rascunho "{exam.title}"? Esta ação não pode ser desfeita e você perderá todo o progresso salvo.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => {
                                              const draftIndex = parseInt(exam.id.replace('draft-', ''));
                                              const draft = drafts[draftIndex];
                                              if (draft) {
                                                deleteDraftById(draft.timestamp);
                                              }
                                            }}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Excluir Rascunho
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="p-1 h-auto text-blue-600 hover:text-blue-700"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="p-1 h-auto text-gray-600 hover:text-gray-700"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => duplicateExam(exam.id)}
                                      className="p-1 h-auto text-gray-600 hover:text-gray-700"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-1 h-auto text-gray-600 hover:text-gray-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir a atividade "{exam.title}"? Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => deleteExam(exam.id)}>
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
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
          <EmptyState
            title="Nenhuma prova encontrada"
            description={
              hasActiveFilters
                ? "Tente ajustar os filtros ou limpe-os para ver todas as provas."
                : "Crie sua primeira prova para começar!"
            }
            icon={Library}
          />
        )}
      </div>
    </Layout>
  );
}
