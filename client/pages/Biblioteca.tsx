import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import {
  Library,
  Search,
  Filter,
  SortAsc,
  MoreHorizontal,
  Copy,
  Trash2,
  ExternalLink,
  BookOpen,
  Clock,
  Globe,
  Star,
  StarOff,
  Calendar,
  Users,
  Plus,
  FileText,
  Heart,
  Sparkles
} from "lucide-react";
import Layout from "@/components/Layout";

// Mock data for library
const mockExams = [
  {
    id: 1,
    title: "Matemática Básica - Álgebra Linear",
    language: "Português",
    difficulty: "Iniciante",
    topic: "Matemática",
    createdAt: "2024-01-15",
    modifiedAt: "2024-01-16",
    questionsCount: 25,
    completions: 142,
    isFavorite: true
  },
  {
    id: 2,
    title: "English Grammar Fundamentals",
    language: "English",
    difficulty: "Intermediário",
    topic: "Idiomas",
    createdAt: "2024-01-14",
    modifiedAt: "2024-01-15",
    questionsCount: 30,
    completions: 89,
    isFavorite: false
  },
  {
    id: 3,
    title: "História do Brasil - República",
    language: "Português",
    difficulty: "Avançado",
    topic: "História",
    createdAt: "2024-01-13",
    modifiedAt: "2024-01-14",
    questionsCount: 40,
    completions: 67,
    isFavorite: true
  },
  {
    id: 4,
    title: "Physics - Mechanics Basics",
    language: "English",
    difficulty: "Intermediário",
    topic: "Física",
    createdAt: "2024-01-12",
    modifiedAt: "2024-01-13",
    questionsCount: 20,
    completions: 234,
    isFavorite: false
  },
  {
    id: 5,
    title: "Biologia - Citologia Celular",
    language: "Português",
    difficulty: "Iniciante",
    topic: "Biologia",
    createdAt: "2024-01-11",
    modifiedAt: "2024-01-12",
    questionsCount: 35,
    completions: 156,
    isFavorite: false
  },
  {
    id: 6,
    title: "Spanish Conversation Skills",
    language: "Spanish",
    difficulty: "Intermediário",
    topic: "Idiomas",
    createdAt: "2024-01-10",
    modifiedAt: "2024-01-11",
    questionsCount: 28,
    completions: 78,
    isFavorite: true
  },
  {
    id: 7,
    title: "Química Orgânica - Hidrocarbonetos",
    language: "Português",
    difficulty: "Avançado",
    topic: "Química",
    createdAt: "2024-01-09",
    modifiedAt: "2024-01-10",
    questionsCount: 45,
    completions: 92,
    isFavorite: false
  },
  {
    id: 8,
    title: "Literature Analysis - Shakespeare",
    language: "English",
    difficulty: "Avançado",
    topic: "Literatura",
    createdAt: "2024-01-08",
    modifiedAt: "2024-01-09",
    questionsCount: 22,
    completions: 45,
    isFavorite: true
  }
];

