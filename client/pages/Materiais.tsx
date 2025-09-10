import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
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
} from '../components/ui/alert-dialog';
import { Upload, FileText, Search, Filter, Trash2, Download, MoreVertical, Edit, Calendar, User, Grid, List, Grid3X3, ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Label } from '../components/ui/label';
import MaterialUpload from '../components/MaterialUpload';
import Layout from '../components/Layout';
import { useMateriais, useAuth } from '../hooks/useSupabase';
import type { Material } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/loading-spinner';

interface UploadedMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt';
  size: number;
  uploadDate: string;
  subject?: string;
  description?: string;
  file: File;
}





const getFileTypeColor = (type: string) => {
  switch (type) {
    case 'pdf':
      return 'bg-red-100 text-red-800';
    case 'docx':
      return 'bg-blue-100 text-blue-800';
    case 'txt':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Materiais() {
  // Hook do Supabase para materiais
  const { user } = useAuth();
  const { materiais, loading, error, fetchMateriais, createMaterial, deleteMaterial } = useMateriais();
  
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  // Detectar se é mobile e definir viewMode padrão
  useEffect(() => {
    const checkIsMobile = () => {
      if (window.innerWidth < 640) { // sm breakpoint
        setViewMode('cards');
      }
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  const [showFilters, setShowFilters] = useState(false);

  // Carregar materiais ao montar o componente
  useEffect(() => {
    fetchMateriais();
  }, []);

  const filteredMaterials = materiais.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    // Remover o ponto do file_type para comparação (ex: ".pdf" -> "pdf")
    const fileTypeWithoutDot = material.file_type.startsWith('.') ? material.file_type.slice(1) : material.file_type;
    const matchesType = selectedType === 'all' || fileTypeWithoutDot === selectedType;
    return matchesSearch && matchesType;
  });

  const handleUpload = async (uploadedMaterial: UploadedMaterial) => {
    try {
      
      // Gerar nome único para o arquivo no storage
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = uploadedMaterial.file.name.split('.').pop();
      const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;
      
      // Upload do arquivo para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('materiais')
        .upload(uniqueFileName, uploadedMaterial.file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('materiais')
        .getPublicUrl(uniqueFileName);
      
      // Salvar dados do material no banco
      const materialData = {
        title: uploadedMaterial.name.replace(/\.[^/.]+$/, ''), // Remover extensão do título
        file_type: `.${fileExtension}`, // Extensão do arquivo
        file_size: uploadedMaterial.size, // Tamanho do arquivo
        file_url: publicUrl,
        subject: uploadedMaterial.subject || 'Geral',
        description: uploadedMaterial.description || '',
        user_id: user?.id || null,
        turma_id: null
      };
      
      console.log('Dados do material a serem salvos:', materialData);
      console.log('Upload data:', uploadedMaterial);
      
      await createMaterial(materialData);
      console.log('Material criado com sucesso!');
      setShowUpload(false);
    } catch (error) {
      console.error('Erro ao fazer upload do material:', error);
      alert(`Erro ao fazer upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDelete = async (materialId: string) => {
    try {
      await deleteMaterial(materialId);
    } catch (error) {
      console.error('Erro ao deletar material:', error);
    }
  };

  const handleViewDetails = (material: Material) => {
    setSelectedMaterial(material);
    setShowDetails(true);
  };

  const handleDownload = async (material: Material) => {
    if (!material.file_url) {
      console.error('URL do arquivo não disponível');
      return;
    }

    try {
      // Extrair extensão do file_type
      const fileExtension = material.file_type.startsWith('.') 
        ? material.file_type 
        : `.${material.file_type}`;
      
      // Criar nome do arquivo com título + extensão
      const fileName = `${material.title}${fileExtension}`;
      
      // Fazer fetch do arquivo
      const response = await fetch(material.file_url);
      if (!response.ok) {
        throw new Error('Erro ao baixar o arquivo');
      }
      
      // Converter para blob
      const blob = await response.blob();
      
      // Criar URL temporária para o blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL temporária
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'docx':
      case 'doc':
        return '📝';
      case 'txt':
        return '📃';
      default:
        return '📄';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-jakarta font-bold text-slate-900">
            Materiais
          </h1>
          <p className="text-gray-600">
            {materiais.length}{" "}
            {materiais.length === 1 ? "material adicionado" : "materiais adicionados"}
          </p>
        </div>

        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          {/* View Mode Toggle - Right aligned on mobile */}
          <div className="flex items-center justify-end sm:justify-start">
            <div className="flex items-center bg-white border border-purple-200 rounded-lg p-1 shadow-sm w-fit">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                  viewMode === 'list'
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
          </div>

          <Button 
            onClick={() => setShowUpload(true)}
            className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 w-full sm:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Material
          </Button>
        </div>
      </div>



      {/* Search and Controls */}
      <Card className="border-0 bg-white/70 card-custom-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar materiais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* File Type Filter */}
            <div className="flex items-center space-x-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px] bg-white/80 border-blue-200 hover:border-blue-300 transition-colors shadow-sm">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent className="z-50" position="popper" sideOffset={4}>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="pdf">📄 PDF</SelectItem>
                  <SelectItem value="docx">📝 Word</SelectItem>
                  <SelectItem value="txt">📃 Texto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading e Error States */}
      {loading && (
        <LoadingSpinner message="Carregando materiais..." />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Erro ao carregar materiais: {error}</div>
        </div>
      )}

      {/* Materials Grid */}
      {!loading && !error && filteredMaterials.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedType !== 'all' ? 'Nenhum material encontrado' : 'Nenhum material adicionado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedType !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Adicione seus primeiros materiais para começar a criar provas personalizadas'
              }
            </p>
            {!searchTerm && selectedType === 'all' && (
              <Button onClick={() => setShowUpload(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredMaterials.length > 0 && (
        <div>
          {viewMode === 'list' ? (
            // List View
            <Card className="border-0 bg-white/70 card-custom-shadow">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 bg-gray-50/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-700">
                          <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors">
                            <span>Material ({filteredMaterials.length})</span>
                            <ArrowUpDown className="w-4 h-4 opacity-50" />
                          </button>
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors">
                            <span>Tipo</span>
                            <ArrowUpDown className="w-4 h-4 opacity-50" />
                          </button>
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors">
                            <span>Tamanho</span>
                            <ArrowUpDown className="w-4 h-4 opacity-50" />
                          </button>
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          <button className="flex items-center space-x-1 hover:text-purple-600 transition-colors">
                            <span>Data Upload</span>
                            <ArrowUpDown className="w-4 h-4 opacity-50" />
                          </button>
                        </th>
                        <th className="text-left p-4 font-medium text-gray-700">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMaterials.map((material, index) => (
                        <tr
                          key={material.id}
                          className={`border-b border-gray-100 hover:bg-purple-50/50 transition-colors ${
                            index % 2 === 0 ? "bg-white/50" : "bg-gray-25/50"
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-lg">{getFileIcon(material.file_type)}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-900 hover:text-purple-600 transition-colors truncate">
                                  {material.title}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {material.description || 'Sem descrição'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-xs">
                              {material.file_type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-gray-700">
                            {formatFileSize(material.file_size)}
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {new Date(material.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(material)}
                                className="p-1 h-auto text-gray-600 hover:text-green-600"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto text-gray-600 hover:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(material.id)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="group border-0 bg-white/70 card-custom-shadow hover:shadow-lg transition-all duration-200 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">{getFileIcon(material.file_type)}</span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-slate-900 line-clamp-1 break-all">
                            {material.title}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(material)}
                          className="p-1 h-auto text-gray-600 hover:text-green-600"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto text-gray-600 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(material.id)}>
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
                      <Badge variant="outline" className="text-xs">
                        {material.file_type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(material.file_size)}
                      </span>
                    </div>
                    
                    {material.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {material.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        <div>
                          Upload: {new Date(material.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {material.subject}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <MaterialUpload
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
        />
      )}

      {/* Dialog de Detalhes do Material */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">{selectedMaterial && getFileIcon(selectedMaterial.file_type)}</span>
              <span>{selectedMaterial?.title}</span>
            </DialogTitle>
            <DialogDescription>
              Detalhes completos do material
            </DialogDescription>
          </DialogHeader>
          {selectedMaterial && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Tipo de Arquivo</Label>
                  <p className="text-sm text-slate-600 mt-1">{selectedMaterial.file_type.toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Tamanho</Label>
                  <p className="text-sm text-slate-600 mt-1">{formatFileSize(selectedMaterial.file_size)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Data de Upload</Label>
                  <p className="text-sm text-slate-600 mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(selectedMaterial.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Matéria</Label>
                  <p className="text-sm text-slate-600 mt-1">
                    <Badge variant="secondary">{selectedMaterial.subject}</Badge>
                  </p>
                </div>
              </div>
              {selectedMaterial.description && (
                <div>
                  <Label className="text-sm font-medium text-slate-700">Descrição</Label>
                  <p className="text-sm text-slate-600 mt-1 p-3 bg-slate-50 rounded-lg">
                    {selectedMaterial.description}
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => handleDownload(selectedMaterial)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setShowDetails(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      </div>
    </Layout>
  );
}