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
import { useAtividadesData } from "@/hooks/useAtividadesData";
import { useAtividadesVersions } from "@/hooks/useAtividadesVersions";
import { useSupabaseDrafts } from "@/hooks/useSupabaseDrafts";
import { useTurmas } from "@/hooks/useSupabase";
import type { Atividade } from "@/lib/supabase";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Interface para atividade com questões
interface AtividadeComQuestoes extends Atividade {
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
  isSupabaseDraft?: boolean;
  currentStep?: number;
  lastSaved?: string;
  // Garantir que o id está disponível
  id: string;
}
import { useToast } from "@/components/ui/use-toast";

// Mock data for library
// Mock data removido - agora usando dados reais do Supabase

const getDifficultyColor = (difficulty: string) => {
  const level = difficulty.toUpperCase();
  switch (level) {
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

const getDifficultyDisplay = (difficulty: string) => {
  return difficulty.toUpperCase();
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
  const {
    atividades,
    loading: atividadesLoading,
    error: atividadesError,
    refreshData,
    deleteAtividade,
    toggleFavorite: toggleAtividadeFavorite,
  } = useAtividadesData();
  
  const {
    versions,
    loading: versionsLoading,
    error: versionsError,
    fetchVersionsByAtividade,
    createVersion,
    deleteVersion,
  } = useAtividadesVersions();
  
  const {
    drafts: supabaseDrafts,
    loading: draftsLoading,
    error: draftsError,
    createDraft,
    updateDraft,
    deleteDraft: deleteSupabaseDraft,
    getDraftsByType,
  } = useSupabaseDrafts();
  
  const {
    turmas,
    loading: turmasLoading,
    fetchTurmas,
  } = useTurmas();
  
  const { toast } = useToast();

  // Carregar dados ao montar o componente
  useEffect(() => {
    // Carregar apenas drafts locais - os hooks já carregam dados do Supabase automaticamente
    const loadedDrafts = getAllDrafts();
    setDrafts(loadedDrafts);
  }, []);
  
  // Carregar turmas apenas uma vez quando o componente monta
  useEffect(() => {
    if (turmas.length === 0 && !turmasLoading) {
      fetchTurmas();
    }
  }, [turmas.length, turmasLoading, fetchTurmas]);
  
  // Função para mapear ID da turma para nome
  const getTurmaNome = (turmaId: string | null) => {
    if (!turmaId) return "Sem turma";
    const turma = turmas.find(t => t.id === turmaId);
    return turma ? turma.name : "Turma não encontrada";
  };
  
  // Processar drafts do Supabase para exibição
  const supabaseDraftsAsExams = useMemo(() => {
    return supabaseDrafts
      .filter(draft => draft.type === 'atividade')
      .map((draft) => ({
        id: `supabase-draft-${draft.id}`,
        title: draft.data?.title || "Rascunho Supabase",
        language: draft.data?.language || "Português",
        difficulty: draft.data?.difficulty || "A1",
        topic: draft.data?.topics || "Rascunho",
        turma: getTurmaNome(draft.data?.turma_id || null),
        createdAt: draft.created_at.split('T')[0],
        modifiedAt: draft.updated_at.split('T')[0],
        questionsCount: draft.data?.questions_count || 0,
        completions: 0,
        isFavorite: false,
        isDraft: true,
        isSupabaseDraft: true,
        currentStep: draft.step || 1,
        lastSaved: draft.updated_at,
        // Campos do Supabase para compatibilidade
        questoesCount: 0,
        description: draft.data?.description || "Não especificado",
        instructions_text: draft.data?.instructions_text || "",
        turma_id: draft.data?.turma_id || null,
        status: "draft" as const,
        created_at: draft.created_at,
        updated_at: draft.updated_at,
        // Campos específicos do Supabase
        user_id: draft.user_id,
        content_html: draft.data?.content_html,
        content_json: draft.data?.content_json,
        instructions_json: draft.data?.instructions_json,
        is_favorite: false,
        version_number: 1,
        published_at: null,
        archived_at: null,
        topics: draft.data?.topics || "Não especificado",
        questions_count: draft.data?.questions_count || 0,
        generate_multiple_versions: false,
        versions_count: 1,
        question_types: {},
        material_id: draft.data?.material_id || null,
      }));
  }, [supabaseDrafts, turmas]);

  // Processar atividades do Supabase para exibição
  useEffect(() => {
    if (atividades && atividades.length > 0 && turmas.length > 0) {
      const atividadesProcessadas: AtividadeComQuestoes[] = atividades.map(
        (atividade) => ({
          ...atividade,
          questoesCount: 0,
          completions: 0,
          // Mapear campos do novo schema
          title: atividade.title || "Atividade",
          language: atividade.language || "Português",
          difficulty: atividade.difficulty || "Médio",
          topic: atividade.topics || atividade.description || "Não especificado",
          turma: getTurmaNome(atividade.turma_id),
          createdAt: atividade.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          modifiedAt: atividade.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          questionsCount: atividade.questions_count || 0,
          isFavorite: atividade.is_favorite || false,
          isDraft: false, // Atividades regulares não são rascunhos
        }),
      );
      setExams(atividadesProcessadas);
    } else if (atividades && atividades.length === 0) {
      // Se não há atividades, limpar a lista
      setExams([]);
    }
  }, [atividades, turmas]);

  // Convert drafts to exam format for display
  // Função para mapear valores do formulário para exibição
  const mapLanguageValue = (value: string) => {
    const languageMap: { [key: string]: string } = {
      portuguese: "Português",
      english: "English",
      spanish: "Spanish",
      french: "French",
      german: "German",
      italian: "Italian",
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
      createdAt: new Date(draft.timestamp).toISOString().split("T")[0],
      modifiedAt: new Date(draft.timestamp).toISOString().split("T")[0],
      questionsCount: draft.formData.questionsCount || 0,
      completions: 0,
      isFavorite: false,
      isDraft: true,
      currentStep: draft.currentStep,
      lastSaved: draft.lastSaved,
      // Campos do Supabase para compatibilidade
        questoesCount: 0,
        description: draft.formData.topics || "Não especificado",
        instructions_text: `Rascunho de ${draft.formData.language || "idioma"} - Nível ${draft.formData.difficulty || "não especificado"}`,
        turma_id: draft.formData.turma || null,
        material_id: draft.formData.selectedMaterial || null,
        status: "draft" as const,
      created_at: draft.lastSaved,
      updated_at: draft.lastSaved,
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
  const languages = [...new Set(exams.map((exam) => exam.language))].filter(lang => lang && lang.trim() !== '');
  const levels = [...new Set(exams.map((exam) => exam.difficulty))].filter(level => level && level.trim() !== '');

  const turmasUnicas = [...new Set(exams.map((exam) => exam.turma).filter(Boolean))];

  // Filter and sort exams (including drafts)
  const filteredExams = useMemo(() => {
    // Combine regular exams with local drafts and Supabase drafts
    const allItems = [...exams, ...draftsAsExams, ...supabaseDraftsAsExams];

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
            const difficultyOrder = {
              A1: 1,
              A2: 2,
              B1: 3,
              B2: 4,
              C1: 5,
              C2: 6,
            };
            aValue =
              difficultyOrder[a.difficulty as keyof typeof difficultyOrder] ||
              0;
            bValue =
              difficultyOrder[b.difficulty as keyof typeof difficultyOrder] ||
              0;
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
              new Date(b.modifiedAt).getTime() -
              new Date(a.modifiedAt).getTime()
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

  const toggleFavorite = async (examId: string | number) => {
    try {
      // Se for uma atividade do Supabase, usar a função do hook
      if (typeof examId === 'string' && !examId.startsWith('draft-') && !examId.startsWith('supabase-draft-')) {
        await toggleAtividadeFavorite(examId);
        toast({
          title: "Sucesso!",
          description: "Status de favorito atualizado.",
          variant: "default",
        });
      } else {
        // Para rascunhos locais, manter comportamento anterior
        setExams(
          exams.map((exam) =>
            exam.id === examId ? { ...exam, isFavorite: !exam.isFavorite } : exam,
          ),
        );
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status de favorito.",
        variant: "destructive",
      });
    }
  };

  const duplicateExam = async (examId: string | number) => {
    try {
      const exam = exams.find((e) => e.id === examId);
      if (exam) {
        // TODO: Implementar duplicação no Supabase
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "A duplicação de atividades será implementada em breve.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao duplicar a atividade.",
        variant: "destructive",
      });
    }
  };

  const viewExam = (examId: string | number) => {
    try {
      // Se for um rascunho, mostrar mensagem informativa
      if (typeof examId === "string" && examId.startsWith("draft-")) {
        toast({
          title: "Visualização de rascunho",
          description: "Para visualizar um rascunho, continue a edição.",
          variant: "default",
        });
        return;
      }

      // Para atividades do Supabase, implementar visualização
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A visualização de atividades será implementada em breve.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao visualizar a atividade.",
        variant: "destructive",
      });
    }
  };

  const deleteExam = async (examId: string | number) => {
    try {
      // Se for um rascunho, deletar do localStorage
      if (typeof examId === "string" && examId.startsWith("draft-")) {
        const draftIndex = parseInt(examId.replace("draft-", ""));
        const draft = drafts[draftIndex];
        if (draft) {
          deleteDraft(draft.timestamp);
          setDrafts((prev) => prev.filter((_, index) => index !== draftIndex));
        }
        toast({
          title: "Rascunho deletado",
          description: "Rascunho removido com sucesso.",
          variant: "default",
        });
        return;
      }

      // Se for uma atividade do Supabase, deletar do banco
      if (typeof examId === "string") {
        await deleteAtividade(examId);
        toast({
          title: "Atividade deletada",
          description: "Atividade removida com sucesso do banco de dados.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar a atividade.",
        variant: "destructive",
      });
    }
  };

  const deleteDraftById = async (draftId: string | number) => {
    try {
      // Check if it's a Supabase draft (string ID starting with 'supabase-draft-')
      if (typeof draftId === 'string' && draftId.startsWith('supabase-draft-')) {
        const supabaseDraftId = draftId.replace('supabase-draft-', '');
        const success = await deleteSupabaseDraft(supabaseDraftId);
        if (success) {
          toast({
            title: "Rascunho excluído",
            description: "O rascunho foi excluído com sucesso.",
          });
        } else {
          toast({
            title: "Erro ao excluir",
            description: "Não foi possível excluir o rascunho.",
            variant: "destructive",
          });
        }
      } else {
        // Local draft (number timestamp)
        const success = deleteDraft(draftId as number);
        if (success) {
          // Reload drafts after deletion
          const loadedDrafts = getAllDrafts();
          setDrafts(loadedDrafts);
          toast({
            title: "Rascunho excluído",
            description: "O rascunho foi excluído com sucesso.",
          });
        } else {
          toast({
            title: "Erro ao excluir",
            description: "Não foi possível excluir o rascunho.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao deletar rascunho:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro inesperado ao excluir o rascunho.",
        variant: "destructive",
      });
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
      <Link to="/criar-atividade-5">
        <Button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
          <Plus className="w-4 h-4 mr-2" />
          Criar Nova Atividade
        </Button>
      </Link>
    </div>
  );

  // Mostrar loading se estiver carregando dados
  if (atividadesLoading || turmasLoading) {
    return <LoadingSpinner message="Carregando atividades..." fullScreen />;
  }

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
                ? "atividade encontrada"
                : "atividades encontradas"}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
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

            <Link to="/criar-atividade-5">
              <Button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
                <Plus className="w-4 h-4 mr-2" />
                Nova Atividade
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
                    placeholder="Buscar atividades..."
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
                    <Star
                      className={`w-4 h-4 mr-2 transition-colors ${showFavoritesOnly ? "fill-current text-yellow-600" : "text-gray-500"}`}
                    />
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
                        {languages.map((lang) => {
                          const langDisplay = getLanguageDisplay(lang);
                          return (
                            <SelectItem key={lang} value={lang}>
                              {langDisplay.flag} {langDisplay.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Level Filter */}
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <Select
                      value={selectedLevel}
                      onValueChange={setSelectedLevel}
                    >
                      <SelectTrigger className="w-40 bg-white/80 border-green-200 hover:border-green-300 transition-colors shadow-sm">
                        <SelectValue placeholder="Nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os níveis</SelectItem>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getDifficultyColor(level)}`}
                            >
                              {getDifficultyDisplay(level)}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Turma Filter */}
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <Select
                      value={selectedTurma}
                      onValueChange={setSelectedTurma}
                    >
                      <SelectTrigger className="w-40 bg-white/80 border-indigo-200 hover:border-indigo-300 transition-colors shadow-sm">
                        <SelectValue placeholder="Turma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Turmas</SelectItem>
                        <SelectItem value="none">Sem Turma</SelectItem>
                        {turmasUnicas.map((turma) => (
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
                              <Badge
                                variant="outline"
                                className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-1"
                              >
                                <PenTool className="w-3 h-3 mr-1" />
                                Rascunho
                              </Badge>
                            )}
                          </div>
                          {exam.isDraft && (
                            <p className="text-xs text-gray-500">
                              Etapa {exam.currentStep} de 4 • Salvo em{" "}
                              {new Date(exam.lastSaved).toLocaleString("pt-BR")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {exam.isDraft ? (
                            <Link to="/criar-atividade-5?edit=true">
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
                                onClick={() => viewExam(exam.id)}
                                className="p-1 h-auto text-blue-600 hover:text-blue-700"
                                title="Visualizar atividade"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Link to={`/criar-atividade-5?edit=true&id=${exam.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-auto text-gray-600 hover:text-gray-700"
                                  title="Editar atividade"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
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
                                <AlertDialogTitle>
                                  Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a atividade "
                                  {exam.title}"? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteExam(exam.id)}
                                >
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
                          {getDifficultyDisplay(exam.difficulty)}
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
                              <span>Atividade</span>
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
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                                      >
                                        <PenTool className="w-3 h-3 mr-1" />
                                        Rascunho
                                      </Badge>
                                    )}
                                  </div>
                                  {exam.isDraft && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Etapa {exam.currentStep} • Salvo{" "}
                                      {exam.lastSaved}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                {(() => {
                                  const langDisplay = getLanguageDisplay(exam.language);
                                  return (
                                    <>
                                      <span>{langDisplay.flag}</span>
                                      <span className="text-sm text-gray-700">{langDisplay.name}</span>
                                    </>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getDifficultyColor(exam.difficulty)}`}
                              >
                                {getDifficultyDisplay(exam.difficulty)}
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
                                    <Link to="/criar-atividade-5?edit=true">
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
                                          <AlertDialogTitle>
                                            Confirmar exclusão do rascunho
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir o
                                            rascunho "{exam.title}"? Esta ação
                                            não pode ser desfeita e você perderá
                                            todo o progresso salvo.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancelar
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => {
                                              if (exam.id.startsWith('supabase-draft-')) {
                                                // Supabase draft
                                                deleteDraftById(exam.id);
                                              } else {
                                                // Local draft
                                                const draftIndex = parseInt(
                                                  exam.id.replace("draft-", ""),
                                                );
                                                const draft = drafts[draftIndex];
                                                if (draft) {
                                                  deleteDraftById(
                                                    draft.timestamp,
                                                  );
                                                }
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
                                      onClick={() => viewExam(exam.id)}
                                      className="p-1 h-auto text-blue-600 hover:text-blue-700"
                                      title="Visualizar atividade"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Link to={`/criar-atividade-5?edit=true&id=${exam.id}`}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto text-gray-600 hover:text-gray-700"
                                        title="Editar atividade"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </Link>
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
                                          <AlertDialogTitle>
                                            Confirmar exclusão
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir a
                                            atividade "{exam.title}"? Esta ação
                                            não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancelar
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => deleteExam(exam.id)}
                                          >
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
            title="Nenhuma atividade encontrada"
            description={
              hasActiveFilters
                ? "Tente ajustar os filtros ou limpe-os para ver todas as atividades."
                : "Crie sua primeira atividade para começar!"
            }
            icon={Library}
          />
        )}
      </div>
    </Layout>
  );
}
