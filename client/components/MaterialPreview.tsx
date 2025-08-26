import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  FileText,
  Download,
  Calendar,
  User,
  FileIcon,
  Eye,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'txt';
  size: number;
  uploadDate: string;
  subject: string;
  description?: string;
  file?: File;
}

interface MaterialPreviewProps {
  material: Material;
  isOpen: boolean;
  onClose: () => void;
}

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
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'docx':
      return <FileIcon className="h-5 w-5 text-blue-500" />;
    case 'txt':
      return <FileText className="h-5 w-5 text-green-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
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

export default function MaterialPreview({ material, isOpen, onClose }: MaterialPreviewProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canPreview, setCanPreview] = useState(false);

  useEffect(() => {
    if (isOpen && material) {
      setCanPreview(material.type === 'txt');
      if (material.type === 'txt' && material.file) {
        loadTextContent();
      } else {
        setContent('');
        setError(null);
      }
    }
  }, [isOpen, material]);

  const loadTextContent = async () => {
    if (!material.file) {
      setError('Arquivo não disponível para preview.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const text = await material.file.text();
      if (text.length > 10000) {
        setContent(text.substring(0, 10000) + '\n\n... (conteúdo truncado)');
      } else {
        setContent(text);
      }
    } catch (err) {
      setError('Erro ao carregar o conteúdo do arquivo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!material.file) {
      alert('Arquivo não disponível para download.');
      return;
    }

    const url = URL.createObjectURL(material.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = material.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(material.type)}
              <div>
                <DialogTitle className="text-xl">{material.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Badge className={getFileTypeColor(material.type)}>
                    {material.type.toUpperCase()}
                  </Badge>
                  <span>{formatFileSize(material.size)}</span>
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Informações do Material */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Informações do Material</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Matéria:</span>
                  <span className="text-sm">{material.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Upload:</span>
                  <span className="text-sm">{formatDate(material.uploadDate)}</span>
                </div>
              </div>
              {material.description && (
                <div>
                  <span className="text-sm font-medium">Descrição:</span>
                  <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview do Conteúdo */}
          <Card className="flex-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview do Conteúdo
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {!canPreview ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Preview não disponível
                  </h3>
                  <p className="text-gray-600 mb-4">
                    O preview está disponível apenas para arquivos de texto (.txt).
                    Para arquivos PDF e Word, use o botão de download.
                  </p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Arquivo
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Carregando conteúdo...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Erro ao carregar preview
                  </h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button variant="outline" onClick={loadTextContent}>
                    Tentar Novamente
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <pre className="text-sm whitespace-pre-wrap font-mono p-4 bg-gray-50 rounded-lg">
                    {content || 'Arquivo vazio'}
                  </pre>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}