import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Download, Upload, Bot, Copy, Check } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface AIIntegrationProps {
  currentContent: string;
  onImportContent: (content: string) => void;
}

interface ExamConfig {
  title: string;
  subject: string;
  difficulty: 'facil' | 'medio' | 'dificil';
  examType: 'prova' | 'atividade' | 'exercicio' | 'avaliacao';
  duration: number; // em minutos
  totalQuestions: number;
  questionTypes: string[];
  instructions: string;
  gradingCriteria: string;
}

interface StructuredContent {
  type: 'heading' | 'paragraph' | 'question' | 'answer' | 'list' | 'table';
  level?: number; // para headings
  content: string;
  attributes?: Record<string, any>;
  children?: StructuredContent[];
}

interface ExportData {
  config: ExamConfig;
  template: {
    structure: StructuredContent[];
    metadata: {
      createdAt: string;
      version: string;
      wordCount: number;
    };
  };
  aiInstructions: {
    task: string;
    format: string;
    requirements: string[];
    examples: any[];
  };
}

const AIIntegration: React.FC<AIIntegrationProps> = ({ currentContent, onImportContent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportData, setExportData] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [config, setConfig] = useState<ExamConfig>({
    title: 'Nova Prova',
    subject: 'Matemática',
    difficulty: 'medio',
    examType: 'prova',
    duration: 60,
    totalQuestions: 10,
    questionTypes: ['multipla_escolha', 'dissertativa'],
    instructions: 'Leia atentamente as questões antes de responder.',
    gradingCriteria: 'Cada questão vale 1 ponto.'
  });
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Função para converter HTML em estrutura JSON
  const parseHTMLToStructure = (html: string): StructuredContent[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const structure: StructuredContent[] = [];

    const processNode = (node: Node): StructuredContent | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          return {
            type: 'paragraph',
            content: text
          };
        }
        return null;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        let type: StructuredContent['type'] = 'paragraph';
        let level: number | undefined;
        
        switch (tagName) {
          case 'h1': type = 'heading'; level = 1; break;
          case 'h2': type = 'heading'; level = 2; break;
          case 'h3': type = 'heading'; level = 3; break;
          case 'h4': type = 'heading'; level = 4; break;
          case 'h5': type = 'heading'; level = 5; break;
          case 'h6': type = 'heading'; level = 6; break;
          case 'p': type = 'paragraph'; break;
          case 'ul': case 'ol': type = 'list'; break;
          case 'table': type = 'table'; break;
          default: type = 'paragraph';
        }

        const children: StructuredContent[] = [];
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = processNode(node.childNodes[i]);
          if (child) children.push(child);
        }

        return {
          type,
          level,
          content: element.textContent || '',
          attributes: {
            className: element.className,
            id: element.id
          },
          children: children.length > 0 ? children : undefined
        };
      }

      return null;
    };

    for (let i = 0; i < doc.body.childNodes.length; i++) {
      const processed = processNode(doc.body.childNodes[i]);
      if (processed) structure.push(processed);
    }

    return structure;
  };

  // Função para gerar dados de exportação
  const generateExportData = (): ExportData => {
    const structure = parseHTMLToStructure(currentContent);
    
    return {
      config,
      template: {
        structure,
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0',
          wordCount: currentContent.replace(/<[^>]*>/g, '').split(/\s+/).length
        }
      },
      aiInstructions: {
        task: `Gerar ${config.totalQuestions} questões de ${config.subject} com dificuldade ${config.difficulty}`,
        format: 'Seguir a estrutura do template fornecido',
        requirements: [
          `Tipo de prova: ${config.examType}`,
          `Duração: ${config.duration} minutos`,
          `Tipos de questão: ${config.questionTypes.join(', ')}`,
          `Critérios de avaliação: ${config.gradingCriteria}`,
          'Manter formatação HTML compatível com o editor',
          'Incluir gabarito quando aplicável'
        ],
        examples: [
          {
            input: 'Questão de múltipla escolha',
            output: '<h3>Questão 1</h3><p>Qual é o resultado de 2 + 2?</p><p>a) 3</p><p>b) 4</p><p>c) 5</p><p>d) 6</p>'
          },
          {
            input: 'Questão dissertativa',
            output: '<h3>Questão 2</h3><p>Explique o conceito de função quadrática e forneça um exemplo.</p><p><em>Resposta esperada: (espaço para resposta)</em></p>'
          }
        ]
      }
    };
  };

  // Função para exportar dados
  const handleExport = () => {
    const data = generateExportData();
    const jsonString = JSON.stringify(data, null, 2);
    setExportData(jsonString);
    
    // Também criar arquivo para download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.replace(/\s+/g, '_')}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Dados exportados',
      description: 'Arquivo JSON baixado com sucesso!'
    });
  };

  // Função para copiar dados de exportação
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copiado!',
        description: 'Dados copiados para a área de transferência'
      });
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar os dados',
        variant: 'destructive'
      });
    }
  };

  // Função para importar dados
  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      
      // Validar estrutura básica
      if (!data.template || !data.template.structure) {
        throw new Error('Estrutura de template inválida');
      }
      
      // Converter estrutura de volta para HTML
      const convertToHTML = (structure: StructuredContent[]): string => {
        return structure.map(item => {
          let tag = 'p';
          
          switch (item.type) {
            case 'heading':
              tag = `h${item.level || 2}`;
              break;
            case 'paragraph':
              tag = 'p';
              break;
            case 'list':
              tag = 'ul';
              break;
            case 'table':
              tag = 'table';
              break;
          }
          
          const children = item.children ? convertToHTML(item.children) : '';
          return `<${tag}>${item.content}${children}</${tag}>`;
        }).join('');
      };
      
      const htmlContent = convertToHTML(data.template.structure);
      onImportContent(htmlContent);
      
      // Atualizar configurações se fornecidas
      if (data.config) {
        setConfig(data.config);
      }
      
      setIsOpen(false);
      setImportData('');
      
      toast({
        title: 'Importação concluída',
        description: 'Conteúdo importado com sucesso!'
      });
    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: 'Formato JSON inválido ou incompatível',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bot className="h-4 w-4" />
          <span className="hidden sm:inline">IA</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Integração com IA
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Exportar para IA</TabsTrigger>
            <TabsTrigger value="import">Importar da IA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Prova</CardTitle>
                <CardDescription>
                  Configure os parâmetros que a IA usará para gerar o conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={config.title}
                      onChange={(e) => setConfig({...config, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Matéria</Label>
                    <Input
                      id="subject"
                      value={config.subject}
                      onChange={(e) => setConfig({...config, subject: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <Select value={config.difficulty} onValueChange={(value: any) => setConfig({...config, difficulty: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facil">Fácil</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="dificil">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="examType">Tipo</Label>
                    <Select value={config.examType} onValueChange={(value: any) => setConfig({...config, examType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prova">Prova</SelectItem>
                        <SelectItem value="atividade">Atividade</SelectItem>
                        <SelectItem value="exercicio">Exercício</SelectItem>
                        <SelectItem value="avaliacao">Avaliação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="totalQuestions">Nº Questões</Label>
                    <Input
                      id="totalQuestions"
                      type="number"
                      value={config.totalQuestions}
                      onChange={(e) => setConfig({...config, totalQuestions: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="instructions">Instruções</Label>
                  <Textarea
                    id="instructions"
                    value={config.instructions}
                    onChange={(e) => setConfig({...config, instructions: e.target.value})}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-2">
              <Button onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar JSON
              </Button>
              {exportData && (
                <Button variant="outline" onClick={handleCopy} className="gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              )}
            </div>
            
            {exportData && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados Exportados</CardTitle>
                  <CardDescription>
                    JSON estruturado para enviar à IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={exportData}
                    readOnly
                    rows={10}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importar Conteúdo da IA</CardTitle>
                <CardDescription>
                  Cole o JSON modificado pela IA para importar o novo conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Cole aqui o JSON retornado pela IA..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <Button 
                  onClick={handleImport} 
                  disabled={!importData.trim()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Importar Conteúdo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AIIntegration;