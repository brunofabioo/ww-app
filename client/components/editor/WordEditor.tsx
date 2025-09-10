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
import { useIsMobile } from '@/hooks/use-mobile'
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

const defaultContent = ``

export function WordEditor({ initialContent = defaultContent, onSave, onContentChange, className }: WordEditorProps) {
  console.log("WordEditor recebeu initialContent:", initialContent);
  console.log("Tamanho do initialContent:", initialContent?.length || 0, "caracteres");
  
  const isMobile = useIsMobile()
  const [zoom, setZoom] = useState(isMobile ? 60 : 100)
  const [wordCount, setWordCount] = useState(0)
  const [pageCount] = useState(1) // Por simplicidade, vamos começar com 1 página
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isGeneratingWord, setIsGeneratingWord] = useState(false)
  const { toast } = useToast()
  const editorRef = useRef<HTMLDivElement>(null)
  const isUpdatingContentRef = useRef(false)

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
      
      // Chamar onContentChange quando o conteúdo mudar, mas não durante atualizações programáticas
      if (onContentChange && !isUpdatingContentRef.current) {
        const content = editor.getHTML()
        // Usar setTimeout para evitar interferir com a posição do cursor
        setTimeout(() => {
          onContentChange(content)
        }, 0)
      }
    },
  })

  // Atualizar zoom quando a detecção de mobile mudar
  useEffect(() => {
    setZoom(isMobile ? 60 : 100)
  }, [isMobile])

  // Atualizar conteúdo do editor quando initialContent mudar
  useEffect(() => {
    if (editor && initialContent !== undefined) {
      console.log("Atualizando conteúdo do editor com:", initialContent);
      
      // Verificar se o conteúdo atual é diferente do novo conteúdo
      const currentContent = editor.getHTML();
      if (currentContent !== initialContent) {
        // Marcar que estamos fazendo uma atualização programática
        isUpdatingContentRef.current = true;
        
        // Salvar a posição atual do cursor
        const { from, to } = editor.state.selection;
        
        // Atualizar o conteúdo
        editor.commands.setContent(initialContent, false, {
          preserveWhitespace: 'full'
        });
        
        // Restaurar a posição do cursor se possível
        try {
          // Verificar se a posição ainda é válida no novo documento
          const docSize = editor.state.doc.content.size;
          if (from <= docSize && to <= docSize) {
            editor.commands.setTextSelection({ from, to });
          } else {
            // Se a posição não for válida, colocar o cursor no final
            editor.commands.focus('end');
          }
        } catch (error) {
          // Em caso de erro, apenas focar no editor
          editor.commands.focus();
        }
        
        // Resetar a flag após um pequeno delay
        setTimeout(() => {
          isUpdatingContentRef.current = false;
        }, 100);
      }
      
      // Chamar onContentChange com o novo conteúdo apenas se não for uma atualização programática
      if (onContentChange && initialContent !== '' && !isUpdatingContentRef.current) {
        onContentChange(initialContent);
      }
    }
  }, [editor, initialContent]); // Removido onContentChange das dependências

  // Auto-save functionality
  useEffect(() => {
    if (!editor || !onSave) return

    const saveInterval = setInterval(() => {
      const content = editor.getHTML()
      // Só salvar se o conteúdo não estiver vazio
      if (content && content.trim() !== '' && content !== '<p></p>') {

        onSave(content)
      } else {

      }
    }, 5000) // Auto-save a cada 5 segundos

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
      tempDiv.style.padding = '0 20mm 20mm 20mm' // top right bottom left
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.fontFamily = 'Arial, sans-serif'
      tempDiv.style.fontSize = '12pt'
      tempDiv.style.lineHeight = '1.4'
      tempDiv.style.boxSizing = 'border-box'
      
      // Adicionar estilos específicos para PDF
      tempDiv.style.boxShadow = 'none'
      tempDiv.style.border = 'none'
      
      document.body.appendChild(tempDiv)
      
      // Aguardar um momento para o DOM ser renderizado
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Obter a altura real do conteúdo renderizado
      const actualHeight = tempDiv.scrollHeight
      
      // Converter para canvas usando html2canvas com dimensões corretas
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Maior qualidade
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // 210mm em pixels (210 * 3.7795275591)
        height: actualHeight, // Usar altura real do conteúdo
        scrollX: 0,
        scrollY: 0
      })
      
      // Remover o elemento temporário
      document.body.removeChild(tempDiv)
      
      // Criar PDF usando jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Dimensões da página A4 em mm
      const pageWidth = 210
      const pageHeight = 297
      const marginTop = 15
      const marginBottom = 15
      const contentHeight = pageHeight - marginTop - marginBottom
      
      // Calcular dimensões da imagem baseado na altura real
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * pageWidth) / canvas.width
      
      // Se o conteúdo cabe em uma página
      if (imgHeight <= contentHeight) {
        pdf.addImage(
          canvas, 
          'JPEG', 
          0, 
          marginTop, 
          imgWidth, 
          imgHeight,
          undefined,
          'FAST'
        )
      } else {
        // Dividir em múltiplas páginas apenas se necessário
        const pixelsPerMM = canvas.width / pageWidth
        const contentHeightInPixels = contentHeight * pixelsPerMM
        const totalPages = Math.ceil(canvas.height / contentHeightInPixels)
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage()
          }
          
          // Calcular a posição Y para cada página no canvas original
          const sourceY = i * contentHeightInPixels
          const sourceHeight = Math.min(
            contentHeightInPixels,
            canvas.height - sourceY
          )
          
          // Verificar se há conteúdo real para esta página
          if (sourceHeight <= 10) { // Margem mínima para considerar conteúdo válido
            break // Evitar páginas em branco
          }
          
          // Criar canvas temporário para esta página
          const pageCanvas = document.createElement('canvas')
          const pageCtx = pageCanvas.getContext('2d')
          
          pageCanvas.width = canvas.width
          pageCanvas.height = sourceHeight
          
          if (pageCtx) {
            // Preencher com fundo branco
            pageCtx.fillStyle = '#ffffff'
            pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
            
            // Desenhar o conteúdo da página
            pageCtx.drawImage(
              canvas,
              0, sourceY, canvas.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            )
            
            const pageImgHeight = sourceHeight / pixelsPerMM
            
            // Adicionar imagem com margem superior
            pdf.addImage(
              pageCanvas,
              'JPEG',
              0,
              marginTop,
              pageWidth,
              pageImgHeight,
              undefined,
              'FAST'
            )
          }
        }
      }
      
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
      
      <div className={`flex-1 overflow-auto bg-gray-100 p-1 sm:p-4 ${isMobile ? 'word-editor-background-mobile' : ''}`}>
        <ContextMenu>
          <ContextMenuTrigger>
              <div 
                ref={editorRef}
                className={`bg-white shadow-lg transition-transform duration-200 ${isMobile ? 'ml-0' : 'mx-auto'}`}
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: isMobile ? 'top left' : 'top center',
                  width: '210mm',
                  minHeight: '297mm'
                }}
            >
              <EditorContent 
                editor={editor} 
                className="min-h-full focus:outline-none editor-content-mobile"
                style={{ padding: '20mm' }}
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