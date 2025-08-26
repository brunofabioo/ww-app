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
  Edit,
  Trash2,
  MoreHorizontal,
  BookOpen,
  Calendar,
  GraduationCap,
  Grid3X3,
  List,
} from "lucide-react";
import Layout from "@/components/Layout";

interface Turma {
  id: number;
  nome: string;
  createdAt: string;
  examsCount: number;
  lastActivity: string;
}

// Mock data for turmas
const mockTurmas: Turma[] = [
  {
    id: 1,
    nome: "Turma A - Inglês Básico",
    createdAt: "2024-01-15",
    examsCount: 5,
    lastActivity: "2024-01-20",
  },
  {
    id: 2,
    nome: "Turma B - Matemática 9º Ano",
    createdAt: "2024-01-10",
    examsCount: 8,
    lastActivity: "2024-01-19",
  },
  {
    id: 3,
    nome: "Turma C - História Ensino Médio",
    createdAt: "2024-01-08",
    examsCount: 3,
    lastActivity: "2024-01-18",
  },
];

export default function Turmas() {
  const [turmas, setTurmas] = useState<Turma[]>(mockTurmas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTurma, setCurrentTurma] = useState<Turma | null>(null);
  const [nomeTurma, setNomeTurma] = useState("");
  const [viewMode, setViewMode] = useState<'cards' | 'lines'>('lines');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [turmaToDelete, setTurmaToDelete] = useState<Turma | null>(null);

  const handleCreateTurma = () => {
    if (nomeTurma.trim()) {
      const newTurma: Turma = {
        id: Math.max(...turmas.map((t) => t.id), 0) + 1,
        nome: nomeTurma.trim(),
        createdAt: new Date().toISOString().split("T")[0],

        examsCount: 0,
        lastActivity: new Date().toISOString().split("T")[0],
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
      setTurmas(
        turmas.map((t) =>
          t.id === currentTurma.id ? { ...t, nome: nomeTurma.trim() } : t,
        ),
      );
      setNomeTurma("");
      setCurrentTurma(null);
      setIsEditMode(false);
      setIsModalOpen(false);
    }
  };

  const handleDeleteTurma = (turmaId: number) => {
    setTurmas(turmas.filter((t) => t.id !== turmaId));
    setIsDeleteDialogOpen(false);
    setTurmaToDelete(null);
  };

  const openDeleteDialog = (turma: Turma) => {
    setTurmaToDelete(turma);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setTurmaToDelete(null);
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
          Você ainda não criou nenhuma turma. Clique no botão acima para
          começar a organizar suas atividades em grupos.
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
              Turmas
            </h1>
            <p className="text-gray-600">
              {turmas.length}{" "}
              {turmas.length === 1 ? "turma criada" : "turmas criadas"}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-purple-200 rounded-lg p-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('lines')}
                className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                  viewMode === 'lines'
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200 bg-white/80 shadow-sm'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <List className="w-4 h-4 mr-1" />
                Linhas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                  viewMode === 'cards'
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200 bg-white/80 shadow-sm'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                Cards
              </Button>
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
                  <span>
                    {isEditMode ? "Editar Turma" : "Criar Nova Turma"}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Modifique as informações da turma abaixo."
                    : "Digite o nome da nova turma para organizar suas atividades."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="nome-turma"
                    className="text-sm font-medium text-slate-700"
                  >
                    Nome da Turma
                  </Label>
                  <Input
                    id="nome-turma"
                    placeholder="Ex: Turma A - Inglês Básico"
                    value={nomeTurma}
                    onChange={(e) => setNomeTurma(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
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
                  {isEditMode ? "Atualizar" : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>



        {/* Turmas List */}
        {turmas.length > 0 ? (
          viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {turmas.map((turma) => (
                <Card
                  key={turma.id}
                  className="border-0 bg-white/70 card-enhanced group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-jakarta font-semibold text-slate-900 group-hover:text-brand-purple transition-colors line-clamp-2">
                          {turma.nome}
                        </CardTitle>

                      </div>

                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTurma(turma)}
                          className="p-1 h-auto text-gray-600 hover:text-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(turma)}
                          className="p-1 h-auto text-gray-600 hover:text-gray-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          <span className="text-2xl font-bold text-slate-900">
                            {turma.examsCount}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Provas</p>
                      </div>
                    </div>



                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                      >
                        <BookOpen className="w-3 h-3 mr-1" />
                        Provas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Lines View */
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden card-enhanced">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome da Turma ({turmas.length})
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provas ({turmas.reduce((total, turma) => total + turma.examsCount, 0)})
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {turmas.map((turma) => (
                      <tr key={turma.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mr-3">
                              <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {turma.nome}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {turma.examsCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTurma(turma)}
                              className="p-1 h-auto text-gray-600 hover:text-gray-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(turma)}
                              className="p-1 h-auto text-gray-600 hover:text-gray-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a turma "{turmaToDelete?.nome}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => turmaToDelete && handleDeleteTurma(turmaToDelete.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