const mockFavoriteQuestions = [
  {
    id: 1,
    question: "Qual é a derivada de x²?",
    subject: "Matemática",
    difficulty: "Iniciante",
    topic: "Cálculo"
  },
  {
    id: 2,
    question: "What is the past tense of 'go'?",
    subject: "English",
    difficulty: "Iniciante",
    topic: "Grammar"
  },
  {
    id: 3,
    question: "Quem proclamou a República no Brasil?",
    subject: "História",
    difficulty: "Intermediário",
    topic: "Brasil República"
  },
  {
    id: 4,
    question: "What is Newton's second law of motion?",
    subject: "Physics",
    difficulty: "Intermediário",
    topic: "Mechanics"
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Iniciante":
      return "bg-green-100 text-green-800 border-green-200";
    case "Intermediário":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Avançado":
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

export default function Biblioteca() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [sortBy, setSortBy] = useState("modified");
  const [exams, setExams] = useState(mockExams);
  const [favoriteQuestions, setFavoriteQuestions] = useState(mockFavoriteQuestions);

  // Get unique values for filters
  const languages = [...new Set(mockExams.map(exam => exam.language))];
  const levels = [...new Set(mockExams.map(exam => exam.difficulty))];
  const topics = [...new Set(mockExams.map(exam => exam.topic))];

  // Filter and sort exams
  const filteredExams = useMemo(() => {
    let filtered = exams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = selectedLanguage === "all" || exam.language === selectedLanguage;
      const matchesLevel = selectedLevel === "all" || exam.difficulty === selectedLevel;
      const matchesTopic = selectedTopic === "all" || exam.topic === selectedTopic;
      
      return matchesSearch && matchesLanguage && matchesLevel && matchesTopic;
    });

    // Sort exams
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "modified":
          return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
        case "questions":
          return b.questionsCount - a.questionsCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [exams, searchTerm, selectedLanguage, selectedLevel, selectedTopic, sortBy]);

  const toggleFavorite = (examId: number) => {
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, isFavorite: !exam.isFavorite } : exam
    ));
  };

  const duplicateExam = (examId: number) => {
    const exam = exams.find(e => e.id === examId);
    if (exam) {
      const newExam = {
        ...exam,
        id: Math.max(...exams.map(e => e.id)) + 1,
        title: `${exam.title} (Cópia)`,
        createdAt: new Date().toISOString().split('T')[0],
        modifiedAt: new Date().toISOString().split('T')[0],
        completions: 0,
        isFavorite: false
      };
      setExams([newExam, ...exams]);
    }
  };

  const deleteExam = (examId: number) => {
    setExams(exams.filter(exam => exam.id !== examId));
  };

  const EmptyState = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
    <div className="text-center py-12 space-y-4">
      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-jakarta font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 max-w-sm mx-auto">{description}</p>
      <Button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
        <Plus className="w-4 h-4 mr-2" />
        Criar Nova Prova
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-jakarta font-bold text-slate-900">
              Minha Biblioteca
            </h1>
            <p className="text-gray-600">
              Gerencie suas provas e questões favoritas
            </p>
          </div>
          <Link to="/criar-prova">
            <Button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
              <Plus className="w-4 h-4 mr-2" />
              Nova Prova
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Language Filter */}
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os idiomas</SelectItem>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {getLanguageFlag(lang)} {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Level Filter */}
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Topic Filter */}
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Tópico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tópicos</SelectItem>
                  {topics.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modified">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Modificação</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="created">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Criação</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="title">
                    <div className="flex items-center space-x-2">
                      <SortAsc className="w-4 h-4" />
                      <span>Nome</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="questions">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Questões</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {filteredExams.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredExams.length} {filteredExams.length === 1 ? 'prova encontrada' : 'provas encontradas'}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Filtros ativos</span>
            </div>
          </div>
        )}

        {/* Exams Grid */}
        {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-jakarta font-semibold text-slate-900 group-hover:text-brand-purple transition-colors line-clamp-2 flex-1">
                      {exam.title}
                    </CardTitle>
                    <div className="flex items-center space-x-1 ml-2">
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Abrir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateExam(exam.id)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteExam(exam.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                      <div>Criado: {new Date(exam.createdAt).toLocaleDateString('pt-BR')}</div>
                      <div>Modificado: {new Date(exam.modifiedAt).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {exam.topic}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma prova encontrada"
            description="Tente ajustar os filtros ou crie sua primeira prova para começar!"
            icon={Library}
          />
        )}

        {/* Favorite Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-jakarta font-bold text-slate-900 flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500" />
              <span>Questões Favoritas</span>
            </h2>
            <Button variant="outline" className="text-brand-purple border-purple-200 hover:bg-purple-50">
              Ver Todas
            </Button>
          </div>

          {favoriteQuestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteQuestions.map((question) => (
                <Card key={question.id} className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-900 line-clamp-2">
                        {question.question}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {question.subject}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getDifficultyColor(question.difficulty)}`}
                          >
                            {question.difficulty}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">{question.topic}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-jakarta font-semibold text-gray-900">
                    Nenhuma questão favoritada
                  </h3>
                  <p className="text-gray-600">
                    Favorite questões durante a criação de provas para vê-las aqui!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Motivational CTA */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-purple" />
              <h3 className="text-xl font-jakarta font-semibold text-slate-900">
                Continue criando!
              </h3>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sua biblioteca está crescendo! Que tal criar mais uma prova com a ajuda da nossa IA?
            </p>
            <Button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
              <Plus className="w-4 h-4 mr-2" />
              Criar Nova Prova com IA
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
