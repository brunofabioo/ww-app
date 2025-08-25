import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users,
  Plus,
  Edit3,
  Trash2,
  MoreHorizontal,
  BookOpen,
  Calendar,
  GraduationCap,
  UserPlus,
  Settings
} from "lucide-react";
import Layout from "@/components/Layout";

interface Turma {
  id: number;
  nome: string;
  createdAt: string;
  studentsCount: number;
  examsCount: number;
  lastActivity: string;
}

// Mock data for turmas
const mockTurmas: Turma[] = [
  {
    id: 1,
    nome: "Turma A - Inglês Básico",
    createdAt: "2024-01-15",
    studentsCount: 28,
    examsCount: 5,
    lastActivity: "2024-01-20"
  },
  {
    id: 2,
    nome: "Turma B - Matemática 9º Ano",
    createdAt: "2024-01-10",
    studentsCount: 32,
    examsCount: 8,
    lastActivity: "2024-01-19"
  },
  {
    id: 3,
    nome: "Turma C - História Ensino Médio",
    createdAt: "2024-01-08",
    studentsCount: 25,
    examsCount: 3,
    lastActivity: "2024-01-18"
  }
];

export default function MinhasTurmas() {
  const [turmas, setTurmas] = useState<Turma[]>(mockTurmas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTurma, setCurrentTurma] = useState<Turma | null>(null);
  const [nomeTurma, setNomeTurma] = useState("");

  const handleCreateTurma = () => {
    if (nomeTurma.trim()) {
      const newTurma: Turma = {
        id: Math.max(...turmas.map(t => t.id), 0) + 1,
        nome: nomeTurma.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        studentsCount: 0,
        examsCount: 0,
        lastActivity: new Date().toISOString().split('T')[0]
      };
      setTurmas([...turmas, newTurma]);
      setNomeTurma("");
      setIsModalOpen(false);
    }
  };

  const handleEditTurma = (turma: Turma) => {
    setCurrentTurma(turma);
    setNomeTurma(turma.nome);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleUpdateTurma = () => {
    if (currentTurma && nomeTurma.trim()) {
      setTurmas(turmas.map(t => 
        t.id === currentTurma.id 
          ? { ...t, nome: nomeTurma.trim() }
          : t
      ));
      setNomeTurma("");
      setCurrentTurma(null);
      setIsEditMode(false);
      setIsModalOpen(false);
    }
  };

  const handleDeleteTurma = (turmaId: number) => {
    setTurmas(turmas.filter(t => t.id !== turmaId));
  };

  const openCreateModal = () => {
    setNomeTurma("");
    setCurrentTurma(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentTurma(null);
    setNomeTurma("");
  };

  const EmptyState = () => (
    <div className="text-center py-16 space-y-6">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto">
        <Users className="w-12 h-12 text-blue-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-jakarta font-semibold text-slate-900">
          Nenhuma turma criada ainda
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Você ainda n��o criou nenhuma turma. Clique no botão acima para começar a organizar seus alunos em grupos.
        </p>
      </div>
      <Button 
        onClick={openCreateModal}
        className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
      >
        <Plus className="w-4 h-4 mr-2" />
        Criar Primeira Turma
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-jakarta font-bold text-slate-900">
              Minhas Turmas
            </h1>
            <p className="text-gray-600">
              {turmas.length} {turmas.length === 1 ? 'turma criada' : 'turmas criadas'}
            </p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={openCreateModal}
                className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>{isEditMode ? 'Editar Turma' : 'Criar Nova Turma'}</span>
                </DialogTitle>
                <DialogDescription>
                  {isEditMode 
                    ? 'Modifique as informações da turma abaixo.'
                    : 'Digite o nome da nova turma para organizar seus alunos.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-turma" className="text-sm font-medium text-slate-700">
                    Nome da Turma
                  </Label>
                  <Input
                    id="nome-turma"
                    placeholder="Ex: Turma A - Inglês Básico"
                    value={nomeTurma}
                    onChange={(e) => setNomeTurma(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        isEditMode ? handleUpdateTurma() : handleCreateTurma();
                      }
                    }}
                    autoFocus
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button 
                  onClick={isEditMode ? handleUpdateTurma : handleCreateTurma}
                  disabled={!nomeTurma.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isEditMode ? 'Atualizar' : 'Salvar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        {turmas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">
                      {turmas.reduce((total, turma) => total + turma.studentsCount, 0)}
                    </p>
                    <p className="text-sm text-blue-600">Total de Alunos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">
                      {turmas.reduce((total, turma) => total + turma.examsCount, 0)}
                    </p>
                    <p className="text-sm text-green-600">Provas Criadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-700">{turmas.length}</p>
                    <p className="text-sm text-purple-600">Turmas Ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Turmas List */}
        {turmas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turmas.map((turma) => (
              <Card key={turma.id} className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-jakarta font-semibold text-slate-900 group-hover:text-brand-purple transition-colors line-clamp-2">
                        {turma.nome}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Criada em {new Date(turma.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTurma(turma)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Gerenciar Alunos
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="w-4 h-4 mr-2" />
                          Configurações
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTurma(turma.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-2xl font-bold text-slate-900">{turma.studentsCount}</span>
                      </div>
                      <p className="text-xs text-gray-500">Alunos</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span className="text-2xl font-bold text-slate-900">{turma.examsCount}</span>
                      </div>
                      <p className="text-xs text-gray-500">Provas</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Última atividade:</span>
                      </div>
                      <span>{new Date(turma.lastActivity).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <UserPlus className="w-3 h-3 mr-1" />
                      Alunos
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Provas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </Layout>
  );
}
