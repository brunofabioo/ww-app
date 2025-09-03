import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { Color } from '@tiptap/extension-color'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { History } from '@tiptap/extension-history'
import { useEffect, useState, useCallback, useRef } from 'react'
import { WordToolbar } from './WordToolbar'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Template } from './TemplateSelector'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

interface WordEditorProps {
  initialContent?: string
  onSave?: (content: string) => void
  onContentChange?: (content: string) => void
  className?: string
}

// Extensão customizada para tamanho de fonte
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {}
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          }
        },
      },
    }
  },
  
  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
      },
    }
  },
})

const defaultContent = `
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
      <div style="margin-left: 20px;">
        <p>a) x = 2 e x = 3</p>
        <p>b) x = 1 e x = 6</p>
        <p>c) x = -2 e x = -3</p>
        <p>d) x = 0 e x = 5</p>
      </div>
    </div>

    <div style="margin-bottom: 25px;">
      <p style="margin-bottom: 10px;"><strong>2.</strong> Calcule o valor de √144 + √81:</p>
      <div style="margin-left: 20px;">
        <p>a) 15</p>
        <p>b) 21</p>
        <p>c) 18</p>
        <p>d) 12</p>
      </div>
    </div>

    <div style="margin-bottom: 25px;">
      <p style="margin-bottom: 15px;"><strong>3.</strong> Uma loja oferece 20% de desconto em todos os produtos. Se um produto custa R$ 150,00, qual será o preço final após o desconto?</p>
      <div style="margin-left: 20px; border-bottom: 1px solid #ccc; height: 80px;">
        <p style="color: #666; font-style: italic;">Espaço para cálculos e resposta:</p>
      </div>
    </div>

    <div style="margin-bottom: 25px;">
      <p style="margin-bottom: 10px;"><strong>4.</strong> Marque Verdadeiro (V) ou Falso (F):</p>
      <div style="margin-left: 20px;">
        <p>( ) O número π é aproximadamente 3,14</p>
        <p>( ) Todo número primo é ímpar</p>
        <p>( ) A soma dos ângulos internos de um triângulo é 180°</p>
        <p>( ) Zero é um número natural</p>
      </div>
    </div>

    <div style="margin-bottom: 25px;">
      <p style="margin-bottom: 15px;"><strong>5.</strong> Demonstre que a soma dos ângulos internos de um quadrilátero é 360°. Use o espaço abaixo para sua demonstração:</p>
      <div style="margin-left: 20px; border: 1px solid #ccc; height: 120px; padding: 10px;">
        <p style="color: #666; font-style: italic;">Espaço para demonstração:</p>
      </div>
    </div>
  </div>

  <div style="text-align: center; margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
    <p style="font-size: 12px; color: #666;">Página 1 de 1</p>
  </div>
</div>
`

