import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Trash2, Download, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface Template {
  id: string
  name: string
  description: string
  category: 'prova' | 'atividade' | 'exercicio' | 'avaliacao' | 'personalizado'
  content: string
  createdAt: Date
  isCustom: boolean
}

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void
  currentContent?: string
}

// Templates predefinidos
const predefinedTemplates: Template[] = [
  {
    id: 'prova-matematica',
    name: 'Prova de Matemática',
    description: 'Template padrão para provas de matemática com cabeçalho e instruções',
    category: 'prova',
    isCustom: false,
    createdAt: new Date(),
    content: `
<div style="max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; min-height: 297mm; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">PROVA DE MATEMÁTICA</h1>
    <p style="margin-bottom: 5px;"><strong>Disciplina:</strong> Matemática | <strong>Série:</strong> 9º Ano | <strong>Data:</strong> ___/___/______</p>
    <p style="margin-bottom: 5px;"><strong>Nome:</strong> ________________________________________________</p>
    <p><strong>Turma:</strong> _______ | <strong>Número:</strong> _______</p>
  </div>

  <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background-color: #f9f9f9;">
    <h3 style="margin-bottom: 10px; font-weight: bold;">INSTRUÇÕES:</h3>
    <ul style="margin-left: 20px;">
      <li>Leia atentamente todas as questões antes de respondê-las.</li>
      <li>Use caneta azul ou preta para as respostas.</li>
      <li>Não é permitido o uso de calculadora.</li>
      <li>Tempo de prova: 2 horas.</li>
      <li>Mantenha sua prova organizada e com letra legível.</li>
    </ul>
  </div>

  <div style="margin-bottom: 30px;">
    <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">QUESTÕES</h2>
    
    <div style="margin-bottom: 25px;">
      <p style="margin-bottom: 10px;"><strong>1.</strong> Resolva a equação do segundo grau: x² - 5x + 6 = 0</p>
      <p style="margin: 0;">Resposta:</p>
      <div style="height: 80px; border-bottom: 1px solid #ccc; margin-bottom: 10px;"></div>
    </div>
  </div>
</div>`
  },
  {
    id: 'atividade-portugues',
    name: 'Atividade de Português',
    description: 'Template para atividades de língua portuguesa',
    category: 'atividade',
    isCustom: false,
    createdAt: new Date(),
    content: `
<div style="max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; min-height: 297mm; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">ATIVIDADE DE PORTUGUÊS</h1>
    <p style="margin-bottom: 5px;"><strong>Disciplina:</strong> Língua Portuguesa | <strong>Série:</strong> _____ | <strong>Data:</strong> ___/___/______</p>
    <p style="margin-bottom: 5px;"><strong>Nome:</strong> ________________________________________________</p>
    <p><strong>Turma:</strong> _______ | <strong>Professor(a):</strong> _______________________</p>
  </div>

  <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #3b82f6; background-color: #f8fafc;">
    <h3 style="margin-bottom: 10px; font-weight: bold; color: #1e40af;">OBJETIVO:</h3>
    <p style="margin: 0;">Desenvolver habilidades de leitura, interpretação e produção textual.</p>
  </div>

  <div style="margin-bottom: 30px;">
    <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">ATIVIDADES</h2>
    
    <div style="margin-bottom: 25px;">
      <p style="margin-bottom: 10px;"><strong>1.</strong> Leia o texto abaixo e responda às questões:</p>
      <div style="padding: 15px; border: 1px solid #e5e7eb; background-color: #f9fafb; margin: 10px 0;">
        <p style="margin: 0; font-style: italic;">"Insira aqui o texto para leitura..."</p>
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: 'exercicio-ciencias',
    name: 'Exercícios de Ciências',
    description: 'Template para exercícios práticos de ciências',
    category: 'exercicio',
    isCustom: false,
    createdAt: new Date(),
    content: `
<div style="max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; min-height: 297mm; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">EXERCÍCIOS DE CIÊNCIAS</h1>
    <p style="margin-bottom: 5px;"><strong>Disciplina:</strong> Ciências | <strong>Série:</strong> _____ | <strong>Data:</strong> ___/___/______</p>
    <p style="margin-bottom: 5px;"><strong>Nome:</strong> ________________________________________________</p>
    <p><strong>Turma:</strong> _______ | <strong>Professor(a):</strong> _______________________</p>
  </div>

  <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #10b981; background-color: #f0fdf4;">
    <h3 style="margin-bottom: 10px; font-weight: bold; color: #047857;">TEMA:</h3>
    <p style="margin: 0;">Insira aqui o tema dos exercícios (ex: Sistema Solar, Fotossíntese, etc.)</p>
  </div>

  <div style="margin-bottom: 30px;">
    <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">EXERCÍCIOS</h2>
    
    <div style="margin-bottom: 25px;">
      <p style="margin-bottom: 10px;"><strong>1.</strong> Complete as lacunas com as palavras corretas:</p>
      <p style="margin: 0; margin-left: 20px;">A _________ é o processo pelo qual as plantas produzem seu próprio _________.</p>
    </div>
  </div>
</div>`
  },
  {
    id: 'avaliacao-geral',
    name: 'Avaliação Geral',
    description: 'Template genérico para avaliações de qualquer disciplina',
    category: 'avaliacao',
    isCustom: false,
    createdAt: new Date(),
    content: `
<div style="max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; min-height: 297mm; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">AVALIAÇÃO</h1>
    <p style="margin-bottom: 5px;"><strong>Disciplina:</strong> _____________ | <strong>Série:</strong> _____ | <strong>Data:</strong> ___/___/______</p>
    <p style="margin-bottom: 5px;"><strong>Nome:</strong> ________________________________________________</p>
    <p><strong>Turma:</strong> _______ | <strong>Professor(a):</strong> _______________________</p>
  </div>

  <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #d1d5db; background-color: #f9fafb;">
    <h3 style="margin-bottom: 10px; font-weight: bold;">INSTRUÇÕES GERAIS:</h3>
    <ul style="margin-left: 20px;">
      <li>Leia todas as questões com atenção antes de responder.</li>
      <li>Responda com clareza e objetividade.</li>
      <li>Use caneta azul ou preta.</li>
      <li>Não é permitido o uso de corretor.</li>
    </ul>
  </div>

  <div style="margin-bottom: 30px;">
    <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">QUESTÕES</h2>
    
    <div style="margin-bottom: 25px;">
      <p style="margin-bottom: 10px;"><strong>1.</strong> Insira aqui a primeira questão:</p>
      <div style="height: 60px; border-bottom: 1px solid #ccc; margin-bottom: 10px;"></div>
    </div>
  </div>
</div>`
  }
]

// Funções para gerenciar templates personalizados no localStorage
const STORAGE_KEY = 'wordwise-custom-templates'

const getCustomTemplates = (): Template[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const templates = JSON.parse(stored)
    return templates.map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt)
    }))
  } catch {
    return []
  }
}

const saveCustomTemplate = (template: Template): void => {
  try {
    const existing = getCustomTemplates()
    const updated = [...existing, template]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Erro ao salvar template:', error)
  }
}

const deleteCustomTemplate = (templateId: string): void => {
  try {
    const existing = getCustomTemplates()
    const updated = existing.filter(t => t.id !== templateId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Erro ao deletar template:', error)
  }
}

export function TemplateSelector({ onSelectTemplate, currentContent }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customTemplates, setCustomTemplates] = useState<Template[]>([])
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setCustomTemplates(getCustomTemplates())
  }, [isOpen])

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template)
    setIsOpen(false)
    toast({
      title: "Template aplicado",
      description: `Template "${template.name}" foi aplicado com sucesso.`,
    })
  }

  const handleSaveAsTemplate = () => {
    if (!currentContent || !newTemplateName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do template é obrigatório.",
        variant: "destructive"
      })
      return
    }

    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim() || 'Template personalizado',
      category: 'personalizado',
      content: currentContent,
      createdAt: new Date(),
      isCustom: true
    }

    saveCustomTemplate(newTemplate)
    setCustomTemplates(prev => [...prev, newTemplate])
    setNewTemplateName('')
    setNewTemplateDescription('')
    setShowSaveDialog(false)
    
    toast({
      title: "Template salvo",
      description: `Template "${newTemplate.name}" foi salvo com sucesso.`,
    })
  }

  const handleDeleteTemplate = (templateId: string) => {
    deleteCustomTemplate(templateId)
    setCustomTemplates(prev => prev.filter(t => t.id !== templateId))
    toast({
      title: "Template removido",
      description: "Template foi removido com sucesso.",
    })
  }

  const getCategoryColor = (category: Template['category']) => {
    const colors = {
      prova: 'bg-red-100 text-red-800',
      atividade: 'bg-blue-100 text-blue-800',
      exercicio: 'bg-green-100 text-green-800',
      avaliacao: 'bg-purple-100 text-purple-800',
      personalizado: 'bg-gray-100 text-gray-800'
    }
    return colors[category]
  }

  const getCategoryLabel = (category: Template['category']) => {
    const labels = {
      prova: 'Prova',
      atividade: 'Atividade',
      exercicio: 'Exercício',
      avaliacao: 'Avaliação',
      personalizado: 'Personalizado'
    }
    return labels[category]
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Templates</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Selecionar Template</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="predefined" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predefined">Templates Predefinidos</TabsTrigger>
            <TabsTrigger value="custom">Meus Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predefined" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predefinedTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSelectTemplate(template)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge className={getCategoryColor(template.category)}>
                          {getCategoryLabel(template.category)}
                        </Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Usar Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="custom" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Meus Templates Personalizados</h3>
                <Button onClick={() => setShowSaveDialog(true)} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Salvar Atual
                </Button>
              </div>
              
              {showSaveDialog && (
                <Card className="p-4 border-dashed">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="template-name">Nome do Template</Label>
                      <Input
                        id="template-name"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="Ex: Minha Prova de História"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-description">Descrição (opcional)</Label>
                      <Textarea
                        id="template-description"
                        value={newTemplateDescription}
                        onChange={(e) => setNewTemplateDescription(e.target.value)}
                        placeholder="Descreva o template..."
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveAsTemplate} size="sm">
                        Salvar Template
                      </Button>
                      <Button onClick={() => setShowSaveDialog(false)} variant="outline" size="sm">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              
              <ScrollArea className="h-[300px] pr-4">
                {customTemplates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum template personalizado encontrado.</p>
                    <p className="text-sm">Salve o documento atual como template para começar.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customTemplates.map((template) => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Badge className={getCategoryColor(template.category)}>
                              {getCategoryLabel(template.category)}
                            </Badge>
                          </div>
                          <CardDescription>{template.description}</CardDescription>
                          <p className="text-xs text-muted-foreground">
                            Criado em {template.createdAt.toLocaleDateString()}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleSelectTemplate(template)}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Usar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTemplate(template.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}