import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaterialUploadProps {
  onClose: () => void;
  onUpload: (material: UploadedMaterial) => void;
}

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

interface FileWithPreview extends File {
  preview?: string;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_FILE_SIZE = 1024; // 1KB

// Magic numbers para validação de tipo de arquivo
const FILE_SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  docx: [0x50, 0x4B, 0x03, 0x04], // ZIP signature (DOCX é um ZIP)
  doc: [0xD0, 0xCF, 0x11, 0xE0], // OLE signature
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileType = (file: File): 'pdf' | 'docx' | 'txt' | null => {
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (file.type === 'application/msword') return 'docx';
  if (file.type === 'text/plain') return 'txt';
  
  // Fallback para extensão se MIME type não for detectado
  const extension = file.name.toLowerCase().split('.').pop();
  if (extension === 'pdf') return 'pdf';
  if (extension === 'docx' || extension === 'doc') return 'docx';
  if (extension === 'txt') return 'txt';
  
  return null;
};

// Função para verificar assinatura do arquivo
const checkFileSignature = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        resolve(false);
        return;
      }
      
      const uint8Array = new Uint8Array(arrayBuffer.slice(0, 8));
      const fileType = getFileType(file);
      
      if (fileType === 'txt') {
        // Para TXT, verificamos se é texto válido
        try {
          const text = new TextDecoder('utf-8', { fatal: true }).decode(uint8Array);
          resolve(true);
        } catch {
          resolve(false);
        }
        return;
      }
      
      if (fileType === 'pdf') {
        const pdfSignature = FILE_SIGNATURES.pdf;
        const matches = pdfSignature.every((byte, index) => uint8Array[index] === byte);
        resolve(matches);
        return;
      }
      
      if (fileType === 'docx') {
        // DOCX files start with ZIP signature
        const zipSignature = FILE_SIGNATURES.docx;
        const matches = zipSignature.every((byte, index) => uint8Array[index] === byte);
        resolve(matches);
        return;
      }
      
      resolve(false);
    };
    
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
};

const validateFile = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  // Verificar se o arquivo existe e tem nome
  if (!file || !file.name) {
    return {
      isValid: false,
      error: 'Arquivo inválido ou corrompido.'
    };
  }
  
  // Verificar tamanho mínimo
  if (file.size < MIN_FILE_SIZE) {
    return {
      isValid: false,
      error: `Arquivo muito pequeno. Tamanho mínimo: ${formatFileSize(MIN_FILE_SIZE)}`
    };
  }
  
  // Verificar tamanho máximo
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${formatFileSize(MAX_FILE_SIZE)}`
    };
  }
  
  // Verificar tipo de arquivo
  const fileType = getFileType(file);
  if (!fileType) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não suportado. Use apenas PDF, Word (.docx/.doc) ou TXT.'
    };
  }
  
  // Verificar nome do arquivo para caracteres perigosos
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(file.name)) {
    return {
      isValid: false,
      error: 'Nome do arquivo contém caracteres inválidos.'
    };
  }
  
  // Verificar assinatura do arquivo
  try {
    const isValidSignature = await checkFileSignature(file);
    if (!isValidSignature) {
      return {
        isValid: false,
        error: 'Arquivo corrompido ou tipo de arquivo incorreto.'
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Erro ao validar o arquivo. Tente novamente.'
    };
  }
  
  return { isValid: true };
};

export default function MaterialUpload({ onClose, onUpload }: MaterialUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      try {
        const validation = await validateFile(file);
        
        if (!validation.isValid) {
          setError(validation.error!);
          return;
        }
        
        setSelectedFile(file);
      } catch (error) {
        setError('Erro ao validar o arquivo. Tente novamente.');
      }
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        const validation = await validateFile(file);
        
        if (!validation.isValid) {
          setError(validation.error!);
          return;
        }
        
        setSelectedFile(file);
      } catch (error) {
        setError('Erro ao validar o arquivo. Tente novamente.');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      // Simular upload (em produção, aqui seria feita a chamada para a API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileType = getFileType(selectedFile)!;
      const uploadedMaterial: UploadedMaterial = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: fileType,
        size: selectedFile.size,
        uploadDate: new Date().toISOString().split('T')[0],
        subject: subject.trim() || undefined,
        description: description.trim() || undefined,
        file: selectedFile
      };
      
      onUpload(uploadedMaterial);
      onClose();
    } catch (err) {
      setError('Erro ao fazer upload do arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Adicionar Material</CardTitle>
              <CardDescription>
              Faça upload de PDF, Word (.docx/.doc) ou TXT para criar provas personalizadas
            </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Upload Area */}
          {!selectedFile ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Arraste e solte seu arquivo aqui
              </h3>
              <p className="text-gray-600 mb-4">
                ou clique para selecionar
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Selecionar Arquivo
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Formatos suportados: PDF, Word (.docx/.doc), TXT<br />
                Tamanho: {formatFileSize(MIN_FILE_SIZE)} - {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>
          ) : (
            /* Selected File Preview */
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedFile.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getFileTypeColor(getFileType(selectedFile)!)}>
                        {getFileType(selectedFile)!.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Metadata Form */}
          {selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Matéria (opcional)</Label>
                  <Input
                    id="subject"
                    placeholder="Ex: Matemática, História..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o conteúdo do material..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Adicionar Material
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}