export function WordEditor({ initialContent = defaultContent, onSave, onContentChange, className }: WordEditorProps) {
  const [zoom, setZoom] = useState(100)
  const [wordCount, setWordCount] = useState(0)
  const [pageCount] = useState(1) // Por simplicidade, vamos começar com 1 página
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isGeneratingWord, setIsGeneratingWord] = useState(false)
  const { toast } = useToast()
  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configurações padrão do StarterKit
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none word-editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      setWordCount(words)
      
      // Chamar onContentChange quando o conteúdo mudar
      if (onContentChange) {
        const content = editor.getHTML()
        onContentChange(content)
      }
    },
  })

  // Auto-save functionality
  useEffect(() => {
    if (!editor || !onSave) return

    const saveInterval = setInterval(() => {
      const content = editor.getHTML()
      onSave(content)
    }, 30000) // Auto-save a cada 30 segundos

    return () => clearInterval(saveInterval)
  }, [editor, onSave])

  // Keyboard shortcuts
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S para salvar
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault()
        if (onSave) {
          const content = editor.getHTML()
          onSave(content)
          toast({
            title: "Documento salvo",
            description: "Suas alterações foram salvas com sucesso.",
          })
        }
      }


    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editor, onSave, toast])

  const handleExportPDF = useCallback(async () => {
    if (!editor || !editorRef.current) return
    
    setIsGeneratingPDF(true)
    
    try {
      // Obter o conteúdo HTML do editor
      const content = editor.getHTML()
      
      // Criar um elemento temporário para renderizar o conteúdo
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '-9999px'
      tempDiv.style.width = '210mm'
      tempDiv.style.minHeight = '297mm'
      tempDiv.style.padding = '20mm'
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.fontFamily = 'Arial, sans-serif'
      tempDiv.style.fontSize = '12pt'
      tempDiv.style.lineHeight = '1.4'
      
      // Adicionar estilos específicos para PDF
      tempDiv.style.boxShadow = 'none'
      tempDiv.style.border = 'none'
      
      document.body.appendChild(tempDiv)
      
      // Aguardar um momento para o DOM ser renderizado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Converter para canvas usando html2canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Maior qualidade
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // 210mm em pixels (210 * 3.7795275591)
        scrollX: 0,
        scrollY: 0
      })
      
      // Remover o elemento temporário
      document.body.removeChild(tempDiv)
      
      // Criar PDF usando jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Calcular dimensões para ajustar ao A4
      const imgWidth = 210 // A4 width em mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Adicionar imagem ajustada ao tamanho da página
      pdf.addImage(
        canvas, 
        'JPEG', 
        0, 
        0, 
        imgWidth, 
        imgHeight,
        undefined,
        'FAST'
      )
      
      // Gerar nome do arquivo com timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const fileName = `prova-wordwise-${timestamp}.pdf`
      
      // Fazer download do PDF
      pdf.save(fileName)
      
      toast({
        title: "PDF gerado com sucesso!",
        description: `Arquivo "${fileName}" foi baixado.`,
        variant: "default",
      })
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }, [editor, toast])

  const handleExportWord = useCallback(async () => {
    if (!editor) return
    
    setIsGeneratingWord(true)
    
    try {
      // Obter o conteúdo HTML do editor
      const content = editor.getHTML()
      
      // Criar um elemento temporário para processar o HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      
      // Função para converter HTML para elementos do docx
      const convertHtmlToDocx = (element: Element): any[] => {
        const children: any[] = []
        
        for (const child of element.children) {
          if (child.tagName === 'H1') {
            children.push(
              new Paragraph({
                text: child.textContent || '',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400, before: 400 }
              })
            )
          } else if (child.tagName === 'H2') {
            children.push(
              new Paragraph({
                text: child.textContent || '',
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 300, before: 300 }
              })
            )
          } else if (child.tagName === 'H3') {
            children.push(
              new Paragraph({
                text: child.textContent || '',
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 200, before: 200 }
              })
            )
          } else if (child.tagName === 'P') {
            // Verificar se é uma lista
            if (child.querySelector('ul') || child.querySelector('ol')) {
              const listItems = child.querySelectorAll('li')
              listItems.forEach(item => {
                children.push(
                  new Paragraph({
                    text: item.textContent || '',
                    bullet: { level: 0 },
                    spacing: { after: 100 }
                  })
                )
              })
            } else {
              children.push(
                new Paragraph({
                  text: child.textContent || '',
                  spacing: { after: 200 }
                })
              )
            }
          } else if (child.tagName === 'UL' || child.tagName === 'OL') {
            const listItems = child.querySelectorAll('li')
            listItems.forEach(item => {
              children.push(
                new Paragraph({
                  text: item.textContent || '',
                  bullet: { level: 0 },
                  spacing: { after: 100 }
                })
              )
            })
          } else if (child.tagName === 'DIV') {
            // Processar divs recursivamente
            children.push(...convertHtmlToDocx(child))
          }
        }
        
        return children
      }
      
      // Converter o conteúdo HTML para elementos do docx
      const docxChildren = convertHtmlToDocx(tempDiv)
      
      // Criar o documento Word
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              size: {
                width: 11906, // A4 width em twips (21cm)
                height: 16838 // A4 height em twips (29.7cm)
              },
              margin: {
                top: 1440, // 2.5cm em twips
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: docxChildren
        }]
      })
      
      // Gerar o arquivo Word
      const blob = await Packer.toBlob(doc)
      
      // Gerar nome do arquivo com timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const fileName = `prova-wordwise-${timestamp}.docx`
      
      // Fazer download do arquivo Word
      saveAs(blob, fileName)
      
      toast({
        title: "Documento Word gerado com sucesso!",
        description: `Arquivo "${fileName}" foi baixado.`,
        variant: "default",
      })
      
    } catch (error) {
      console.error('Erro ao gerar Word:', error)
      toast({
        title: "Erro ao gerar Word",
        description: "Ocorreu um erro ao gerar o documento Word. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingWord(false)
    }
  }, [editor, toast])

  const handleTemplateSelect = useCallback((template: Template) => {
    if (editor) {
      editor.commands.setContent(template.content)
      toast({
        title: "Template aplicado",
        description: `Template "${template.name}" foi aplicado com sucesso.`,
      })
    }
  }, [editor, toast])

  const handleImportContent = useCallback((content: string) => {
    if (editor) {
      editor.commands.setContent(content)
    }
  }, [editor])

  const addQuestion = (type: 'multiple' | 'open' | 'truefalse') => {
    if (!editor) return

    let questionHTML = ''
    const questionNumber = '●' // Placeholder para numeração

    switch (type) {
      case 'multiple':
        questionHTML = `<div style="margin-bottom: 25px;"><p style="margin: 0 0 5px 0;"><strong>X .</strong> Digite aqui a pergunta da questão de múltipla escolha:</p><p style="margin: 0; margin-left: 20px;">a) Primeira alternativa</p><p style="margin: 0; margin-left: 20px;">b) Segunda alternativa</p><p style="margin: 0; margin-left: 20px;">c) Terceira alternativa</p><p style="margin: 0; margin-left: 20px;">d) Quarta alternativa</p></div>`
        break
      case 'truefalse':
        questionHTML = `<div style="margin-bottom: 25px;"><p style="margin: 0 0 5px 0;"><strong>X .</strong> Marque Verdadeiro (V) ou Falso (F):</p><p style="margin: 0; margin-left: 20px;">(     ) Primeira afirmação</p><p style="margin: 0; margin-left: 20px;">(     ) Segunda afirmação</p><p style="margin: 0; margin-left: 20px;">(     ) Terceira afirmação</p></div>`
        break
      case 'open':
        questionHTML = `<div style="margin-bottom: 25px;"><p style="margin: 0 0 5px 0;"><strong>X .</strong> Digite aqui a pergunta da questão aberta:</p><p style="margin: 0;">Resposta:</p></div>`
        break
    }

    editor.chain().focus().insertContent(questionHTML).run()
  }

  if (!editor) {
    return <div>Carregando editor...</div>
  }

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <div className="sticky top-0 z-50 bg-white">
        <WordToolbar
          editor={editor}
          zoom={zoom}
          onZoomChange={setZoom}
          wordCount={wordCount}
          pageCount={pageCount}
          onTemplateSelect={handleTemplateSelect}
          onImportContent={handleImportContent}
          onExportPDF={handleExportPDF}
          onExportWord={handleExportWord}
          isGeneratingPDF={isGeneratingPDF}
          isGeneratingWord={isGeneratingWord}
        />
      </div>
      
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <ContextMenu>
          <ContextMenuTrigger>
            <div 
              ref={editorRef}
              className="bg-white shadow-lg mx-auto transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                width: '210mm',
                minHeight: '297mm'
              }}
            >
              <EditorContent 
                editor={editor} 
                className="min-h-full p-8 focus:outline-none"
              />
            </div>
          </ContextMenuTrigger>
          
          <ContextMenuContent>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Adicionar Questão</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={() => addQuestion('multiple')}>
                  Múltipla Escolha
                </ContextMenuItem>
                <ContextMenuItem onClick={() => addQuestion('truefalse')}>
                  Verdadeiro/Falso
                </ContextMenuItem>
                <ContextMenuItem onClick={() => addQuestion('open')}>
                  Questão Aberta
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Inserir</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem 
                  onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                >
                  Tabela
                </ContextMenuItem>
                <ContextMenuItem 
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                  Linha horizontal
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  )
}