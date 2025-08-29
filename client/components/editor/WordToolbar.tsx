import { Editor } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List,
  ListOrdered,
  Table,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Type,
  Palette,
  Highlighter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { TemplateSelector, Template } from './TemplateSelector'
import AIIntegration from './AIIntegration'

interface WordToolbarProps {
  editor: Editor
  zoom: number
  onZoomChange: (zoom: number) => void
  wordCount: number
  pageCount: number
  onTemplateSelect?: (template: Template) => void
  onImportContent?: (content: string) => void
  onExportPDF?: () => void
  onExportWord?: () => void
  isGeneratingPDF?: boolean
  isGeneratingWord?: boolean
}

const fontSizes = [
  { label: "8pt", value: "8px" },
  { label: "9pt", value: "9px" },
  { label: "10pt", value: "10px" },
  { label: "11pt", value: "11px" },
  { label: "12pt", value: "12px" },
  { label: "14pt", value: "14px" },
  { label: "16pt", value: "16px" },
  { label: "18pt", value: "18px" },
  { label: "20pt", value: "20px" },
  { label: "24pt", value: "24px" },
  { label: "28pt", value: "28px" },
  { label: "32pt", value: "32px" },
]

const colors = [
  { name: "Preto", value: "#000000" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Laranja", value: "#f59e0b" },
  { name: "Cinza", value: "#6b7280" },
]

const highlightColors = [
  { name: "Amarelo", value: "#fef3c7" },
  { name: "Verde", value: "#d1fae5" },
  { name: "Azul", value: "#dbeafe" },
  { name: "Rosa", value: "#fce7f3" },
  { name: "Roxo", value: "#e9d5ff" },
  { name: "Laranja", value: "#fed7aa" },
]

export function WordToolbar({ 
  editor, 
  zoom, 
  onZoomChange, 
  wordCount, 
  pageCount, 
  onTemplateSelect, 
  onImportContent,
  onExportPDF,
  onExportWord,
  isGeneratingPDF = false,
  isGeneratingWord = false
}: WordToolbarProps) {
  const [selectionUpdate, setSelectionUpdate] = useState(0)
  
  if (!editor) return null

  // Detecta mudanças na seleção para atualizar os dropdowns
  useEffect(() => {
    if (!editor) return

    const updateSelection = () => {
      setSelectionUpdate(prev => prev + 1)
    }

    editor.on('selectionUpdate', updateSelection)
    editor.on('transaction', updateSelection)

    return () => {
      editor.off('selectionUpdate', updateSelection)
      editor.off('transaction', updateSelection)
    }
  }, [editor])

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  // Obtém os atributos atuais da seleção
  const currentAttributes = editor.getAttributes('textStyle')
  const currentFontFamily = currentAttributes.fontFamily || 'Inter'
  const currentFontSize = currentAttributes.fontSize || '12px'

  return (
    <div className="border-b border-border bg-background p-2 space-y-2">
      {/* Primeira linha - Formatação principal */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        {/* Fonte */}
        <Select
          value={currentFontFamily}
          onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}
        >
          <SelectTrigger className="w-32 sm:w-40">
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="Plus Jakarta Sans">Plus Jakarta Sans</SelectItem>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
          </SelectContent>
        </Select>

        {/* Tamanho da fonte */}
        <Select
          value={currentFontSize}
          onValueChange={(value) => editor.chain().focus().setFontSize(value).run()}
        >
          <SelectTrigger className="w-16 sm:w-20">
            <SelectValue placeholder="Tamanho" />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Formatação básica */}
        <div className="flex items-center gap-1">
          <Toggle
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label="Negrito"
            size="sm"
          >
            <Bold className="h-4 w-4" />
          </Toggle>

          <Toggle
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Itálico"
            size="sm"
          >
            <Italic className="h-4 w-4" />
          </Toggle>

          <Toggle
            pressed={editor.isActive('underline')}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Sublinhado"
            size="sm"
          >
            <Underline className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Cor do texto */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  onClick={() => editor.chain().focus().setColor(color.value).run()}
                  title={color.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Destacar texto */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="grid grid-cols-3 gap-2">
              {highlightColors.map((color) => (
                <button
                  key={color.value}
                  className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
                  title={color.name}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Alinhamento */}
        <div className="flex items-center gap-1">
          <Toggle
            pressed={editor.isActive({ textAlign: 'left' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
            aria-label="Alinhar à esquerda"
            size="sm"
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>

          <Toggle
            pressed={editor.isActive({ textAlign: 'center' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
            aria-label="Centralizar"
            size="sm"
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>

          <Toggle
            pressed={editor.isActive({ textAlign: 'right' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
            aria-label="Alinhar à direita"
            size="sm"
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>

          <Toggle
            pressed={editor.isActive({ textAlign: 'justify' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
            aria-label="Justificar"
            size="sm"
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Listas */}
        <div className="flex items-center gap-1">
          <Toggle
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Lista com marcadores"
            size="sm"
          >
            <List className="h-4 w-4" />
          </Toggle>

          <Toggle
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Lista numerada"
            size="sm"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Tabela */}
        <Button
          variant="outline"
          size="sm"
          onClick={addTable}
          className="w-8 h-8 p-0"
          aria-label="Inserir tabela"
        >
          <Table className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Desfazer/Refazer */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="w-8 h-8 p-0"
            aria-label="Desfazer"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="w-8 h-8 p-0"
            aria-label="Refazer"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Templates */}
        {onTemplateSelect && (
          <TemplateSelector
            onSelectTemplate={onTemplateSelect}
            currentContent={editor.getHTML()}
          />
        )}

        {/* AI Integration */}
        {onImportContent && (
          <AIIntegration
            currentContent={editor.getHTML()}
            onImportContent={onImportContent}
          />
        )}
      </div>

      {/* Segunda linha - Zoom e estatísticas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Controle de zoom */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(Math.max(50, zoom - 10))}
              className="w-7 h-7 sm:w-8 sm:h-8 p-0"
              aria-label="Diminuir zoom"
            >
              <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <div className="w-16 sm:w-20">
              <Slider
                value={[zoom]}
                onValueChange={([value]) => onZoomChange(value)}
                min={50}
                max={200}
                step={10}
                className="w-full"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onZoomChange(Math.min(200, zoom + 10))}
              className="w-7 h-7 sm:w-8 sm:h-8 p-0"
              aria-label="Aumentar zoom"
            >
              <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <span className="text-xs sm:text-sm text-muted-foreground min-w-[2.5rem] sm:min-w-[3rem]">
              {zoom}%
            </span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <span>Palavras: {wordCount}</span>
          <span>Páginas: {pageCount}</span>
        </div>

        {/* Botões de Exportação */}
        {(onExportPDF || onExportWord) && (
          <div className="flex items-center gap-2">
            <Separator orientation="vertical" className="h-6" />
            
            {onExportPDF && (
              <Button
                onClick={onExportPDF}
                disabled={isGeneratingPDF}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
              >
                {isGeneratingPDF ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    PDF...
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Exportar PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </>
                )}
              </Button>
            )}

            {onExportWord && (
              <Button
                onClick={onExportWord}
                disabled={isGeneratingWord}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
              >
                {isGeneratingWord ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Word...
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Exportar Word</span>
                    <span className="sm:hidden">Word</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}