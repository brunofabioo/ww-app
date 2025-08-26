import React, { useState } from 'react';
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
import { Upload, FileText, Search, Filter, Trash2, Eye, Download, MoreVertical, Edit, Calendar, User, Grid, List, Grid3X3, ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Label } from '../components/ui/label';
import MaterialUpload from '../components/MaterialUpload';
import MaterialPreview from '../components/MaterialPreview';
import Layout from '../components/Layout';

interface Material {
  id: string;
  title: string;
  type: string;
  size: number;
  uploadDate: string;
  subject: string;
  description: string;
  file?: File;
}

interface UploadedMaterial extends Material {
  file: File;
}

// Mock data para demonstração
const mockMaterials: Material[] = [
  {
    id: '1',
    name: 'Apostila de Matemática.pdf',
    type: 'pdf',
    size: 2048000,
    uploadDate: '2024-01-15',
    subject: 'Matemática',
    description: 'Material completo sobre álgebra linear'
  },
  {
    id: '2',
    name: 'História do Brasil.docx',
    type: 'docx',
    size: 1024000,
    uploadDate: '2024-01-14',
    subject: 'História',
    description: 'Resumo sobre o período colonial'
  },
  {
    id: '3',
    name: 'Vocabulário Inglês.txt',
    type: 'txt',
    size: 512000,
    uploadDate: '2024-01-13',
    subject: 'Inglês',
    description: 'Lista de palavras essenciais'
  }
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return (
        <div className="h-8 w-8 bg-red-500 text-white rounded flex items-center justify-center text-xs font-bold">
          PDF
        </div>
      );
    case 'docx':
    case 'doc':
      return (
        <div className="h-8 w-8 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold">
          W
        </div>
      );
    default:
       return <FileText className="h-8 w-8 text-blue-500" />;
   }
};

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
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [showFilters, setShowFilters] = useState(false);

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || material.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleUpload = (uploadedMaterial: UploadedMaterial) => {
    const newMaterial: Material = {
      id: `material-${Date.now()}`,
      title: uploadedMaterial.title,
      type: uploadedMaterial.type,
      size: uploadedMaterial.size,
      uploadDate: new Date().toISOString().split('T')[0],
      subject: uploadedMaterial.subject || 'Geral',
      description: uploadedMaterial.description || '',
      file: uploadedMaterial.file
    };
    
    setMaterials(prev => [newMaterial, ...prev]);
    setShowUpload(false);
  };

  const handleDelete = (materialId: string) => {
    setMaterials(prev => prev.filter(m => m.id !== materialId));
  };

  const handleViewDetails = (material: Material) => {
    setSelectedMaterial(material);
    setShowDetails(true);
  };

  const handlePreview = (material: Material) => {
    setPreviewMaterial(material);
    setShowPreview(true);
  };

  const handleDownload = (material: Material) => {
    // Simular download do arquivo
    console.log('Downloading:', material.title);
    // Em uma implementação real, aqui seria feito o download do arquivo
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-jakarta font-bold text-slate-900">Materiais</h1>
          <p className="text-gray-600">
            Gerencie seus documentos para criação de provas personalizadas
          </p>
        </div>
        <Button 
          onClick={() => setShowUpload(true)}
          className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
        >
          <Upload className="h-4 w-4 mr-2" />
          Adicionar Material
        </Button>
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
                  placeholder="Buscar materiais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Modern Controls Section */}
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-4 border border-purple-100/50 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">

                {/* File Type Filter */}
                <div className="space-y-2">
  
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[180px] bg-white/80 border-blue-200 hover:border-blue-300 transition-colors shadow-sm">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="pdf">📄 PDF</SelectItem>
                      <SelectItem value="docx">📝 Word</SelectItem>
                      <SelectItem value="txt">📃 Texto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Toggle */}
                <div className="flex border border-purple-200 rounded-lg p-1 ml-auto bg-white/80 shadow-sm">
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
                    onClick={() => setViewMode("cards")}
                    className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                      viewMode === "cards" 
                        ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm" 
                        : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    <Grid className="w-4 h-4 mr-1" />
                    Cards
                  </Button>
                </div>
              </div>
            </div>
          </div>


        </CardContent>
      </Card>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
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
      ) : (
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
                                <span className="text-lg">{getFileIcon(material.type)}</span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 hover:text-purple-600 transition-colors">
                                  {material.title || material.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {material.description || 'Sem descrição'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-xs">
                              {material.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-gray-700">
                            {formatFileSize(material.size)}
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {material.uploadDate}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreview(material)}
                                className="p-1 h-auto text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
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
                <Card key={material.id} className="group border-0 bg-white/70 card-custom-shadow hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">{getFileIcon(material.type)}</span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-slate-900 line-clamp-1">
                            {material.title || material.name}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(material)}
                          className="p-1 h-auto text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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
                        {material.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(material.size)}
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
                          Upload: {material.uploadDate}
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
              <span className="text-2xl">{selectedMaterial && getFileIcon(selectedMaterial.type)}</span>
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
                  <p className="text-sm text-slate-600 mt-1">{selectedMaterial.type.toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Tamanho</Label>
                  <p className="text-sm text-slate-600 mt-1">{formatFileSize(selectedMaterial.size)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Data de Upload</Label>
                  <p className="text-sm text-slate-600 mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(selectedMaterial.uploadDate).toLocaleDateString('pt-BR')}
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

      {/* Material Preview Dialog */}
      {previewMaterial && (
        <MaterialPreview
          material={previewMaterial}
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setPreviewMaterial(null);
          }}
        />
      )}
      </div>
    </Layout>
  );
}